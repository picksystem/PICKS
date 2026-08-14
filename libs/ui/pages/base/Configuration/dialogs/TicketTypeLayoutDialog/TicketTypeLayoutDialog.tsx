import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Box, Button, Typography, Tabs, Tab, IconButton } from '@serviceops/component';
import { Dialog, DialogActions, alpha } from '@mui/material';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CreateIcon from '@mui/icons-material/NoteAdd';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ICustomField, ITicketType } from '@serviceops/interfaces';
import { useUpdateTicketTypeMutation, useGetTicketTypeQuery } from '@serviceops/services';
import { useConfiguration } from '@serviceops/confighooks';
import { useNotification } from '@serviceops/hooks';
import {
  ITicketTypeLayoutConfig,
  getDefaultLayoutConfig,
  mergeLayoutConfig,
  INFO_BAR_FIELDS,
  SIDE_BAR_SECTION_FIELDS,
  TICKET_OPTIONS_FIELDS,
  ASSIGNMENT_FIELDS,
  CONTACT_AND_BILLING_FIELDS,
  REPORTING_FIELDS,
  DATES_AND_USERS_FIELDS,
  ADDITIONAL_FIELDS_FIELDS,
  DETAILS_CORE_FIELDS,
  DETAILS_CHANGE_FIELDS,
  DETAILS_VENDOR_FIELDS,
  DETAILS_CAB_FIELDS,
  DETAILS_RESOLUTION_FIELDS,
  CREATE_TICKET_TICKET_INFORMATION_FIELDS,
  CREATE_TICKET_CATEGORIZATION_FIELDS,
  CREATE_TICKET_DESCRIPTION_FIELDS,
  CREATE_TICKET_ADDITIONAL_DETAILS_FIELDS,
  CREATE_TICKET_PRIORITY_ASSIGNMENT_FIELDS,
  CREATE_TICKET_AUDIT_INFORMATION_FIELDS,
  CREATE_TICKET_ATTACHMENTS_FIELDS,
  isCustomFieldKey,
} from '@serviceops/tickettypelayout';
import { CustomFieldDialog } from '../CustomFieldDialog';

const CUSTOM_FIELD_ACCENT = '#7c3aed';

const ACCENT = '#0369a1';

// ── Section key types ────────────────────────────────────────

type DetailsSectionKey =
  | 'infoBar'
  | 'sideBar'
  | 'ticketOptions'
  | 'assignment'
  | 'contactAndBilling'
  | 'reporting'
  | 'datesAndUsers'
  | 'additionalFields'
  | 'ticketCore'
  | 'changeManagement'
  | 'vendorBug'
  | 'changeControl'
  | 'resolutionWorkaround';

type CreateTicketSectionKey =
  | 'ticketInformation'
  | 'categorization'
  | 'description'
  | 'additionalDetails'
  | 'priorityAssignment'
  | 'auditInformation'
  | 'attachments';

// ── Section definitions ──────────────────────────────────────

const DETAILS_SECTION_DEFS: {
  key: DetailsSectionKey;
  title: string;
  fields: { key: string; label: string }[];
}[] = [
  { key: 'infoBar', title: 'Ticket info bar', fields: INFO_BAR_FIELDS },
  { key: 'sideBar', title: 'Side bar', fields: SIDE_BAR_SECTION_FIELDS },
  { key: 'ticketOptions', title: 'Ticket Options', fields: TICKET_OPTIONS_FIELDS },
  { key: 'assignment', title: 'Side-tab Assignment', fields: ASSIGNMENT_FIELDS },
  {
    key: 'contactAndBilling',
    title: 'Side tab-Contact and Billing',
    fields: CONTACT_AND_BILLING_FIELDS,
  },
  { key: 'reporting', title: 'Side tab-Reporting', fields: REPORTING_FIELDS },
  { key: 'datesAndUsers', title: 'Side tab-Date and users', fields: DATES_AND_USERS_FIELDS },
  {
    key: 'additionalFields',
    title: 'Side tab-Additional fields',
    fields: ADDITIONAL_FIELDS_FIELDS,
  },
  {
    key: 'ticketCore',
    title: 'Ticket core fields',
    fields: DETAILS_CORE_FIELDS,
  },
  {
    key: 'changeManagement',
    title: 'Change / Release management',
    fields: DETAILS_CHANGE_FIELDS,
  },
  {
    key: 'vendorBug',
    title: 'Vendor & bug tracking',
    fields: DETAILS_VENDOR_FIELDS,
  },
  {
    key: 'changeControl',
    title: 'Change control (CAB)',
    fields: DETAILS_CAB_FIELDS,
  },
  {
    key: 'resolutionWorkaround',
    title: 'Resolution & workarounds',
    fields: DETAILS_RESOLUTION_FIELDS,
  },
];

