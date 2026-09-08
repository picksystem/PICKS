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
import { getDefaultLayoutConfig, mergeLayoutConfig } from '@serviceops/tickettypelayout';
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

// Map section key → tab for cross-tab drag-and-drop
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

// Convert the dialog's internal section state into the canonical
// ITicketTypeLayoutConfig that the rest of the system consumes.

// Static section definitions — move these to the API later when the backend is ready.
const LAYOUT_SECTIONS: Record<TabId, { key: string; label: string }[]> = {
  createTicket: [
    { key: 'ticketInformation', label: 'Ticket Information' },
    { key: 'categorization', label: 'Categorization' },
    { key: 'description', label: 'Description' },
    { key: 'additionalDetails', label: 'Additional Details' },
    { key: 'priorityAssignment', label: 'Priority & Assignment' },
    { key: 'auditInformation', label: 'Audit Information' },
    { key: 'attachments', label: 'Attachments' },
  ],
  ticketDetails: [
    { key: 'infoBar', label: 'Info Bar' },
    { key: 'sideBar', label: 'Side Bar' },
    { key: 'ticketOptions', label: 'Ticket Options' },
    { key: 'assignment', label: 'Assignment' },
    { key: 'contactAndBilling', label: 'Contact & Billing' },
    { key: 'reporting', label: 'Reporting' },
    { key: 'datesAndUsers', label: 'Dates & Users' },
    { key: 'additionalFields', label: 'Additional Fields' },
  ],
};

