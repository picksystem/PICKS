import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  TextField,
} from '@serviceops/component';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import EditIcon from '@mui/icons-material/Edit';
import CreateIcon from '@mui/icons-material/NoteAdd';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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
  subSections: { id: string; name: string; fields?: string[] }[];
  accessControl?: Record<string, boolean>;
};

const TAB_ORDER: TabId[] = ['createTicket', 'ticketDetails'];

const POOL_PANEL_WIDTH = 320;

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

// Return ALL custom fields — the field pool is global (not tab-filtered).
// When a new field is added it is visible in both tabs automatically.
function initialAvailableFields(customFields: ICustomField[]): ICustomField[] {
  return [...customFields];
}

// Resolve the tab for a section ID from layoutConfig.customSections.
// Since the dialog only contains user-created custom sections, each one
// carries its tab assignment directly — no hardcoded map needed.
function resolveSectionTab(sectionId: string, layoutConfig: ITicketTypeLayoutConfig): TabId {
  return layoutConfig.customSections?.[sectionId]?.tab ?? 'createTicket';
}

// Build dialog sections directly from layoutConfig.
// Only custom (user-created) sections are shown — built-in system sections
// are NOT hardcoded here. The user adds sections manually via the "+" button.
// On save, built-in system fields are preserved by merging with defaults.
function buildDialogSectionsFromConfig(
  layoutConfig: ITicketTypeLayoutConfig,
): Record<TabId, DialogSection[]> {
  const result: Record<TabId, DialogSection[]> = { createTicket: [], ticketDetails: [] };

  // Custom sections (user-created) — these are the only sections shown in the dialog
  const { customSections } = layoutConfig;
  if (customSections) {
    for (const [id, cfg] of Object.entries(customSections)) {
      const tab: TabId = cfg.tab ?? 'createTicket';
      result[tab].push({
        id,
        title: cfg.title,
        fields: [...cfg.fields],
        subSections: cfg.subSections ? [...cfg.subSections] : [],
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

  // Section editing via SectionFormDialog (reuses the same dialog used for adding sections)
  const [editingSection, setEditingSection] = useState<DialogSection | null>(null);

  // Add Section dialog
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);

  // Delete confirmation dialogs
  const [pendingDeleteField, setPendingDeleteField] = useState<{
    fieldName: string;
    displayName: string;
    fromSection?: { sectionId: string; subId?: string; fieldKey: string };
  } | null>(null);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<{
    sectionId: string;
    title: string;
  } | null>(null);

  // Inline sub-section name editing
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Delete confirmation for sub-sections
  const [pendingDeleteSubSection, setPendingDeleteSubSection] = useState<{
    sectionId: string;
    subId: string;
    subName: string;
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
  // Global field pool — same list shown in both tabs.
  const [availableFields, setAvailableFields] = useState<ICustomField[]>([]);
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

    const parentDataChanged = lastSyncedFieldsRef.current !== persistedFields;
    if (!initializedRef.current || parentDataChanged) {
      lastSyncedFieldsRef.current = persistedFields;
      setAllCustomFields(persistedFields);
      setAvailableFields(initialAvailableFields(persistedFields));
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

  // Fields from dialog sections that are NOT in the available pool
  // Per-tab: only fields in the current tab's sections count as "used"
  // Per-tab used field keys — a field is hidden from Additional Fields only
  // when it has been placed in a section or sub-section of that SAME tab.
  const usedFieldKeysByTab = useMemo<Record<TabId, Set<string>>>(() => {
    const result: Record<TabId, Set<string>> = {
      createTicket: new Set(),
      ticketDetails: new Set(),
    };
    for (const tab of TAB_ORDER) {
      for (const section of dialogSections[tab] ?? []) {
        for (const f of section.fields) {
          result[tab].add(f);
        }
        for (const sub of section.subSections ?? []) {
          for (const f of sub.fields ?? []) {
            result[tab].add(f);
          }
        }
      }
    }
    return result;
  }, [dialogSections]);

  // Available fields for the active tab — exclude only fields used in
  // sections of this SAME tab.
  const currentAvailable = useMemo(() => {
    const usedInThisTab = usedFieldKeysByTab[activeTab];
    return availableFields.filter((f) => !usedInThisTab.has(f.fieldKey));
  }, [availableFields, usedFieldKeysByTab, activeTab]);

  const currentSections = useMemo(
    () => dialogSections[activeTab] ?? [],
    [dialogSections, activeTab],
  );

  // ── Section Handlers ─────────────────────────────────────────────

  const handleAddSectionWithTitle = useCallback(
    (
      title: string,
      accessControl?: Record<string, boolean>,
      subSections?: { id: string; name: string }[],
    ) => {
      const id = `custom_${Date.now()}`;
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          { id, title, fields: [], subSections: subSections ?? [], accessControl },
        ],
      }));

      // Persist immediately to parent so the section appears without waiting
      // for the main "Save" button.
      onSave(
        mergeLayoutConfig({
          ...layoutConfig,
          customSections: {
            ...layoutConfig.customSections,
            [id]: {
              title,
              fields: [],
              subSections: subSections ?? [],
              tab: activeTab,
              accessControl,
            },
          },
        }),
      );
    },
    [activeTab, layoutConfig, onSave],
  );

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((s) => s.id !== sectionId),
      }));

      // Persist immediately to parent so the deletion applies without waiting
      // for the main "Save" button.
      const nextCustom = { ...(layoutConfig.customSections ?? {}) };
      delete nextCustom[sectionId];
      onSave(mergeLayoutConfig({ ...layoutConfig, customSections: nextCustom }));
    },
    [activeTab, layoutConfig, onSave],
  );

  const handleEditSectionTitleStart = useCallback((section: DialogSection) => {
    setEditingSection(section);
  }, []);

  const handleEditSubSectionName = useCallback((subId: string) => {
    setEditingSubId(subId);
  }, []);

  const handleSubSectionNameChange = useCallback(
    (sectionId: string, subId: string, name: string) => {
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections ?? []).map((ss) =>
              ss.id === subId ? { id: ss.id, name, fields: ss.fields } : ss,
            ),
          };
        }),
      }));
    },
    [activeTab],
  );

  const handleSubSectionNameCommit = useCallback(
    (sectionId: string, subId: string, newName: string) => {
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections ?? []).map((ss) =>
              ss.id === subId ? { id: ss.id, name: newName.trim(), fields: ss.fields } : ss,
            ),
          };
        }),
      }));
      setEditingSubId(null);

      // Persist the rename to parent immediately so it survives refresh.
      // Read the latest layoutConfig from the ref to avoid stale closures.
      const currentConfig = lastSyncedLayoutRef.current ?? layoutConfig;
      const nextCustom = { ...(currentConfig.customSections ?? {}) };
      if (nextCustom[sectionId]) {
        nextCustom[sectionId] = {
          ...nextCustom[sectionId],
          subSections: (nextCustom[sectionId].subSections ?? []).map((ss) =>
            ss.id === subId ? { ...ss, name: newName.trim() } : ss,
          ),
        };
      }
      onSave(mergeLayoutConfig({ ...currentConfig, customSections: nextCustom }));
      lastSyncedLayoutRef.current = { ...currentConfig, customSections: nextCustom };
    },
    [activeTab, layoutConfig, onSave, mergeLayoutConfig],
  );

  const requestDeleteSubSection = useCallback(
    (sectionId: string, subId: string, subName: string) => {
      setPendingDeleteSubSection({ sectionId, subId, subName });
    },
    [],
  );

  const cancelDeleteSubSection = useCallback(() => {
    setPendingDeleteSubSection(null);
  }, []);

  const confirmDeleteSubSection = useCallback(() => {
    if (!pendingDeleteSubSection) return;
    const { sectionId, subId } = pendingDeleteSubSection;
    setDialogSections((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((s) =>
        s.id === sectionId
          ? { ...s, subSections: (s.subSections ?? []).filter((ss) => ss.id !== subId) }
          : s,
      ),
    }));

    // Persist the deletion to parent immediately
    const nextCustom = { ...(layoutConfig.customSections ?? {}) };
    if (nextCustom[sectionId]) {
      nextCustom[sectionId] = {
        ...nextCustom[sectionId],
        subSections: (nextCustom[sectionId].subSections ?? []).filter((ss) => ss.id !== subId),
      };
    }
    onSave(mergeLayoutConfig({ ...layoutConfig, customSections: nextCustom }));
    setPendingDeleteSubSection(null);
  }, [pendingDeleteSubSection, activeTab, layoutConfig, onSave, mergeLayoutConfig]);

  const handleUpdateSectionTitle = useCallback(
    (
      sectionId: string,
      title: string,
      accessControl?: Record<string, boolean>,
      subSections?: { id: string; name: string }[],
    ) => {
      setDialogSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s) =>
          s.id === sectionId
            ? { ...s, title, accessControl, subSections: subSections ?? s.subSections }
            : s,
        ),
      }));

      // Persist immediately to parent, including accessControl and subSections
      const nextCustom = { ...(layoutConfig.customSections ?? {}) };
      if (nextCustom[sectionId]) {
        nextCustom[sectionId] = {
          ...nextCustom[sectionId],
          title,
          accessControl,
          subSections: subSections ?? nextCustom[sectionId].subSections,
        };
      }
      onSave(mergeLayoutConfig({ ...layoutConfig, customSections: nextCustom }));
    },
    [activeTab, layoutConfig, onSave, mergeLayoutConfig],
  );

  // ── Section Field Handlers ───────────────────────────────────────

  const handleAddFieldToSection = useCallback(
    (sectionId: string, fieldName: string) => {
      if (!fieldName) return;

      // Find the custom field by fieldName to get its fieldKey
      const customField = availableFields.find((f) => f.fieldName === fieldName);
      if (!customField) return;

      const { fieldKey } = customField;

      setDialogSections((prev) => {
        const next: Record<TabId, DialogSection[]> = { ...prev };
        let found = false;

        for (const tab of TAB_ORDER) {
          // Skip if this field already exists in any section of this tab
          const alreadyUsedInTab = prev[tab].some((s) => s.fields.includes(fieldKey));
          if (alreadyUsedInTab) continue;

          next[tab] = next[tab].map((s) => {
            if (s.id === sectionId && !s.fields.includes(fieldKey)) {
              found = true;
              return { ...s, fields: [...s.fields, fieldKey] };
            }
            return s;
          });
          if (found) break;
        }
        return next;
      });
    },
    [availableFields],
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

  const handleAddFieldToSubSection = useCallback(
    (sectionId: string, subId: string, fieldKey: string) => {
      const sourceTab = resolveSectionTab(sectionId, layoutConfig);
      setDialogSections((prev) => ({
        ...prev,
        [sourceTab]: prev[sourceTab].map((s) =>
          s.id === sectionId
            ? {
                ...s,
                subSections: (s.subSections ?? []).map((sub) =>
                  sub.id === subId ? { ...sub, fields: [...(sub.fields ?? []), fieldKey] } : sub,
                ),
              }
            : s,
        ),
      }));
    },
    [layoutConfig],
  );

  const handleRemoveFieldFromSubSection = useCallback(
    (sectionId: string, subId: string, fieldKey: string) => {
      const sourceTab = resolveSectionTab(sectionId, layoutConfig);
      setDialogSections((prev) => ({
        ...prev,
        [sourceTab]: prev[sourceTab].map((s) =>
          s.id === sectionId
            ? {
                ...s,
                subSections: (s.subSections ?? []).map((sub) =>
                  sub.id === subId
                    ? { ...sub, fields: (sub.fields ?? []).filter((f) => f !== fieldKey) }
                    : sub,
                ),
              }
            : s,
        ),
      }));
    },
    [layoutConfig],
  );

  const handleReorderFieldInSubSection = useCallback(
    (sectionId: string, subId: string, fieldKey: string, direction: 'up' | 'down') => {
      const sourceTab = resolveSectionTab(sectionId, layoutConfig);
      setDialogSections((prev) => {
        const tabSections = prev[sourceTab];
        const section = tabSections.find((s) => s.id === sectionId);
        if (!section) return prev;
        const sub = (section.subSections ?? []).find((ss) => ss.id === subId);
        if (!sub) return prev;
        const subFields = sub.fields ?? [];
        const idx = subFields.indexOf(fieldKey);
        if (idx === -1) return prev;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= subFields.length) return prev;
        const next = { ...prev };
        next[sourceTab] = tabSections.map((s) => {
          if (s.id !== sectionId) return s;
          const subSections = (s.subSections ?? []).map((ss) => {
            if (ss.id !== subId) return ss;
            const fields = [...(ss.fields ?? [])];
            [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
            return { ...ss, fields };
          });
          return { ...s, subSections };
        });
        return next;
      });
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
          // Same-tab: skip if field already exists in another section of this tab
          if (sourceTab === targetTab) {
            const alreadyElsewhere = prev[targetTab].some(
              (s) => s.id !== dragItem.sectionId && s.fields.includes(dragItem.fieldKey),
            );
            if (alreadyElsewhere) return prev;
          }
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
            // Same-tab: skip if field already exists in another section of this tab
            if (sourceTab === targetTab) {
              const alreadyElsewhere = prev[targetTab].some(
                (s) => s.id !== dragItem.sectionId && s.fields.includes(dragItem.fieldKey),
              );
              if (alreadyElsewhere) return prev;
            }
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

  // Clear drag state when switching tabs
  useEffect(() => {
    handleDragEnd();
  }, [activeTabIdx]);

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
    const { fieldName, fromSection } = pendingDeleteField;

    if (fromSection) {
      // Scenario 2: Remove field from a specific section (field stays in available list)
      const { fieldKey } = fromSection;
      const { sectionId } = fromSection;
      const sourceTab = resolveSectionTab(sectionId, layoutConfig);

      setDialogSections((prev) => ({
        ...prev,
        [sourceTab]: prev[sourceTab].map((s) =>
          s.id === sectionId
            ? {
                ...s,
                fields: s.fields.filter((f) => f !== fieldKey),
                subSections: (s.subSections ?? []).map((sub) => ({
                  ...sub,
                  fields: (sub.fields ?? []).filter((f) => f !== fieldKey),
                })),
              }
            : s,
        ),
      }));

      // Persist to parent immediately
      const nextCustom = { ...(layoutConfig.customSections ?? {}) };
      if (nextCustom[sectionId]) {
        nextCustom[sectionId] = {
          ...nextCustom[sectionId],
          fields: nextCustom[sectionId].fields.filter((f) => f !== fieldKey),
          subSections: (nextCustom[sectionId].subSections ?? []).map((sub) => ({
            ...sub,
            fields: (sub.fields ?? []).filter((f) => f !== fieldKey),
          })),
        };
      }
      onSave(mergeLayoutConfig({ ...layoutConfig, customSections: nextCustom }));
    } else {
      // Scenario 1: Delete field entirely from the ticket type
      const cf = availableFields.find((f) => f.fieldName === fieldName);
      const fieldKey = cf?.fieldKey ?? fieldName;
      const removedId = cf?.id;
      if (!removedId) {
        setPendingDeleteField(null);
        return;
      }

      const nextAvailable = availableFields.filter((f) => f.fieldName !== fieldName);
      const nextAll = allCustomFields.filter((f) => f.id !== removedId);

      // Remove field from all dialog sections and sub-sections, then persist
      const nextCustomSections = { ...(layoutConfig.customSections ?? {}) };
      for (const sId of Object.keys(nextCustomSections)) {
        nextCustomSections[sId] = {
          ...nextCustomSections[sId],
          fields: nextCustomSections[sId].fields.filter((f) => f !== fieldKey),
          subSections: (nextCustomSections[sId].subSections ?? []).map((sub) => ({
            ...sub,
            fields: (sub.fields ?? []).filter((f) => f !== fieldKey),
          })),
        };
      }
      const cleanedLayout = mergeLayoutConfig({
        ...layoutConfig,
        customSections: nextCustomSections,
      });
      onSave(cleanedLayout);

      setAvailableFields(nextAvailable);
      setAllCustomFields(nextAll);
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
      persistCustomFields(nextAll);
    }

    setPendingDeleteField(null);
  }, [
    pendingDeleteField,
    availableFields,
    allCustomFields,
    dialogSections,
    layoutConfig,
    onSave,
    resolveSectionTab,
    persistCustomFields,
    mergeLayoutConfig,
  ]);

  // Called from delete icon click — opens the confirmation dialog
  const requestDeleteField = useCallback(
    (
      fieldName: string,
      displayName: string,
      fromSection?: { sectionId: string; subId?: string; fieldKey: string },
    ) => {
      setPendingDeleteField({
        fieldName,
        displayName,
        fromSection,
      });
    },
    [],
  );

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
      // Ensure both tab flags are set — the pool is global.
      const updatedField = {
        ...field,
        fieldUse: {
          __createTicket__: true,
          __ticketDetails__: true,
          ...(field.fieldUse ?? {}),
        },
      };

      const idx = allCustomFields.findIndex((f) => f.id === updatedField.id);
      const nextAvailable =
        idx >= 0
          ? availableFields.map((f) => (f.id === updatedField.id ? updatedField : updatedField))
          : [...availableFields, updatedField];
      const nextAll =
        idx >= 0
          ? allCustomFields.map((f) => (f.id === updatedField.id ? updatedField : f))
          : [...allCustomFields, updatedField];

      setAvailableFields(nextAvailable);
      setAllCustomFields(nextAll);
      persistCustomFields(nextAll);
      setAddFieldDialogOpen(false);
    },
    [availableFields, allCustomFields, persistCustomFields],
  );

  const handleEditField = useCallback((field: ICustomField) => {
    setEditingField(field);
  }, []);

  const handleEditFieldSave = useCallback(
    (updated: ICustomField) => {
      const idx = allCustomFields.findIndex((f) => f.id === updated.id);
      const nextAvailable =
        idx >= 0
          ? availableFields.map((f) => (f.id === updated.id ? updated : updated))
          : availableFields;
      const nextAll =
        idx >= 0
          ? allCustomFields.map((f) => (f.id === updated.id ? updated : f))
          : [...allCustomFields, updated];

      setAvailableFields(nextAvailable);
      setAllCustomFields(nextAll);
      persistCustomFields(nextAll);
      setEditingField(null);
    },
    [availableFields, allCustomFields, persistCustomFields],
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
        newConfig.customSections![section.id] = {
          title: section.title,
          fields: [...section.fields],
          subSections: section.subSections ? [...section.subSections] : [],
          tab,
          accessControl: section.accessControl,
        };
      }
    }

    // Merge with defaults to preserve system fields + add default createTicket sections
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
            <Typography sx={columnLabelSx}>Additional Fields</Typography>
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
            {currentAvailable.length === 0 ? (
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
              currentAvailable.map((field) => {
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
                        dragItem?.kind === 'available' && dragItem.fieldKey === fieldKey ? 0.4 : 1,
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
                    <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>{field.fieldName}</Typography>
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
                    <Tooltip title='Delete field'>
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
                    </Tooltip>
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
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'default',
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Tooltip title='Edit section'>
                        <IconButton
                          size='small'
                          onClick={() => handleEditSectionTitleStart(section)}
                          sx={{
                            p: 0.3,
                            opacity: 0.5,
                            '&:hover': { opacity: 1, color: '#1976d2' },
                          }}
                        >
                          <EditIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete section'>
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
                      </Tooltip>
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
                              <Tooltip title='Delete field'>
                                <IconButton
                                  size='small'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    requestDeleteField(fieldKey, displayName, {
                                      sectionId: section.id,
                                      fieldKey,
                                    });
                                  }}
                                  sx={{
                                    p: 0.3,
                                    opacity: 0.5,
                                    '&:hover': { opacity: 1, color: '#d32f2f' },
                                  }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                                </IconButton>
                              </Tooltip>
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
                              <Tooltip title='Move back to additional fields'>
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
                    {currentAvailable.length > 0 && (
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.2,
                          borderTop: '1px solid rgba(226, 232, 255, 0.4)',
                          borderBottom:
                            sectionIndex === currentSections.length - 1 &&
                            section.subSections.length === 0
                              ? 'none'
                              : '1px solid rgba(226, 232, 255, 0.6)',
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <FieldSelector
                          fields={currentAvailable.map((f) => f.fieldName)}
                          onChange={(val) => handleAddFieldToSection(section.id, val)}
                        />
                      </Box>
                    )}

                    {/* ── Sub-sections ── */}
                    {(section.subSections ?? []).length > 0 && (
                      <Box
                        sx={{
                          borderTop: '1px solid rgba(226, 232, 255, 0.6)',
                          borderBottom:
                            sectionIndex === currentSections.length - 1
                              ? 'none'
                              : '1px solid rgba(226, 232, 255, 0.6)',
                        }}
                      >
                        {(section.subSections ?? []).map((sub, subIdx) => (
                          <Box
                            key={sub.id}
                            onDragOver={(e: React.DragEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDragLeave={(e: React.DragEvent) => {
                              e.stopPropagation();
                              handleDragLeaveSection(e);
                            }}
                            onDrop={(e: React.DragEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!dragItem) return;
                              let targetFieldKey = dragItem.fieldKey;
                              if (dragItem.kind === 'available') {
                                const cf = availableFields.find(
                                  (f) => f.fieldName === dragItem.fieldName,
                                );
                                if (cf) targetFieldKey = cf.fieldKey;
                              }
                              if ((sub.fields ?? []).includes(targetFieldKey)) {
                                handleDragEnd();
                                return;
                              }
                              const sourceTab =
                                dragItem.kind === 'section' && dragItem.sectionId
                                  ? resolveSectionTab(dragItem.sectionId, layoutConfig)
                                  : activeTab;
                              const alreadyInTab = (dialogSections[sourceTab] ?? []).some((s) => {
                                if (s.fields.includes(targetFieldKey)) return true;
                                return (s.subSections ?? []).some((ss) =>
                                  (ss.fields ?? []).includes(targetFieldKey),
                                );
                              });
                              if (!alreadyInTab) {
                                handleAddFieldToSubSection(section.id, sub.id, targetFieldKey);
                              }
                              handleDragEnd();
                            }}
                            sx={{
                              ml: 3,
                              borderBottom:
                                subIdx < (section.subSections ?? []).length - 1
                                  ? '1px solid rgba(226, 232, 255, 0.4)'
                                  : 'none',
                            }}
                          >
                            {/* Sub-section header row */}
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                bgcolor: alpha('#0369a1', 0.04),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                              }}
                            >
                              <DragIndicatorIcon
                                sx={{
                                  fontSize: '0.85rem',
                                  color: 'text.disabled',
                                  flexShrink: 0,
                                  cursor: 'default',
                                }}
                              />
                              {editingSubId === sub.id ? (
                                <TextField
                                  autoFocus
                                  size='small'
                                  value={sub.name}
                                  onChange={(e) =>
                                    handleSubSectionNameChange(section.id, sub.id, e.target.value)
                                  }
                                  onBlur={() =>
                                    handleSubSectionNameCommit(section.id, sub.id, sub.name)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Escape') {
                                      setEditingSubId(null);
                                    }
                                  }}
                                  sx={{
                                    flex: 1,
                                    fontSize: '0.8rem',
                                    '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.5 },
                                  }}
                                />
                              ) : (
                                <Typography
                                  sx={{
                                    flex: 1,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                  }}
                                >
                                  {sub.name || 'Unnamed Sub-section'}
                                </Typography>
                              )}
                              {editingSubId === sub.id ? (
                                <Tooltip title='Save'>
                                  <IconButton
                                    size='small'
                                    onClick={() =>
                                      handleSubSectionNameCommit(section.id, sub.id, sub.name)
                                    }
                                    sx={{
                                      p: 0.3,
                                      opacity: 0.5,
                                      '&:hover': { opacity: 1, color: '#2e7d32' },
                                    }}
                                  >
                                    <CheckIcon sx={{ fontSize: '0.85rem' }} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title='Rename sub-section'>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleEditSubSectionName(sub.id)}
                                    sx={{
                                      p: 0.3,
                                      opacity: 0.5,
                                      '&:hover': { opacity: 1, color: '#1976d2' },
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: '0.85rem' }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {editingSubId === sub.id ? (
                                <Tooltip title='Cancel'>
                                  <IconButton
                                    size='small'
                                    onClick={() => setEditingSubId(null)}
                                    sx={{
                                      p: 0.3,
                                      opacity: 0.5,
                                      '&:hover': { opacity: 1, color: '#d32f2f' },
                                    }}
                                  >
                                    <CloseIcon sx={{ fontSize: '0.85rem' }} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title='Delete sub-section'>
                                  <IconButton
                                    size='small'
                                    onClick={() =>
                                      requestDeleteSubSection(section.id, sub.id, sub.name)
                                    }
                                    sx={{
                                      p: 0.3,
                                      opacity: 0.5,
                                      '&:hover': { opacity: 1, color: '#d32f2f' },
                                    }}
                                  >
                                    <DeleteOutlineIcon sx={{ fontSize: '0.85rem' }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Typography
                                sx={{
                                  fontSize: '0.7rem',
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                  mr: 0.5,
                                }}
                              >
                                {(sub.fields ?? []).length} field
                                {(sub.fields ?? []).length !== 1 ? 's' : ''}
                              </Typography>
                            </Box>

                            {/* Sub-section fields */}
                            {(sub.fields ?? []).length === 0 ? (
                              <Box
                                sx={{
                                  px: 2,
                                  py: 0.75,
                                  color: 'text.disabled',
                                  fontSize: '0.75rem',
                                  fontStyle: 'italic',
                                }}
                              >
                                Drag fields here to add
                              </Box>
                            ) : (
                              <Box>
                                {(sub.fields ?? []).map((fieldKey, subFieldIdx) => {
                                  const customField = allCustomFields.find(
                                    (f) => f.fieldKey === fieldKey,
                                  );
                                  const displayName = customField?.fieldName ?? fieldKey;

                                  return (
                                    <Box
                                      key={fieldKey}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 0.9,
                                        borderBottom:
                                          subFieldIdx < (sub.fields ?? []).length - 1
                                            ? '1px solid rgba(226, 232, 255, 0.3)'
                                            : 'none',
                                        '&:last-child': { borderBottom: 'none' },
                                      }}
                                    >
                                      <DragIndicatorIcon
                                        sx={{
                                          fontSize: '0.8rem',
                                          color: 'text.disabled',
                                          flexShrink: 0,
                                          mr: 1,
                                        }}
                                      />
                                      <Typography
                                        sx={{
                                          flex: 1,
                                          fontSize: '0.8rem',
                                          color: 'text.secondary',
                                        }}
                                      >
                                        {displayName}
                                      </Typography>
                                      <Tooltip title='Edit field'>
                                        <IconButton
                                          size='small'
                                          onClick={() =>
                                            customField && handleEditField(customField)
                                          }
                                          sx={{
                                            p: 0.3,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, color: '#1976d2' },
                                          }}
                                        >
                                          <EditIcon sx={{ fontSize: '0.8rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title='Delete field'>
                                        <IconButton
                                          size='small'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            requestDeleteField(fieldKey, displayName, {
                                              sectionId: section.id,
                                              subId: sub.id,
                                              fieldKey,
                                            });
                                          }}
                                          sx={{
                                            p: 0.3,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, color: '#d32f2f' },
                                          }}
                                        >
                                          <DeleteOutlineIcon sx={{ fontSize: '0.8rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title='Move up'>
                                        <IconButton
                                          size='small'
                                          onClick={() =>
                                            handleReorderFieldInSubSection(
                                              section.id,
                                              sub.id,
                                              fieldKey,
                                              'up',
                                            )
                                          }
                                          sx={{
                                            p: 0.3,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, color: '#1976d2' },
                                          }}
                                        >
                                          <ArrowUpwardIcon sx={{ fontSize: '0.8rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title='Move down'>
                                        <IconButton
                                          size='small'
                                          onClick={() =>
                                            handleReorderFieldInSubSection(
                                              section.id,
                                              sub.id,
                                              fieldKey,
                                              'down',
                                            )
                                          }
                                          sx={{
                                            p: 0.3,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, color: '#1976d2' },
                                          }}
                                        >
                                          <ArrowDownwardIcon sx={{ fontSize: '0.8rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title='Remove from sub-section'>
                                        <IconButton
                                          size='small'
                                          onClick={() =>
                                            handleRemoveFieldFromSubSection(
                                              section.id,
                                              sub.id,
                                              fieldKey,
                                            )
                                          }
                                          sx={{
                                            p: 0.3,
                                            opacity: 0.5,
                                            '&:hover': { opacity: 1, color: '#d32f2f' },
                                          }}
                                        >
                                          <ArrowBackIcon sx={{ fontSize: '0.8rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        ))}
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
            {pendingDeleteField?.fromSection
              ? `Are you sure you want to remove ${pendingDeleteField.displayName} from this section? The field will be moved back to the available fields list.`
              : `Are you sure you want to delete ${pendingDeleteField?.displayName ?? ''}? This will remove the field from all sections permanently.`}
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

      {/* ── Delete Sub-Section Confirmation Dialog ───────────────────── */}
      <Dialog
        open={!!pendingDeleteSubSection}
        onClose={cancelDeleteSubSection}
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
              Delete Sub-Section
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant='body2'>
            Are you sure you want to delete the sub-section{' '}
            <strong>{pendingDeleteSubSection?.subName || 'this sub-section'}</strong>? Any fields
            inside it will be removed from this section.
          </Typography>
        </Box>

        {/* Footer actions */}
        <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={cancelDeleteSubSection}
            variant='outlined'
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteSubSection}
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

      {/* ── Section Form Dialog (used for both add and edit) ───────────── */}
      <SectionFormDialog
        open={!!editingSection || addSectionDialogOpen}
        editingSection={editingSection}
        existingSections={currentSections}
        ticketTypes={ticketTypes.map((tt) => ({
          type: tt.type,
          name: tt.displayName || tt.name,
        }))}
        defaultTicketType={ticketType?.type}
        accent='#0369a1'
        onClose={() => {
          setEditingSection(null);
          setAddSectionDialogOpen(false);
        }}
        onSave={(section) => {
          if (editingSection && editingSection.id === section.id) {
            // Edit mode — update the existing section's title/accessControl/subSections
            handleUpdateSectionTitle(
              section.id,
              section.title,
              section.accessControl,
              section.subSections,
            );
          } else if (!editingSection) {
            // Add mode — add new section with subSections
            handleAddSectionWithTitle(section.title, section.accessControl, section.subSections);
          }
          setEditingSection(null);
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
