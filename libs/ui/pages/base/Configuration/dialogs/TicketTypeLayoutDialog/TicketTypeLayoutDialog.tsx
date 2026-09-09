import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@serviceops/component';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/NoteAdd';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { alpha, Dialog, DialogActions } from '@mui/material';
import { ITicketType, ICustomField, ITicketTypeLayoutConfig } from '@serviceops/interfaces';
import {
  getDefaultLayoutConfig,
  mergeLayoutConfig,
  isCustomFieldKey,
} from '@serviceops/tickettypelayout';
import { CustomFieldFormDialog } from '../CustomFieldFormDialog';
import { SectionFormDialog } from '../SectionFormDialog';

// ── Types ──────────────────────────────────────────────────────────

type TabId = 'createTicket' | 'ticketDetails';

type DialogSection = {
  id: string;
  title: string;
  fields: string[];
  accessControl?: Record<string, boolean>;
};

const TAB_ORDER: TabId[] = ['createTicket', 'ticketDetails'];

const POOL_PANEL_WIDTH = 320;

// Map built-in section keys to their tab. Custom sections store their
// tab in layoutConfig.customSections[id].tab.
const SECTION_TO_TAB_MAP: Record<string, TabId> = {
  ticketInformation: 'createTicket',
  categorization: 'createTicket',
  description: 'createTicket',
  additionalDetails: 'createTicket',
  priorityAssignment: 'createTicket',
  auditInformation: 'createTicket',
  attachments: 'createTicket',
  infoBar: 'ticketDetails',
  sideBar: 'ticketDetails',
  ticketOptions: 'ticketDetails',
  assignment: 'ticketDetails',
  contactAndBilling: 'ticketDetails',
  reporting: 'ticketDetails',
  datesAndUsers: 'ticketDetails',
  additionalFields: 'ticketDetails',
};

const TAB_TO_FIELD_USE_FLAG: Record<TabId, '__createTicket__' | '__ticketDetails__'> = {
  createTicket: '__createTicket__',
  ticketDetails: '__ticketDetails__',
};

const columnLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  mb: 1,
};

// ── Props ──────────────────────────────────────────────────────────

export interface TicketTypeLayoutDialogProps {
  open: boolean;
  ticketType: ITicketType | null;
  /** All ticket types so the Add/Edit Custom Field dialog can show per-type checkboxes. */
  ticketTypes?: ITicketType[];
  onClose: () => void;
  /** Called with the canonical ITicketTypeLayoutConfig payload.
   *  The parent is responsible for persisting to the API via updateTicketType. */
  onSave: (layoutConfig: ITicketTypeLayoutConfig) => void;
  /** Called with the full customFields array whenever a field is added or edited.
   *  The parent should persist via updateTicketType({ customFields }). */
  onSaveCustomFields?: (fields: ICustomField[]) => void;
}

// ── Helpers ────────────────────────────────────────────────────────

function initialAvailableFields(customFields: ICustomField[], tab: TabId): ICustomField[] {
  return customFields.filter((cf) => {
    if (tab === 'createTicket') return cf.fieldUse?.__createTicket__;
    return cf.fieldUse?.__ticketDetails__;
  });
}

// Resolve the tab for a section ID — built-in keys use the static map,
// custom keys carry their tab in layoutConfig.customSections.
function resolveSectionTab(sectionId: string, layoutConfig: ITicketTypeLayoutConfig): TabId {
  if (sectionId in SECTION_TO_TAB_MAP) return SECTION_TO_TAB_MAP[sectionId];
  const custom = layoutConfig.customSections?.[sectionId];
  if (custom?.tab) return custom.tab;
  return 'createTicket';
}

// Build dialog sections directly from layoutConfig — no hardcoded section list.
// All built-in sections are always shown so users can drag fields into them.
// System fields are filtered from display — only custom fields (cf_*) appear
// inside sections. Sections with no custom fields show an empty drop zone.
function buildDialogSectionsFromConfig(
  layoutConfig: ITicketTypeLayoutConfig,
): Record<TabId, DialogSection[]> {
  const result: Record<TabId, DialogSection[]> = { createTicket: [], ticketDetails: [] };

  // Built-in createTicket sections
  const ctKeys: (keyof ITicketTypeLayoutConfig['createTicket'])[] = [
    'ticketInformation',
    'categorization',
    'description',
    'additionalDetails',
    'priorityAssignment',
    'auditInformation',
    'attachments',
  ];
  for (const key of ctKeys) {
    const cfg = layoutConfig.createTicket[key];
    if (!cfg) continue;
    const customOnly = (cfg.selectedFields ?? []).filter((f) => isCustomFieldKey(f));
    result.createTicket.push({
      id: key,
      title: cfg.sectionTitle ?? key,
      fields: customOnly,
      accessControl: cfg.accessControl,
    });
  }

  // Built-in ticketDetails sections
  const detailKeys: (keyof Omit<ITicketTypeLayoutConfig, 'createTicket' | 'customSections'>)[] = [
    'infoBar',
    'sideBar',
    'ticketOptions',
    'assignment',
    'contactAndBilling',
    'reporting',
    'datesAndUsers',
    'additionalFields',
    'ticketCore',
    'changeManagement',
    'vendorBug',
    'changeControl',
    'resolutionWorkaround',
  ];
  for (const key of detailKeys) {
    const cfg = layoutConfig[key];
    if (!cfg || !('selectedFields' in cfg)) continue;
    const customOnly = (cfg.selectedFields ?? []).filter((f) => isCustomFieldKey(f));
    result.ticketDetails.push({
      id: key,
      title: (cfg as { sectionTitle?: string }).sectionTitle ?? key,
      fields: customOnly,
      accessControl: (cfg as { accessControl?: Record<string, boolean> }).accessControl,
    });
  }

  // Custom sections (user-created)
  const { customSections } = layoutConfig;
  if (customSections) {
    for (const [id, cfg] of Object.entries(customSections)) {
      const tab: TabId = cfg.tab ?? 'createTicket';
      result[tab].push({
        id,
        title: cfg.title,
        fields: [...cfg.fields],
        accessControl: cfg.accessControl,
      });
    }
  }

  return result;
}