const layoutSections = LAYOUT_SECTIONS;

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

  // Initialize layout config from ticket type's saved config, or defaults
  const defaultConfig = useMemo(() => getDefaultLayoutConfig(), []);

  const [layoutConfig, _setLayoutConfig] = useState<ITicketTypeLayoutConfig>(() => {
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

  // When the dialog is opened (or the ticket type changes while closed),
  // re-initialize allCustomFields from the parent's fresh data so that
  // newly persisted fields survive a page refresh.
  const prevTicketTypeIdRef = useRef<number | undefined>(ticketType?.id);
  useEffect(() => {
    const idChanged = prevTicketTypeIdRef.current !== ticketType?.id;
    prevTicketTypeIdRef.current = ticketType?.id;

    if (open) {
      setAllCustomFields(persistedFields);
      setAvailableFields({
        createTicket: initialAvailableFields(persistedFields, 'createTicket'),
        ticketDetails: initialAvailableFields(persistedFields, 'ticketDetails'),
      });
    } else if (idChanged && ticketType) {
      // Ticket type changed while dialog was closed — refresh state too
      setAllCustomFields(persistedFields);
    }
  }, [open, persistedFields]);

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

  // Build dialog sections from fetched layout sections + layoutConfig
  const buildDialogSections = useCallback(
    (sections: { key: string; label: string }[] | undefined, tab: TabId): DialogSection[] => {
      if (!sections) return [];
      return sections.map((s) => {
        if (tab === 'createTicket') {
          const selectedFields =
            layoutConfig.createTicket?.[s.key as keyof typeof layoutConfig.createTicket]
              ?.selectedFields ?? [];
          return { id: s.key, title: s.label, fields: [...selectedFields] };
        }
        const selectedFields =
          (
            layoutConfig[s.key as keyof ITicketTypeLayoutConfig] as
              | { selectedFields: string[] }
              | undefined
          )?.selectedFields ?? [];
        return { id: s.key, title: s.label, fields: [...selectedFields] };
      });
    },
    [layoutConfig],
  );

  // ── Build dialog sections from layoutConfig ─────────────────────

  // We derive "dialog sections" from the fetched section definitions and
  // the canonical layout config so the drag-and-drop UI mirrors what's saved.
  const [dialogSections, setDialogSections] = useState<Record<TabId, DialogSection[]>>({
    createTicket: [],
    ticketDetails: [],
  });

  // Sync dialog sections when layoutConfig or layoutSections changes
  useEffect(() => {
    if (!layoutSections) return;
    const sections: Record<TabId, DialogSection[]> = {
      createTicket: buildDialogSections(layoutSections.createTicket, 'createTicket'),
      ticketDetails: buildDialogSections(layoutSections.ticketDetails, 'ticketDetails'),
    };
    setDialogSections(sections);
  }, [layoutSections, layoutConfig, buildDialogSections]);

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
      const targetTab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
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
    [activeTab, availableFields],
  );

  const handleRemoveFieldFromSection = useCallback(
    (sectionId: string, fieldKey: string) => {
      const sourceTab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
      setDialogSections((prev) => ({
        ...prev,
        [sourceTab]: prev[sourceTab].map((s) =>
          s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f !== fieldKey) } : s,
        ),
      }));
    },
    [activeTab],
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
      const tab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
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
    [activeTab],
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

      if (dragItem.kind === 'available') {
        handleAddFieldToSection(sectionId, dragItem.fieldName);
      } else if (dragItem.kind === 'section') {
        if (dragItem.sectionId === sectionId) return;
        // Determine source and target tabs from section IDs
        const sourceTab = SECTION_TO_TAB_MAP[dragItem.sectionId] ?? activeTab;
        const targetTab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;
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
    [dragItem, activeTab, handleAddFieldToSection, handleDragEnd],
  );

  const handleDropOnField = useCallback(
    (sectionId: string, targetIndex: number, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSection(null);
      if (!dragItem) return;

      if (dragItem.kind === 'available') {
        handleAddFieldToSection(sectionId, dragItem.fieldName);
      } else if (dragItem.kind === 'section') {
        const sourceTab = SECTION_TO_TAB_MAP[dragItem.sectionId] ?? activeTab;
        const targetTab = SECTION_TO_TAB_MAP[sectionId] ?? activeTab;

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
    [dragItem, activeTab, handleAddFieldToSection, handleDragEnd],
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

  const handleSaveCustomField = useCallback(
    (field: ICustomField) => {
      const tabsToUpdate: TabId[] = [];
      if (field.fieldUse?.__createTicket__) tabsToUpdate.push('createTicket');
      if (field.fieldUse?.__ticketDetails__) tabsToUpdate.push('ticketDetails');
      if (tabsToUpdate.length === 0) tabsToUpdate.push(activeTab);

      setAvailableFields((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          const idx = next[tab].findIndex((f) => f.fieldName === field.fieldName);
          if (idx >= 0) {
            next[tab] = [...next[tab]];
            next[tab][idx] = field;
          } else {
            next[tab] = [...next[tab], field];
          }
        }
        return next;
      });

      // Also update allCustomFields so the field is visible in both panels
      setAllCustomFields((prev) => {
        const idx = prev.findIndex((f) => f.id === field.id);
        const next = [...prev];
        if (idx >= 0) {
          next[idx] = field;
        } else {
          next.push(field);
        }
        // Persist to the parent so the backend is updated
        persistCustomFields(next);
        return next;
      });

      setAddFieldDialogOpen(false);
    },
    [activeTab, persistCustomFields],
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

      setAvailableFields((prev) => {
        const next = { ...prev };
        for (const tab of tabsToUpdate) {
          const idx = next[tab].findIndex((f) => f.fieldName === updated.fieldName);
          if (idx >= 0) {
            next[tab] = [...next[tab]];
            next[tab][idx] = updated;
          }
        }
        return next;
      });

      // Also update allCustomFields and persist to the parent
      setAllCustomFields((prev) => {
        const idx = prev.findIndex((f) => f.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          persistCustomFields(next);
          return next;
        }
        return prev;
      });

      setEditingField(null);
    },
    [activeTab, persistCustomFields],
  );

  const handleRemoveField = useCallback(
    (fieldName: string) => {
      // Find the fieldKey to also remove from any section
      const cf = currentAvailable.find((f) => f.fieldName === fieldName);
      const fieldKey = cf?.fieldKey ?? fieldName;

      // Also track the id for removal from allCustomFields
      const removedId = cf?.id;

      setAvailableFields((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((f) => f.fieldName !== fieldName),
      }));
      // Remove from all sections across both tabs
      setDialogSections((prev) => {
        const next: Record<TabId, DialogSection[]> = { ...prev };
        for (const tab of TAB_ORDER) {
          next[tab] = next[tab].map((s) => ({
            ...s,
            fields: s.fields.filter((f) => f !== fieldKey),
          }));
        }
        return next;
      });

      // Remove from allCustomFields and persist
      if (removedId) {
        setAllCustomFields((prev) => {
          const next = prev.filter((f) => f.id !== removedId);
          persistCustomFields(next);
          return next;
        });
      }
    },
    [activeTab, currentAvailable, persistCustomFields],
  );

  // ── Save ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Build a mutable map to collect selectedFields per section key
    const sectionSelectedFields: Record<string, string[]> = {};

    // Update createTicket sub-sections from dialog
    const createSections = dialogSections.createTicket ?? [];
    for (const dialogSection of createSections) {
      sectionSelectedFields[`createTicket.${dialogSection.id}`] = [...dialogSection.fields];
    }

    // Update ticketDetails sections from dialog
    const detailSections = dialogSections.ticketDetails ?? [];
    for (const dialogSection of detailSections) {
      sectionSelectedFields[dialogSection.id] = [...dialogSection.fields];
    }

    // Construct canonical ITicketTypeLayoutConfig by starting from defaults
    // and overwriting selectedFields with what the dialog produced.
    const newConfig: ITicketTypeLayoutConfig = { ...defaultConfig };

    // Apply createTicket sections
    const ct = { ...newConfig.createTicket } as Record<string, { selectedFields: string[] }>;
    for (const [key, fields] of Object.entries(sectionSelectedFields)) {
      if (key.startsWith('createTicket.')) {
        const subKey = key.slice('createTicket.'.length);
        ct[subKey] = { selectedFields: fields };
      } else {
        (newConfig as unknown as Record<string, { selectedFields: string[] }>)[key] = {
          selectedFields: fields,
        };
      }
    }
    newConfig.createTicket = ct as typeof newConfig.createTicket;

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
                          handleRemoveField(field.fieldName);
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
                            onClick={() => handleRemoveSection(section.id)}
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