const CREATE_TICKET_SECTION_DEFS: {
  key: CreateTicketSectionKey;
  title: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    key: 'ticketInformation',
    title: 'Ticket Information',
    fields: CREATE_TICKET_TICKET_INFORMATION_FIELDS,
  },
  { key: 'categorization', title: 'Categorization', fields: CREATE_TICKET_CATEGORIZATION_FIELDS },
  { key: 'description', title: 'Description', fields: CREATE_TICKET_DESCRIPTION_FIELDS },
  {
    key: 'additionalDetails',
    title: 'Additional details',
    fields: CREATE_TICKET_ADDITIONAL_DETAILS_FIELDS,
  },
  {
    key: 'priorityAssignment',
    title: 'Priority and assignment',
    fields: CREATE_TICKET_PRIORITY_ASSIGNMENT_FIELDS,
  },
  {
    key: 'auditInformation',
    title: 'Audit information',
    fields: CREATE_TICKET_AUDIT_INFORMATION_FIELDS,
  },
  { key: 'attachments', title: 'Attachments', fields: CREATE_TICKET_ATTACHMENTS_FIELDS },
];

// ── Layout constants ─────────────────────────────────────────

const POOL_PANEL_WIDTH = 320;

const columnLabelSx = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  mb: 1,
};

// ── Helpers ──────────────────────────────────────────────────

function getSelectedFields(
  config: ITicketTypeLayoutConfig,
  activeTab: number,
  sectionKey: string,
): string[] {
  if (activeTab === 0) {
    const ctKey = sectionKey as CreateTicketSectionKey;
    const sectionConfig = config.createTicket[ctKey];
    return sectionConfig?.selectedFields ?? [];
  }
  const dtKey = sectionKey as DetailsSectionKey;
  const sectionConfig = config[dtKey];
  return sectionConfig?.selectedFields ?? [];
}

function setSelectedFields(
  prev: ITicketTypeLayoutConfig,
  activeTab: number,
  sectionKey: string,
  keys: string[],
): ITicketTypeLayoutConfig {
  if (activeTab === 0) {
    const ctKey = sectionKey as CreateTicketSectionKey;
    return {
      ...prev,
      createTicket: {
        ...prev.createTicket,
        [ctKey]: { selectedFields: keys },
      },
    };
  }
  const dtKey = sectionKey as DetailsSectionKey;
  return {
    ...prev,
    [dtKey]: { ...prev[dtKey], selectedFields: keys },
  };
}

// ── Pool Item (draggable from remaining) ─────────────────────