// ── Component ──────────────────────────────────────────────────────

export const TicketTypeLayoutDialog = ({
  open,
  ticketType,
  ticketTypes = [],
  onClose,
  onSave,
  onSaveCustomFields,
}: TicketTypeLayoutDialogProps) => {
  const [activeTabIdx, setActiveTabIdx] = useState<0 | 1>(0);
  const activeTab: TabId = TAB_ORDER[activeTabIdx];

  // Custom field dialogs
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<ICustomField | null>(null);

  // Section title editing (for inline editing of existing section titles)
  const [editingSection, setEditingSection] = useState<{ id: string; temp: string } | null>(null);
  const sectionTitleInputRef = useRef<HTMLInputElement>(null);

  // Add Section dialog
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);

  // Delete confirmation dialogs
  const [pendingDeleteField, setPendingDeleteField] = useState<{
    fieldName: string;
    displayName: string;
  } | null>(null);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<{
    sectionId: string;
    title: string;
  } | null>(null);

  // Initialize layout config from ticket type's saved config, or defaults
  const defaultConfig = useMemo(() => getDefaultLayoutConfig(), []);

  const [layoutConfig, setLayoutConfig] = useState<ITicketTypeLayoutConfig>(() => {
    if (ticketType?.layoutConfig) {
      return mergeLayoutConfig(ticketType.layoutConfig);
    }
    return defaultConfig;
  });

  // Track all custom fields (persisted + pending unsaved changes) so that
  // new/edited fields are visible in the left panel even before the parent
  // re-fetches from the API.
  const persistedFields = useMemo(() => ticketType?.customFields ?? [], [ticketType]);
  const [allCustomFields, setAllCustomFields] = useState<ICustomField[]>(persistedFields);
  const [availableFields, setAvailableFields] = useState<Record<TabId, ICustomField[]>>({
    createTicket: [],
    ticketDetails: [],
  });
  const initializedRef = useRef(false);

  // Sync local state from parent's fresh data when: (1) dialog first opens,
  // or (2) the parent re-fetches after a successful API save (page refresh).
  const lastSyncedFieldsRef = useRef<ICustomField[]>([]);
  const lastSyncedLayoutRef = useRef<ITicketTypeLayoutConfig | null>(null);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    // persistedFields is a new array reference whenever the parent passes
    // fresh ticketType data (after re-fetch). Compare by reference to detect
    // a real data change vs. just a re-render.
    const parentDataChanged = lastSyncedFieldsRef.current !== persistedFields;
    if (!initializedRef.current || parentDataChanged) {
      lastSyncedFieldsRef.current = persistedFields;
      setAllCustomFields(persistedFields);
      setAvailableFields({
        createTicket: initialAvailableFields(persistedFields, 'createTicket'),
        ticketDetails: initialAvailableFields(persistedFields, 'ticketDetails'),
      });
      initializedRef.current = true;
    }
  }, [open, persistedFields]);

  // Sync layoutConfig from parent's fresh data when ticketType changes
  // (e.g. after page refresh / re-fetch).
  useEffect(() => {
    if (!open) return;
    const freshLayout = ticketType?.layoutConfig ?? null;
    if (freshLayout && lastSyncedLayoutRef.current !== freshLayout) {
      lastSyncedLayoutRef.current = freshLayout;
      setLayoutConfig(mergeLayoutConfig(freshLayout));
    }
  }, [open, ticketType?.layoutConfig]);

  // Track whether a custom-field API save is in-flight
  const [customFieldSavePending, setCustomFieldSavePending] = useState(false);

  const triggerCustomFieldSave = useCallback(
    (fields: ICustomField[]) => {
      if (onSaveCustomFields) {
        setCustomFieldSavePending(true);
        Promise.resolve(onSaveCustomFields(fields)).finally(() => {
          setCustomFieldSavePending(false);
        });
      }
    },
    [onSaveCustomFields],
  );

  // ── Build dialog sections from layoutConfig ─────────────────────
  // No hardcoded section list — sections are derived entirely from the
  // layoutConfig's built-in keys + customSections bag.

  const [dialogSections, setDialogSections] = useState<Record<TabId, DialogSection[]>>(
    buildDialogSectionsFromConfig(layoutConfig),
  );

  // Sync dialog sections whenever layoutConfig changes (e.g. after parent
  // re-fetches following a successful save). This replaces the previous
  // static layoutSections-dependent sync.
  useEffect(() => {
    const sections = buildDialogSectionsFromConfig(layoutConfig);
    setDialogSections(sections);
  }, [layoutConfig]);

  // Fields from layoutConfig.selectedFields that are NOT in any section
  // for the current tab (used to populate the left panel "unassigned" list)
  const usedFieldKeysForCurrentTab = useMemo(() => {
    const keys = new Set<string>();
    for (const section of dialogSections[activeTab] ?? []) {
      for (const f of section.fields) {
        keys.add(f);
      }
    }
    return keys;
  }, [dialogSections, activeTab]);

  const currentSections = useMemo(
    () => dialogSections[activeTab] ?? [],
    [dialogSections, activeTab],
  );
  const currentAvailable = useMemo(
    () => availableFields[activeTab] ?? [],
    [availableFields, activeTab],
  );

  // Unassigned = custom fields for this tab that aren't placed in any section of this tab
  const unassignedFieldNames = useMemo(() => {
    return currentAvailable
      .filter((f) => !usedFieldKeysForCurrentTab.has(f.fieldKey))
      .map((f) => f.fieldName);
  }, [currentAvailable, usedFieldKeysForCurrentTab]);

  // ── Section Handlers ─────────────────────────────────────────────

  const handleAddSectionWithTitle = useCallback(
    (title: string, accessControl?: Record<string, boolean>) => {
      const id = `custom_${Date.now()}`;
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], { id, title, fields: [], accessControl }],
      }));

      // Also persist immediately to layoutConfig so it's not lost
      setLayoutConfig((prev) => {
        const next = { ...prev, customSections: { ...(prev.customSections ?? {}) } };
        next.customSections![id] = { title, fields: [], tab: activeTab, accessControl };
        return next;
      });
    },
    [activeTab],
  );

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      const tab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
      setDialogSections((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((s) => s.id !== sectionId),
      }));

      // Also remove from layoutConfig.customSections if it's a custom section
      if (sectionId.startsWith('custom_')) {
        setLayoutConfig((prev) => {
          if (!prev.customSections?.[sectionId]) return prev;
          const next = { ...prev, customSections: { ...prev.customSections } };
          delete next.customSections![sectionId];
          return next;
        });
      }
    },
    [activeTab],
  );

  const handleEditSectionTitleStart = useCallback((sectionId: string, title: string) => {
    setEditingSection({ id: sectionId, temp: title });
  }, []);

  const handleUpdateSectionTitle = useCallback(
    (sectionId: string, title: string) => {
      const tab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
      setDialogSections((prev) => ({
        ...prev,
        [tab]: prev[tab].map((s) => (s.id === sectionId ? { ...s, title } : s)),
      }));
    },
    [activeTab],
  );

  const handleEditSectionTitleSave = useCallback(() => {
    if (!editingSection) return;
    const newTitle = editingSection.temp.trim();
    if (newTitle) {
      handleUpdateSectionTitle(editingSection.id, newTitle);
    }
    setEditingSection(null);
  }, [editingSection, handleUpdateSectionTitle]);

  const handleEditSectionTitleCancel = useCallback(() => {
    setEditingSection(null);
  }, []);

  // ── Section Field Handlers ───────────────────────────────────────

  const handleAddFieldToSection = useCallback(
    (sectionId: string, fieldName: string) => {
      if (!fieldName) return;
      const targetTab = resolveSectionTab(sectionId, layoutConfig);
      // Find the custom field to get its fieldKey
      const customField = [...availableFields[targetTab]].find((f) => f.fieldName === fieldName);
      if (!customField) return;

      // Store the fieldKey (not fieldName) in sections — this is what
      // layoutConfig.selectedFields contains, and what consumers expect.
      const { fieldKey } = customField;

      setDialogSections((prev) => ({
        ...prev,
        [targetTab]: prev[targetTab].map((s) =>
          s.id === sectionId && !s.fields.includes(fieldKey)
            ? { ...s, fields: [...s.fields, fieldKey] }
            : s,
        ),
      }));
    },
    [availableFields, layoutConfig],
  );

  const handleRemoveFieldFromSection = useCallback(
    (sectionId: string, fieldKey: string) => {
      const sourceTab = resolveSectionTab(sectionId, layoutConfig);
      setDialogSections((prev) => ({
        ...prev,
        [sourceTab]: prev[sourceTab].map((s) =>
          s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f !== fieldKey) } : s,
        ),
      }));
    },
    [layoutConfig],
  );

  // ── Drag-and-Drop State ──────────────────────────────────────────

  const [dragItem, setDragItem] = useState<
    | { kind: 'available'; fieldKey: string; fieldName: string }
    | { kind: 'section'; sectionId: string; fieldKey: string; fieldName: string }
    | null
  >(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverLeft, setDragOverLeft] = useState(false);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

  // ── Drag-and-Drop Handlers ────────────────────────────────────────

  const handleDragStart = useCallback(
    (kind: 'available' | 'section', fieldKey: string, fieldName: string, sectionId?: string) => {
      setDragItem(
        kind === 'available'
          ? { kind: 'available', fieldKey, fieldName }
          : { kind: 'section', sectionId: sectionId!, fieldKey, fieldName },
      );
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
    setDragOverSection(null);
    setDragOverLeft(false);
    setDragOverField(null);
  }, []);

  const handleDragOverLeftPanel = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLeft(true);
    setDragOverSection(null);
  }, []);

  const handleDragLeaveLeftPanel = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLeft(false);
  }, []);

  const handleDropOnLeftPanel = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverLeft(false);
      if (!dragItem || dragItem.kind === 'available') return;
      // Move from section back to available — remove fieldKey from that section
      handleRemoveFieldFromSection(dragItem.sectionId, dragItem.fieldKey);
      handleDragEnd();
    },
    [dragItem, handleRemoveFieldFromSection, handleDragEnd],
  );

  const handleDragOverSection = useCallback((sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(sectionId);
    setDragOverLeft(false);
  }, []);

  const handleReorderFieldInSection = useCallback(
    (sectionId: string, fieldKey: string, direction: 'up' | 'down') => {
      const tab = resolveSectionTab(sectionId, layoutConfig);
      setDialogSections((prev) => {
        const tabSections = prev[tab];
        const section = tabSections.find((s) => s.id === sectionId);
        if (!section) return prev;
        const idx = section.fields.indexOf(fieldKey);
        if (idx === -1) return prev;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= section.fields.length) return prev;
        const next = { ...prev };
        next[tab] = tabSections.map((s) => {
          if (s.id !== sectionId) return s;
          const fields = [...s.fields];
          [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
          return { ...s, fields };
        });
        return next;
      });
    },
    [layoutConfig],
  );

  const handleDragLeaveSection = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSection(null);
    }
  }, []);

  const handleDropOnSection = useCallback(
    (sectionId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSection(null);
      if (!dragItem) return;

      const sourceTab =
        dragItem.kind === 'section'
          ? resolveSectionTab(dragItem.sectionId, layoutConfig)
          : activeTab;
      const targetTab = resolveSectionTab(sectionId, layoutConfig);

      if (dragItem.kind === 'available') {
        handleAddFieldToSection(sectionId, dragItem.fieldName);
      } else if (dragItem.kind === 'section') {
        if (dragItem.sectionId === sectionId) return;
        // Move between sections (same tab or cross-tab)
        setDialogSections((prev) => {
          const next = { ...prev };
          // Remove from source section
          next[sourceTab] = next[sourceTab].map((s) =>
            s.id === dragItem.sectionId
              ? { ...s, fields: s.fields.filter((f) => f !== dragItem.fieldKey) }
              : s,
          );
          // Add to target section
          next[targetTab] = next[targetTab].map((s) =>
            s.id === sectionId ? { ...s, fields: [...s.fields, dragItem.fieldKey] } : s,
          );
          return next;
        });
      }
      handleDragEnd();
    },
    [dragItem, activeTab, handleAddFieldToSection, handleDragEnd, layoutConfig],
  );

  const handleDropOnField = useCallback(
    (sectionId: string, targetIndex: number, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSection(null);
      if (!dragItem) return;

      const sourceTab =
        dragItem.kind === 'section'
          ? resolveSectionTab(dragItem.sectionId, layoutConfig)
          : activeTab;
      const targetTab = resolveSectionTab(sectionId, layoutConfig);

      if (dragItem.kind === 'available') {
        handleAddFieldToSection(sectionId, dragItem.fieldName);
      } else if (dragItem.kind === 'section') {
        if (dragItem.sectionId === sectionId) {
          // Reorder within same section
          setDialogSections((prev) => {
            const tabSections = prev[sourceTab];
            const sourceIdx = tabSections
              .find((s) => s.id === sectionId)
              ?.fields.indexOf(dragItem.fieldKey);
            if (sourceIdx === undefined || sourceIdx === -1 || sourceIdx === targetIndex)
              return prev;
            const next = { ...prev };
            next[sourceTab] = tabSections.map((s) => {
              if (s.id !== sectionId) return s;
              const fields = [...s.fields];
              const actualTarget = targetIndex > sourceIdx ? targetIndex - 1 : targetIndex;
              fields.splice(sourceIdx, 1);
              fields.splice(actualTarget, 0, dragItem.fieldKey);
              return { ...s, fields };
            });
            return next;
          });
        } else {
          // Move from one section to another at specific index (cross-tab or same tab)
          setDialogSections((prev) => {
            const next = { ...prev };
            // Remove from source section
            next[sourceTab] = next[sourceTab].map((s) => {
              if (s.id !== dragItem.sectionId) return s;
              return { ...s, fields: s.fields.filter((f) => f !== dragItem.fieldKey) };
            });
            // Insert into target section at specific index
            next[targetTab] = next[targetTab].map((s) => {
              if (s.id !== sectionId) return s;
              const fields = s.fields.filter((f) => f !== dragItem.fieldKey);
              const insertAt = Math.min(targetIndex, fields.length);
              fields.splice(insertAt, 0, dragItem.fieldKey);
              return { ...s, fields };
            });
            return next;
          });
        }
      }
      handleDragEnd();
    },
    [dragItem, activeTab, handleAddFieldToSection, handleDragEnd, layoutConfig],
  );

  const handleDragOverField = useCallback(
    (sectionId: string, index: number, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverField(`${sectionId}-${index}`);
      setDragOverSection(sectionId);
      setDragOverLeft(false);
    },
    [],
  );

  const handleDragLeaveField = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
  }, []);

  // ── Field CRUD ──────────────────────────────────────────────────

  const persistCustomFields = useCallback(
    (fields: ICustomField[]) => {
      setAllCustomFields(fields);
      triggerCustomFieldSave(fields);
    },
    [triggerCustomFieldSave],
  );

  const confirmDeleteField = useCallback(() => {
    if (!pendingDeleteField) return;
    const { fieldName } = pendingDeleteField;

    // Find the fieldKey to also remove from any section
    const cf = availableFields[activeTab].find((f) => f.fieldName === fieldName);
    const fieldKey = cf?.fieldKey ?? fieldName;
    const removedId = cf?.id;
    if (!removedId) {
      setPendingDeleteField(null);
      return;
    }

    const nextAvailable = {
      ...availableFields,
      [activeTab]: availableFields[activeTab].filter((f) => f.fieldName !== fieldName),
    };
    const nextAll = allCustomFields.filter((f) => f.id !== removedId);
    const nextSections: Record<TabId, DialogSection[]> = { ...dialogSections };
    for (const tab of TAB_ORDER) {
      nextSections[tab] = nextSections[tab].map((s) => ({
        ...s,
        fields: s.fields.filter((f) => f !== fieldKey),
      }));
    }

    setAvailableFields(nextAvailable);
    setAllCustomFields(nextAll);
    setDialogSections(nextSections);
    persistCustomFields(nextAll);
    setPendingDeleteField(null);
  }, [
    pendingDeleteField,
    activeTab,
    availableFields,
    allCustomFields,
    dialogSections,
    persistCustomFields,
  ]);

  // Called from delete icon click — opens the confirmation dialog
  const requestDeleteField = useCallback((fieldName: string, displayName: string) => {
    setPendingDeleteField({ fieldName, displayName });
  }, []);

  // Cancel the pending deletion
  const cancelDeleteField = useCallback(() => {
    setPendingDeleteField(null);
  }, []);

  // Section delete confirmation
  const confirmDeleteSection = useCallback(() => {
    if (!pendingDeleteSection) return;
    handleRemoveSection(pendingDeleteSection.sectionId);
    setPendingDeleteSection(null);
  }, [pendingDeleteSection, handleRemoveSection]);

  const requestDeleteSection = useCallback((sectionId: string, title: string) => {
    setPendingDeleteSection({ sectionId, title });
  }, []);

  const cancelDeleteSection = useCallback(() => {
    setPendingDeleteSection(null);
  }, []);

  const handleSaveCustomField = useCallback(
    (field: ICustomField) => {
      const tabsToUpdate: TabId[] = [];
      if (field.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (field.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      // Compute new arrays before setting any state so all updates are
      // consistent (avoiding nested state-setter calls inside updaters).
      const nextAvailable = { ...availableFields };
      for (const tab of tabsToUpdate) {
        const idx = nextAvailable[tab].findIndex((f) => f.fieldName === field.fieldName);
        if (idx >= 0) {
          nextAvailable[tab] = [...nextAvailable[tab]];
          nextAvailable[tab][idx] = field;
        } else {
          nextAvailable[tab] = [...nextAvailable[tab], field];
        }
      }
      const idx = allCustomFields.findIndex((f) => f.id === field.id);
      const nextAll =
        idx >= 0
          ? allCustomFields.map((f) => (f.id === field.id ? field : f))
          : [...allCustomFields, field];

      setAvailableFields(nextAvailable);
      setAllCustomFields(nextAll);
      persistCustomFields(nextAll);
      setAddFieldDialogOpen(false);
    },
    [activeTab, availableFields, allCustomFields, persistCustomFields],
  );

  const handleEditField = useCallback((field: ICustomField) => {
    setEditingField(field);
  }, []);

  const handleEditFieldSave = useCallback(
    (updated: ICustomField) => {
      const tabsToUpdate: TabId[] = [];
      if (updated.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (updated.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      const nextAvailable = { ...availableFields };
      for (const tab of tabsToUpdate) {
        const idx = nextAvailable[tab].findIndex((f) => f.fieldName === updated.fieldName);
        if (idx >= 0) {
          nextAvailable[tab] = [...nextAvailable[tab]];
          nextAvailable[tab][idx] = updated;
        }
      }
      const idx = allCustomFields.findIndex((f) => f.id === updated.id);
      const nextAll =
        idx >= 0
          ? allCustomFields.map((f) => (f.id === updated.id ? updated : f))
          : [...allCustomFields, updated];

      setAvailableFields(nextAvailable);
      setAllCustomFields(nextAll);
      persistCustomFields(nextAll);
      setEditingField(null);
    },
    [activeTab, availableFields, allCustomFields, persistCustomFields],
  );

  // ── Save ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Start from defaults (which contain all system fields), then overlay
    // dialog changes. The dialog only shows custom fields for built-in
    // sections, so we merge them with the defaults rather than replacing.
    const newConfig = mergeLayoutConfig(defaultConfig);

    // Persist customSections from dialog state
    newConfig.customSections = {};
    for (const tab of TAB_ORDER) {
      for (const section of dialogSections[tab]) {
        if (section.id.startsWith('custom_')) {
          newConfig.customSections![section.id] = {
            title: section.title,
            fields: [...section.fields],
            tab,
            accessControl: section.accessControl,
          };
        }
      }
    }

    // Write selectedFields + sectionTitle for built-in sections.
    // Only custom fields are shown in the dialog, so we append them to the
    // existing default system fields rather than replacing.
    for (const tab of TAB_ORDER) {
      for (const section of dialogSections[tab]) {
        if (section.id.startsWith('custom_')) continue;
        if (tab === 'createTicket') {
          const subKey = section.id as keyof typeof newConfig.createTicket;
          const sub = { ...newConfig.createTicket } as Record<string, any>;
          const existing = sub[subKey]?.selectedFields ?? [];
          const systemFields = existing.filter((f: string) => !isCustomFieldKey(f));
          const combined = [...systemFields, ...section.fields];
          sub[subKey] = {
            selectedFields: combined,
            sectionTitle: section.title,
            accessControl: section.accessControl,
          };
          newConfig.createTicket = sub as typeof newConfig.createTicket;
        } else {
          const existing = (newConfig as any)[section.id]?.selectedFields ?? [];
          const systemFields = existing.filter((f: string) => !isCustomFieldKey(f));
          (newConfig as any)[section.id] = {
            selectedFields: [...systemFields, ...section.fields],
            sectionTitle: section.title,
            accessControl: section.accessControl,
          };
        }
      }
    }

    // Merge with defaults to ensure completeness
    const merged = mergeLayoutConfig(newConfig);
    onSave(merged);
    onClose();
  };

  // ── JSX ───────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      slotProps={{
        transition: { unmountOnExit: true },
        paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: '#0369a1',
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ViewQuiltIcon sx={{ color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            Ticket Screen Layout
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
            {ticketType ? `Configure fields for ${ticketType.displayName || ticketType.name}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTabIdx}
          onChange={(_, v) => setActiveTabIdx(v)}
          variant='fullWidth'
          sx={{ px: 2 }}
        >
          <Tab
            icon={<CreateIcon />}
            iconPosition='start'
            label='Create Ticket'
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab
            icon={<ViewQuiltIcon />}
            iconPosition='start'
            label='Ticket Details'
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      {/* Two-column layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          maxHeight: 520,
          overflow: 'hidden',
        }}
      >
        {/* Left Panel: Fields */}
        <Box
          draggable={false}
          onDragOver={handleDragOverLeftPanel}
          onDragLeave={handleDragLeaveLeftPanel}
          onDrop={handleDropOnLeftPanel}
          sx={{
            width: { xs: '100%', md: `${POOL_PANEL_WIDTH}px` },
            minWidth: { xs: 0, md: `${POOL_PANEL_WIDTH}px` },
            borderRight: { md: '1px solid rgba(226, 232, 255, 0.9)' },
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 280, md: 520 },
            bgcolor: 'background.paper',
            ...(dragOverLeft && {
              bgcolor: 'rgba(3, 105, 161, 0.04)',
              outline: '2px dashed rgba(3, 105, 161, 0.3)',
              outlineOffset: -2,
            }),
          }}
        >
          {/* Fields header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={columnLabelSx}>
              {activeTab === 'createTicket' ? 'Create Ticket Fields' : 'Ticket Detail Fields'}
            </Typography>
            <Tooltip title='Add New Field'>
              <IconButton
                size='small'
                onClick={() => setAddFieldDialogOpen(true)}
                disabled={customFieldSavePending}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Available fields list */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {unassignedFieldNames.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  color: 'text.disabled',
                  fontSize: '0.8rem',
                }}
              >
                No fields added yet
              </Box>
            ) : (
              currentAvailable
                .filter((f) => unassignedFieldNames.includes(f.fieldName))
                .map((field) => {
                  const { fieldKey } = field;
                  return (
                    <Box
                      key={field.id}
                      draggable
                      onDragStart={(e: React.DragEvent) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', fieldKey);
                        handleDragStart('available', fieldKey, field.fieldName);
                      }}
                      onDragEnd={handleDragEnd}
                      sx={{
                        px: 2.5,
                        py: 1.2,
                        borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'grab',
                        opacity:
                          dragItem?.kind === 'available' && dragItem.fieldKey === fieldKey
                            ? 0.4
                            : 1,
                        '&:active': { cursor: 'grabbing' },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <DragIndicatorIcon
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.disabled',
                          cursor: 'grab',
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>
                        {field.fieldName}
                      </Typography>
                      <Tooltip title='Edit field'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditField(field);
                          }}
                          sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#1976d2' } }}
                        >
                          <EditIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteField(field.fieldName, field.fieldName);
                        }}
                        sx={{ p: 0.3, opacity: 0.5, '&:hover': { opacity: 1, color: '#d32f2f' } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                      </IconButton>
                    </Box>
                  );
                })
            )}
          </Box>
        </Box>

        {/* Right Panel: Sections */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 380, md: 520 },
            bgcolor: 'background.paper',
          }}
        >
          {/* Sections header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ ...columnLabelSx, mb: 0 }}>
              {activeTab === 'createTicket' ? 'Ticket Sections' : 'Ticket Detail Sections'}
            </Typography>
            <Tooltip title='Add New Section'>
              <IconButton
                size='small'
                onClick={() => setAddSectionDialogOpen(true)}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Sections body */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {currentSections.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  color: 'text.disabled',
                  fontSize: '0.8rem',
                }}
              >
                No sections yet. Click &#39;+ Add New Section&#39; to create one.
              </Box>
            ) : (
              currentSections.map((section, sectionIndex) => {
                const isEditing = editingSection?.id === section.id;

                return (
                  <Box
                    key={section.id}
                    onDragOver={(e: React.DragEvent) => handleDragOverSection(section.id, e)}
                    onDragLeave={(e: React.DragEvent) => handleDragLeaveSection(e)}
                    onDrop={(e: React.DragEvent) => handleDropOnSection(section.id, e)}
                    sx={{
                      ...(dragOverSection === section.id && {
                        bgcolor: 'rgba(3, 105, 161, 0.02)',
                        outline: '2px dashed rgba(3, 105, 161, 0.2)',
                        outlineOffset: -2,
                        borderRadius: 0.5,
                      }),
                    }}
                  >
                    {/* Section header row */}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.4,
                        borderTop:
                          sectionIndex === 0 ? 'none' : '1px solid rgba(226, 232, 255, 0.6)',
                        borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: alpha('#0369a1', 0.04),
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Box sx={{ flex: 1 }}>
                            <TextField
                              inputRef={sectionTitleInputRef}
                              value={editingSection.temp}
                              onChange={(e) =>
                                setEditingSection((prev) =>
                                  prev ? { ...prev, temp: e.target.value } : null,
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleEditSectionTitleSave();
                                } else if (e.key === 'Escape') {
                                  handleEditSectionTitleCancel();
                                }
                              }}
                              size='small'
                              sx={{
                                '& .MuiInputBase-root': {
                                  bgcolor: 'background.paper',
                                  borderRadius: 1.5,
                                },
                                '& .MuiInputBase-input': {
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  padding: '4px 8px',
                                },
                              }}
                            />
                          </Box>
                          <Tooltip title='Submit'>
                            <IconButton
                              size='small'
                              onClick={handleEditSectionTitleSave}
                              sx={{
                                p: 0.7,
                                color: editingSection.temp.trim()
                                  ? 'primary.main'
                                  : 'text.disabled',
                                '&:hover': {
                                  color: 'primary.dark',
                                  bgcolor: 'rgba(3, 105, 161, 0.08)',
                                },
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Cancel'>
                            <IconButton
                              size='small'
                              onClick={handleEditSectionTitleCancel}
                              sx={{
                                p: 0.7,
                                color: 'text.secondary',
                                '&:hover': {
                                  color: '#d32f2f',
                                  bgcolor: 'rgba(211, 47, 47, 0.08)',
                                },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              flex: 1,
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.main' },
                            }}
                            onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                          >
                            {section.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              fontWeight: 500,
                              mr: 0.5,
                            }}
                          >
                            {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleEditSectionTitleStart(section.id, section.title)}
                            sx={{
                              p: 0.3,
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: '#1976d2' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() => requestDeleteSection(section.id, section.title)}
                            sx={{
                              p: 0.3,
                              opacity: 0.5,
                              '&:hover': { opacity: 1, color: '#d32f2f' },
                            }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                          </IconButton>
                        </>
                      )}
                    </Box>

                    {/* Section fields */}
                    {section.fields.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: 2,
                          color: 'text.disabled',
                          fontSize: '0.8rem',
                        }}
                      >
                        Drag fields here or use the dropdown below
                      </Box>
                    ) : (
                      <Box>
                        {section.fields.map((fieldKey, fieldIndex) => {
                          // Use allCustomFields for lookup since fields in sections
                          // are removed from availableFields (currentAvailable)
                          const customField = allCustomFields.find((f) => f.fieldKey === fieldKey);
                          const displayName = customField?.fieldName ?? fieldKey;

                          return (
                            <Box
                              key={fieldKey}
                              data-field-index={fieldIndex}
                              draggable
                              onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', fieldKey);
                                handleDragStart('section', fieldKey, displayName, section.id);
                              }}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                                handleDragOverField(section.id, fieldIndex, e)
                              }
                              onDrop={(e: React.DragEvent<HTMLDivElement>) =>
                                handleDropOnField(section.id, fieldIndex, e)
                              }
                              onDragLeave={(e: React.DragEvent<HTMLDivElement>) =>
                                handleDragLeaveField(e)
                              }
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 2.5,
                                py: 1.2,
                                borderBottom: '1px solid rgba(226, 232, 255, 0.4)',
                                '&:last-child': { borderBottom: 'none' },
                                cursor: 'grab',
                                opacity:
                                  dragItem?.kind === 'section' && dragItem.fieldKey === fieldKey
                                    ? 0.4
                                    : 1,
                                '&:active': { cursor: 'grabbing' },
                                ...(dragOverField === `${section.id}-${fieldIndex}` && {
                                  borderTop: '2px solid #0369a1',
                                }),
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                            >
                              <DragIndicatorIcon
                                sx={{
                                  fontSize: '0.9rem',
                                  color: 'text.disabled',
                                  cursor: 'grab',
                                  flexShrink: 0,
                                }}
                              />
                              <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>
                                {displayName}
                              </Typography>
                              <Tooltip title='Edit field'>
                                <IconButton
                                  size='small'
                                  onClick={() => customField && handleEditField(customField)}
                                  sx={{
                                    p: 0.3,
                                    opacity: 0.5,
                                    '&:hover': { opacity: 1, color: '#1976d2' },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: '0.85rem' }} />
                                </IconButton>
                              </Tooltip>
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveFieldFromSection(section.id, fieldKey)}
                                sx={{
                                  p: 0.3,
                                  opacity: 0.5,
                                  '&:hover': { opacity: 1, color: '#d32f2f' },
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                              </IconButton>
                              <Tooltip title='Move up'>
                                <IconButton
                                  size='small'
                                  onClick={() =>
                                    handleReorderFieldInSection(section.id, fieldKey, 'up')
                                  }
                                  sx={{
                                    p: 0.3,
                                    opacity: 0.5,
                                    '&:hover': { opacity: 1, color: '#1976d2' },
                                  }}
                                >
                                  <ArrowUpwardIcon sx={{ fontSize: '0.85rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Move down'>
                                <IconButton
                                  size='small'
                                  onClick={() =>
                                    handleReorderFieldInSection(section.id, fieldKey, 'down')
                                  }
                                  sx={{
                                    p: 0.3,
                                    opacity: 0.5,
                                    '&:hover': { opacity: 1, color: '#1976d2' },
                                  }}
                                >
                                  <ArrowDownwardIcon sx={{ fontSize: '0.85rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Move back to available fields'>
                                <IconButton
                                  size='small'
                                  onClick={() => handleRemoveFieldFromSection(section.id, fieldKey)}
                                  sx={{
                                    p: 0.3,
                                    transition: 'opacity 0.15s',
                                    color: '#0000008a',
                                    '&:hover': { opacity: 1, color: '#d32f2f' },
                                  }}
                                >
                                  <ArrowBackIcon sx={{ fontSize: '0.85rem' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {/* Add field dropdown */}
                    {unassignedFieldNames.length > 0 && (
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.2,
                          borderTop: '1px solid rgba(226, 232, 255, 0.4)',
                          borderBottom:
                            sectionIndex === currentSections.length - 1
                              ? 'none'
                              : '1px solid rgba(226, 232, 255, 0.6)',
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <FieldSelector
                          fields={unassignedFieldNames}
                          onChange={(val) => handleAddFieldToSection(section.id, val)}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Footer actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button onClick={handleSave} variant='contained' sx={{ textTransform: 'none' }}>
          Save
        </Button>
      </DialogActions>

      {/* ── Delete Field Confirmation Dialog ──────────────────────────── */}
      <Dialog
        open={!!pendingDeleteField}
        onClose={cancelDeleteField}
        maxWidth='xs'
        fullWidth
        slotProps={{
          transition: { unmountOnExit: true },
          paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            background: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DeleteOutlineIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              Delete Custom Field
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant='body2'>
            Are you sure you want to delete <strong>{pendingDeleteField?.displayName}</strong>?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            This will remove the field from all sections permanently.
          </Typography>
        </Box>

        {/* Footer actions */}
        <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={cancelDeleteField} variant='outlined' sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteField}
            color='error'
            variant='contained'
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      </Dialog>

      {/* ── Delete Section Confirmation Dialog ────────────────────────── */}
      <Dialog
        open={!!pendingDeleteSection}
        onClose={cancelDeleteSection}
        maxWidth='xs'
        fullWidth
        slotProps={{
          transition: { unmountOnExit: true },
          paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            background: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DeleteOutlineIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              Delete Section
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant='body2'>
            Are you sure you want to delete the <strong>{pendingDeleteSection?.title}</strong>{' '}
            section?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            This will remove the section and its field assignments permanently.
          </Typography>
        </Box>

        {/* Footer actions */}
        <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={cancelDeleteSection} variant='outlined' sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteSection}
            color='error'
            variant='contained'
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      </Dialog>

      {/* ── Add Custom Field Dialog ─────────────────────────────────── */}
      <CustomFieldFormDialog
        open={addFieldDialogOpen}
        editing={null}
        existingFields={currentAvailable}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          displayName: tt.displayName,
          name: tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        defaultFieldUseFlag={TAB_TO_FIELD_USE_FLAG[activeTab]}
        accent='#0369a1'
        onClose={() => setAddFieldDialogOpen(false)}
        onSave={handleSaveCustomField}
      />

      {/* ── Edit Custom Field Dialog ────────────────────────────────── */}
      <CustomFieldFormDialog
        open={!!editingField}
        editing={editingField}
        existingFields={currentAvailable}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          displayName: tt.displayName,
          name: tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        accent='#0369a1'
        onClose={() => setEditingField(null)}
        onSave={handleEditFieldSave}
      />

      {/* ── Add Custom Section Dialog ───────────────────────────────── */}
      <SectionFormDialog
        open={addSectionDialogOpen}
        existingSections={currentSections}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          name: tt.displayName || tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        accent='#0369a1'
        onClose={() => setAddSectionDialogOpen(false)}
        onSave={(section) => {
          handleAddSectionWithTitle(section.title, section.accessControl);
          setAddSectionDialogOpen(false);
        }}
      />
    </Dialog>
  );
};

// ── Field selector dropdown ─────────────────────────────────────────

const FieldSelector = ({
  fields,
  onChange,
}: {
  fields: string[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ position: 'relative', flex: 1 }}>
      {open && fields.length > 0 && (
        <Box
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {fields.map((fieldName) => (
            <Box
              key={fieldName}
              onClick={() => {
                onChange(fieldName);
                setOpen(false);
              }}
              sx={{
                px: 2,
                py: 1,
                fontSize: '0.85rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '&:first-of-type': { borderRadius: '4px 4px 0 0' },
                '&:last-of-type': { borderRadius: '0 0 4px 4px' },
              }}
            >
              {fieldName}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TicketTypeLayoutDialog;