interface PoolItemProps {
  fieldKey: string;
  label: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLElement>, fieldKey: string) => void;
  isCustom?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PoolItem = ({
  fieldKey,
  label,
  onClick,
  onDragStart,
  isCustom,
  onEdit,
  onDelete,
}: PoolItemProps) => {
  return (
    <Box
      draggable
      onDragStart={(e: React.DragEvent<HTMLElement>) => onDragStart(e, fieldKey)}
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 0.9,
        fontSize: '0.85rem',
        borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: isCustom ? 'default' : 'grab',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { cursor: isCustom ? 'default' : 'grabbing' },
      }}
    >
      {isCustom ? (
        <>
          <DragIndicatorIcon fontSize='small' sx={{ color: 'text.secondary', flexShrink: 0 }} />
          <Typography sx={{ flex: 1, lineHeight: 1.3 }} onPointerDown={(e) => e.stopPropagation()}>
            {label}
          </Typography>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            sx={{
              p: 0.3,
              flexShrink: 0,
              opacity: 0.6,
              '&:hover': { opacity: 1, color: CUSTOM_FIELD_ACCENT },
            }}
          >
            <EditIcon sx={{ fontSize: '0.8rem' }} />
          </IconButton>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            sx={{
              p: 0.3,
              flexShrink: 0,
              opacity: 0.6,
              '&:hover': { opacity: 1, color: '#d32f2f' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: '0.8rem' }} />
          </IconButton>
        </>
      ) : (
        <Typography sx={{ flex: 1, lineHeight: 1.3 }}>{label}</Typography>
      )}
    </Box>
  );
};

// ── Sortable Section Item ────────────────────────────────────

interface SortableFieldItemProps {
  fieldKey: string;
  label: string;
  onClick: () => void;
}

const SortableFieldItem = ({ fieldKey, label, onClick }: SortableFieldItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `item-${fieldKey}`,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <Box ref={setNodeRef} sx={style}>
      <Box
        {...listeners}
        {...attributes}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.9,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          touchAction: 'none',
        }}
      >
        <DragIndicatorIcon
          fontSize='small'
          sx={{ color: 'text.secondary', mr: 1, flexShrink: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              lineHeight: 1.3,
              borderBottom: '1px solid rgba(226, 232, 255, 0.6)',
              pb: 0.9,
            }}
          >
            {label}
          </Typography>
        </Box>
        <IconButton
          size='small'
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          sx={{ p: 0.3, flexShrink: 0, opacity: 0.5, '&:hover': { opacity: 1 } }}
        >
          <ExpandMoreIcon sx={{ fontSize: '0.85rem', transform: 'rotate(180deg)' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

// ── Section Drop Zone ────────────────────────────────────────

interface SectionDropZoneProps {
  title: string;
  sectionKey: string;
  selectedFields: { key: string; label: string }[];
  onFieldRemove: (key: string) => void;
  onFieldMoveUp: (key: string) => void;
  onFieldMoveDown: (key: string) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}

const SectionDropZone = ({
  title,
  sectionKey,
  selectedFields,
  onFieldRemove,
  onFieldMoveUp,
  onFieldMoveDown,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: SectionDropZoneProps) => {
  return (
    <Box
      data-section-key={sectionKey}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        border: `1.5px solid ${isDragOver ? ACCENT : 'rgba(226, 232, 255, 0.9)'}`,
        borderRadius: '10px',
        mb: 1.5,
        bgcolor: isDragOver ? alpha(ACCENT, 0.04) : 'background.paper',
        transition: 'border-color 0.15s, background-color 0.15s',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.2,
          bgcolor: alpha(ACCENT, 0.06),
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: selectedFields.length > 0 ? '1px solid rgba(226, 232, 255, 0.6)' : 'none',
        }}
      >
        <ExpandMoreIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', flex: 1 }}>{title}</Typography>
        {selectedFields.length > 0 && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {selectedFields.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 2.5,
            color: 'text.disabled',
            fontSize: '0.8rem',
          }}
        >
          <Typography>Drop fields here</Typography>
        </Box>
      ) : (
        <SortableContext
          items={selectedFields.map((f) => `item-${f.key}`)}
          strategy={verticalListSortingStrategy}
        >
          {selectedFields.map((f, idx) => (
            <Box key={f.key} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <SortableFieldItem
                  fieldKey={f.key}
                  label={f.label}
                  onClick={() => onFieldRemove(f.key)}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  pr: 0.5,
                  pt: 0.5,
                }}
              >
                <IconButton
                  size='small'
                  onClick={() => onFieldMoveUp(f.key)}
                  disabled={idx === 0}
                  sx={{ p: 0.3 }}
                >
                  <ArrowUpwardIcon sx={{ fontSize: '0.75rem' }} />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => onFieldMoveDown(f.key)}
                  disabled={idx === selectedFields.length - 1}
                  sx={{ p: 0.3 }}
                >
                  <ArrowDownwardIcon sx={{ fontSize: '0.75rem' }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </SortableContext>
      )}
    </Box>
  );
};

// ── Props ────────────────────────────────────────────────────

export interface TicketTypeLayoutDialogProps {
  open: boolean;
  ticketType: ITicketType | null;
  onClose: () => void;
  onSave?: () => void;
}

// ── Component ────────────────────────────────────────────────

export const TicketTypeLayoutDialog = ({
  open,
  ticketType,
  onClose,
  onSave,
}: TicketTypeLayoutDialogProps) => {
  const fullConfig = useConfiguration();
  const categorization = fullConfig.config?.data?.categorization;
  const { data: allTicketTypes } = useGetTicketTypeQuery();

  // All ticket types used to populate the Field Use checkbox list in the
  // Custom Field dialog.
  const ticketTypeOptions = useMemo(() => {
    return (allTicketTypes ?? [])
      .filter((t) => !!t.type)
      .map((t) => ({ type: t.type, displayName: t.name || t.displayName || t.type }));
  }, [allTicketTypes]);
  const [config, setConfig] = useState<ITicketTypeLayoutConfig>(getDefaultLayoutConfig);
  const [activeTab, setActiveTab] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [updateTicketType, { isLoading: isSaving }] = useUpdateTicketTypeMutation();
  const { error: notifyError } = useNotification();

  // ── Custom field state ──────────────────────────────────────
  const [customFields, setCustomFields] = useState<ICustomField[]>([]);
  const [cfDialogOpen, setCfDialogOpen] = useState(false);
  const [editingCf, setEditingCf] = useState<ICustomField | null>(null);

  // When RTK Query refetches after a mutation, ticketType prop gets a new
  // object reference.  We track by id so we can detect the refetch and
  // re-sync config/customFields without clobbering UI state (activeTab, etc.).
  const lastSyncedRef = useRef<ITicketType | null>(null);

  useEffect(() => {
    if (!open || !ticketType) return;
    const isNewTicketType = ticketType.id !== lastSyncedRef.current?.id;
    const isFreshRef = !isNewTicketType && ticketType !== lastSyncedRef.current;

    if (isFreshRef) {
      // Same ticketType, fresh reference from RTK refetch — update data only
      lastSyncedRef.current = ticketType;
      setConfig(mergeLayoutConfig(ticketType.layoutConfig));
      setCustomFields(ticketType.customFields ?? []);
    } else if (isNewTicketType) {
      // New ticketType selected — full reset
      lastSyncedRef.current = ticketType;
      setConfig(mergeLayoutConfig(ticketType.layoutConfig));
      setCustomFields(ticketType.customFields ?? []);
      setActiveTab(0);
      setActiveId(null);
      setDragOverSection(null);
    }
  }, [open, ticketType]);

  // ── Compute remaining fields ───────────────────────────────

  const remainingFields = useMemo(() => {
    let fields: { key: string; label: string }[];
    let sectionDefsList: { key: string; fields: { key: string; label: string }[] }[];

    if (activeTab === 0) {
      fields = CREATE_TICKET_SECTION_DEFS.flatMap((s) => s.fields);
      sectionDefsList = CREATE_TICKET_SECTION_DEFS.map((s) => ({ key: s.key, fields: s.fields }));
    } else {
      fields = DETAILS_SECTION_DEFS.flatMap((s) => s.fields);
      sectionDefsList = DETAILS_SECTION_DEFS.map((s) => ({ key: s.key, fields: s.fields }));
    }

    const selectedSet = new Set<string>();
    for (const section of sectionDefsList) {
      const keys = getSelectedFields(config, activeTab, section.key);
      keys.forEach((k: string) => selectedSet.add(k));
    }

    const seen = new Set<string>();
    const result: { key: string; label: string }[] = [];
    for (const f of fields) {
      if (!selectedSet.has(f.key) && !seen.has(f.key)) {
        seen.add(f.key);
        result.push(f);
      }
    }

    // Append custom fields whose key is NOT in any section
    for (const cf of customFields) {
      if (!selectedSet.has(cf.fieldKey) && !seen.has(cf.fieldKey)) {
        seen.add(cf.fieldKey);
        result.push({ key: cf.fieldKey, label: cf.fieldName });
      }
    }

    return result;
  }, [activeTab, config, customFields]);

  const sectionDefs = activeTab === 0 ? CREATE_TICKET_SECTION_DEFS : DETAILS_SECTION_DEFS;

  // ── HTML5 Native Drag Handlers ─────────────────────────────

  const handlePoolDragStart = useCallback((e: React.DragEvent<HTMLElement>, fieldKey: string) => {
    setActiveId(`pool-${fieldKey}`);
    e.dataTransfer.setData('text/plain', `pool:${fieldKey}`);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    if (e.dataTransfer.setDragImage) {
      const empty = document.createElement('div');
      document.body.appendChild(empty);
      e.dataTransfer.setDragImage(empty, 0, 0);
      setTimeout(() => document.body.removeChild(empty), 0);
    }
  }, []);

  const handleSectionDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>, sectionKey: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverSection(sectionKey);
    },
    [],
  );

  const handleSectionDragLeave = useCallback(() => {
    setDragOverSection(null);
  }, []);

  const handleSectionDrop = useCallback(
    (e: React.DragEvent<HTMLElement>, targetSectionKey: string) => {
      e.preventDefault();
      setDragOverSection(null);

      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;

      const [sourceType, sourceFieldKey] = raw.split(':');
      setActiveId(null);

      if (sourceType === 'pool') {
        // Pool → Section: add field
        if (activeTab === 0) {
          const ctKey = targetSectionKey as CreateTicketSectionKey;
          const currentKeys = config.createTicket[ctKey].selectedFields;
          if (currentKeys.includes(sourceFieldKey)) return;
          setConfig((prev) => ({
            ...prev,
            createTicket: {
              ...prev.createTicket,
              [ctKey]: { selectedFields: [...currentKeys, sourceFieldKey] },
            },
          }));
        } else {
          const dtKey = targetSectionKey as DetailsSectionKey;
          const currentKeys = config[dtKey].selectedFields;
          if (currentKeys.includes(sourceFieldKey)) return;
          setConfig((prev) => ({
            ...prev,
            [dtKey]: { ...prev[dtKey], selectedFields: [...currentKeys, sourceFieldKey] },
          }));
        }
      } else if (sourceType === 'item') {
        // Section → Section: move or remove
        // Find source section
        let sourceSectionKey: string | null = null;
        for (const s of sectionDefs) {
          const keys = getSelectedFields(config, activeTab, s.key);
          if (keys.includes(sourceFieldKey)) {
            sourceSectionKey = s.key;
            break;
          }
        }
        if (!sourceSectionKey) return;

        if (sourceSectionKey === targetSectionKey) return; // same section, no-op

        // Remove from source
        const sourceKeys = getSelectedFields(config, activeTab, sourceSectionKey);
        const updatedSource = sourceKeys.filter((k: string) => k !== sourceFieldKey);
        const targetKeys = getSelectedFields(config, activeTab, targetSectionKey);

        if (activeTab === 0) {
          setConfig((prev) => {
            const next = setSelectedFields(prev, activeTab, sourceSectionKey!, updatedSource);
            return setSelectedFields(next, activeTab, targetSectionKey, [
              ...targetKeys,
              sourceFieldKey,
            ]);
          });
        } else {
          setConfig((prev) => {
            const next = setSelectedFields(prev, activeTab, sourceSectionKey!, updatedSource);
            return setSelectedFields(next, activeTab, targetSectionKey, [
              ...targetKeys,
              sourceFieldKey,
            ]);
          });
        }
      }
    },
    [activeTab, config, sectionDefs],
  );

  // Pool area drop handler: removes field from its section
  const handlePoolDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handlePoolDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setDragOverSection(null);
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;

      const [sourceType, sourceFieldKey] = raw.split(':');
      setActiveId(null);

      if (sourceType === 'item') {
        // Remove from whichever section it's in
        for (const section of sectionDefs) {
          const keys = getSelectedFields(config, activeTab, section.key);
          if (keys.includes(sourceFieldKey)) {
            const updated = keys.filter((k: string) => k !== sourceFieldKey);
            setConfig((prev) => setSelectedFields(prev, activeTab, section.key, updated));
            return;
          }
        }
      }
    },
    [activeTab, config, sectionDefs],
  );

  // ── Click handlers ──────────────────────────────────────────

  const handlePoolItemClick = useCallback(
    (fieldKey: string) => {
      // Custom fields can only be placed via drag-and-drop, not by click.
      // They still have edit/delete buttons via the PoolItem's own handlers.
      if (isCustomFieldKey(fieldKey)) return;

      const owningSection = sectionDefs.find((s) => s.fields.some((f) => f.key === fieldKey));
      if (!owningSection) return;

      if (activeTab === 0) {
        const ctKey = owningSection.key as CreateTicketSectionKey;
        setConfig((prev) => ({
          ...prev,
          createTicket: {
            ...prev.createTicket,
            [ctKey]: {
              ...prev.createTicket[ctKey],
              selectedFields: [...prev.createTicket[ctKey].selectedFields, fieldKey],
            },
          },
        }));
      } else {
        const dtKey = owningSection.key as DetailsSectionKey;
        setConfig((prev) => ({
          ...prev,
          [dtKey]: {
            ...prev[dtKey],
            selectedFields: [...prev[dtKey].selectedFields, fieldKey],
          },
        }));
      }
    },
    [activeTab, sectionDefs, config],
  );

  const handleFieldRemove = useCallback(
    (fieldKey: string) => {
      for (const section of sectionDefs) {
        const keys = getSelectedFields(config, activeTab, section.key);

        if (keys.includes(fieldKey)) {
          const updated = keys.filter((k: string) => k !== fieldKey);
          setConfig((prev) => setSelectedFields(prev, activeTab, section.key, updated));
          return;
        }
      }
    },
    [activeTab, config, sectionDefs],
  );

  const moveSectionFieldUp = useCallback(
    (fieldKey: string) => {
      for (const section of sectionDefs) {
        const keys = getSelectedFields(config, activeTab, section.key);

        const idx = keys.indexOf(fieldKey);
        if (idx > 0) {
          const next = [...keys];
          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
          setConfig((prev) => setSelectedFields(prev, activeTab, section.key, next));
          return;
        }
      }
    },
    [activeTab, config, sectionDefs],
  );

  const moveSectionFieldDown = useCallback(
    (fieldKey: string) => {
      for (const section of sectionDefs) {
        const keys = getSelectedFields(config, activeTab, section.key);

        const idx = keys.indexOf(fieldKey);
        if (idx >= 0 && idx < keys.length - 1) {
          const next = [...keys];
          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
          setConfig((prev) => setSelectedFields(prev, activeTab, section.key, next));
          return;
        }
      }
    },
    [activeTab, config, sectionDefs],
  );

  // ── Save ────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!ticketType) return;
    try {
      await updateTicketType({
        id: ticketType.id,
        data: { layoutConfig: config, customFields },
      }).unwrap();
      onSave?.();
      onClose();
    } catch {
      notifyError('Failed to save ticket layout');
    }
  };

  // ── Custom Field handlers ──────────────────────────────────

  const handleOpenAddCustomField = () => {
    setEditingCf(null);
    setCfDialogOpen(true);
  };

  const handleEditCustomField = (cf: ICustomField) => {
    setEditingCf(cf);
    setCfDialogOpen(true);
  };

  const handleDeleteCustomField = (cf: ICustomField) => {
    if (!window.confirm(`Delete "${cf.fieldName}"? This will also remove it from any sections.`))
      return;
    setCustomFields((prev) => prev.filter((f) => f.id !== cf.id));
    // Remove from any sections that reference it
    setConfig((prev) => {
      const next = { ...prev };
      const allSectionDefs = activeTab === 0 ? CREATE_TICKET_SECTION_DEFS : DETAILS_SECTION_DEFS;
      for (const s of allSectionDefs) {
        const ctKey = s.key as CreateTicketSectionKey;
        const dtKey = s.key as DetailsSectionKey;
        if (activeTab === 0) {
          const keys = next.createTicket[ctKey]?.selectedFields ?? [];
          const filtered = keys.filter((k) => k !== cf.fieldKey);
          if (filtered.length !== keys.length) {
            next.createTicket = { ...next.createTicket, [ctKey]: { selectedFields: filtered } };
          }
        } else {
          const dtSection = next[dtKey];
          if (dtSection && 'maxFields' in dtSection) {
            const keys = dtSection.selectedFields ?? [];
            const filtered = keys.filter((k) => k !== cf.fieldKey);
            if (filtered.length !== keys.length) {
              next[dtKey] = { ...dtSection, selectedFields: filtered };
            }
          } else if (dtSection) {
            const keys = (dtSection as { selectedFields?: string[] }).selectedFields ?? [];
            const filtered = keys.filter((k) => k !== cf.fieldKey);
            if (filtered.length !== keys.length) {
              next[dtKey] = { ...dtSection, selectedFields: filtered } as any;
            }
          }
        }
      }
      return next;
    });
  };

  const handleSaveCustomField = async (field: ICustomField) => {
    try {
      // Build the updated list from the current closure value
      const idx = customFields.findIndex((f) => f.id === field.id);
      const updatedFields =
        idx >= 0 ? customFields.map((f, i) => (i === idx ? field : f)) : [...customFields, field];

      // Persist to the server — triggers RTK Query invalidation of 'TicketType' and
      // 'Configuration' tags, causing any useGetTicketTypeQuery consumer to refetch.
      if (ticketType) {
        await updateTicketType({
          id: ticketType.id,
          data: { customFields: updatedFields },
        }).unwrap();
      }

      // Optimistic local state update after successful API response
      setCustomFields(updatedFields);
      setCfDialogOpen(false);
      setEditingCf(null);
    } catch {
      notifyError('Failed to save custom field');
    }
  };

  // ── JSX ─────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      disableEscapeKeyDown
      disableRestoreFocus
      disableEnforceFocus
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: ACCENT,
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
            {ticketType
              ? `Choose which fields appear on the ${ticketType.displayName || ticketType.name} screen`
              : ''}
          </Typography>
        </Box>
      </Box>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            setActiveId(null);
            setDragOverSection(null);
          }}
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

      {/* ── Two-column layout ───────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          maxHeight: 520,
          overflow: 'hidden',
        }}
      >
        {/* ── Left Panel: Remaining Fields ───────────────── */}
        <Box
          onDragOver={handlePoolDragOver}
          onDrop={handlePoolDrop}
          sx={{
            width: { xs: '100%', md: `${POOL_PANEL_WIDTH}px` },
            minWidth: { xs: 0, md: `${POOL_PANEL_WIDTH}px` },
            borderRight: { md: '1px solid rgba(226, 232, 255, 0.9)' },
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: 280, md: 520 },
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(226, 232, 255, 0.6)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={columnLabelSx}>Remaining Fields</Typography>
              <Button
                size='small'
                variant='contained'
                startIcon={
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.25)',
                      mr: 0.25,
                    }}
                  >
                    <AddIcon sx={{ fontSize: '0.85rem', color: '#fff' }} />
                  </Box>
                }
                onClick={handleOpenAddCustomField}
                sx={{
                  bgcolor: CUSTOM_FIELD_ACCENT,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 1.25,
                  boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                  '&:hover': {
                    bgcolor: '#6d28d9',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                  },
                }}
              >
                Add New Field
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {remainingFields.length === 0 ? (
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
                All fields assigned to sections
              </Box>
            ) : (
              remainingFields.map((f) => {
                const isCf = isCustomFieldKey(f.key);
                const cf = isCf ? customFields.find((c) => c.fieldKey === f.key) : undefined;
                return (
                  <PoolItem
                    key={f.key}
                    fieldKey={f.key}
                    label={f.label}
                    onClick={() => handlePoolItemClick(f.key)}
                    onDragStart={handlePoolDragStart}
                    isCustom={isCf}
                    onEdit={isCf && cf ? () => handleEditCustomField(cf) : undefined}
                    onDelete={isCf && cf ? () => handleDeleteCustomField(cf) : undefined}
                  />
                );
              })
            )}
          </Box>
        </Box>

        {/* ── Right Panel: Section Drop Zones ─────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: { xs: 300, md: 520 },
            p: 2,
            bgcolor: alpha('#f8faff', 1),
          }}
        >
          {sectionDefs.map((section) => {
            const selectedKeys = getSelectedFields(config, activeTab, section.key);

            const allCatalogFields =
              activeTab === 0
                ? CREATE_TICKET_SECTION_DEFS.flatMap((s) => s.fields)
                : DETAILS_SECTION_DEFS.flatMap((s) => s.fields);

            const catalogMap = new Map(allCatalogFields.map((f) => [f.key, f]));

            // Merge custom fields into the catalog so their display names
            // resolve correctly inside sections (otherwise the raw key is used).
            for (const cf of customFields) {
              catalogMap.set(cf.fieldKey, { key: cf.fieldKey, label: cf.fieldName });
            }

            const selectedFields = selectedKeys.map(
              (k) => catalogMap.get(k) || { key: k, label: k },
            );

            return (
              <SectionDropZone
                key={section.key}
                title={section.title}
                sectionKey={section.key}
                selectedFields={selectedFields}
                onFieldRemove={handleFieldRemove}
                onFieldMoveUp={moveSectionFieldUp}
                onFieldMoveDown={moveSectionFieldDown}
                isDragOver={dragOverSection === section.key}
                onDragOver={(e) => handleSectionDragOver(e, section.key)}
                onDragLeave={handleSectionDragLeave}
                onDrop={(e) => handleSectionDrop(e, section.key)}
              />
            );
          })}
        </Box>
      </Box>

      {/* ── Footer ──────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          onClick={onClose}
          variant='outlined'
          disabled={isSaving}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={isSaving}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>

      {/* ── Custom Field Dialog ───────────────────────────── */}
      <CustomFieldDialog
        open={cfDialogOpen}
        editing={editingCf}
        existingFields={customFields}
        categorization={categorization}
        ticketTypes={ticketTypeOptions}
        onClose={() => {
          setCfDialogOpen(false);
          setEditingCf(null);
        }}
        onSave={handleSaveCustomField}
      />
    </Dialog>
  );
};

export default TicketTypeLayoutDialog;
