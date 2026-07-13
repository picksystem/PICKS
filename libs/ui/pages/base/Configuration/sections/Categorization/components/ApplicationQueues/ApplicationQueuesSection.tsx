import { useState, useEffect, useCallback, useMemo } from 'react';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { darken } from '@mui/material/styles';
import { SearchField } from '../../../../shared/SearchField';
import { IConfigApplicationQueue } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationQueueFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationQueueFormDialog';
import { useSharedUsers } from '../../../../hooks/useSharedUsers';
import { Box, Button, Divider, Tooltip, Typography } from '@serviceops/component';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';
import { GenericAccordion } from '@serviceops/genericaccordion';
import {
  CATEG_ACCENT,
  APPLICATION_QUEUE_MAIN_CONFIG,
  IConfigApplicationQueueExtended,
  QUEUE_APPROVALS_CONFIG,
  QUEUE_TIMESHEET_CONFIG,
  QUEUE_EXPENSES_CONFIG,
} from '../shared';
import {
  QueueApprovalsSection,
  QueueTimesheetSection,
  QueueExpenseSection,
  QueueTicketTypeSection,
  QueueStickyNoteSection,
} from './panels';
import { QUEUE_TICKET_TYPE_CONFIG } from './panels/QueueTicketType/QueueTicketTypeSection.config';
import { QUEUE_STICKY_NOTE_CONFIG } from './panels/QueueStickyNote/QueueStickyNoteSection.config';
import { ApplicationQueueActiveView } from './ApplicationQueuesSection.types';

export interface ApplicationQueuesSectionProps {
  data?: IConfigApplicationQueue[];
  onDataChange?: (data: IConfigApplicationQueue[]) => void;
}

const VIEW_BUTTONS: { key: ApplicationQueueActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'queues',
    label: 'Application Queues',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'approvals',
    label: 'Queue Approvals',
    icon: <ChecklistIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    icon: <ToggleOnIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'timesheet',
    label: 'Add Timesheet Projects',
    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'expenses',
    label: 'Add Expenses Projects',
    icon: <ReceiptLongIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'stickyNote',
    label: 'Sticky Note',
    icon: <StickyNote2Icon sx={{ fontSize: '1rem' }} />,
  },
];

// Header content (icon/title/subtitle/accent) for the sub-view dialog,
// matching the gradient banner used by every Configuration page form
// dialog (see ConfigFormDialog in @serviceops/configdialogs). Each entry
// reuses the same TableConfig already driving that view's own GenericPanel,
// so the dialog header and the data table underneath always agree.
const VIEW_DIALOG_CONFIG: Partial<
  Record<
    ApplicationQueueActiveView,
    { title: string; subtitle?: string; accent: string; icon: React.ReactNode }
  >
> = {
  approvals: QUEUE_APPROVALS_CONFIG,
  ticketTypes: QUEUE_TICKET_TYPE_CONFIG,
  timesheet: QUEUE_TIMESHEET_CONFIG,
  expenses: QUEUE_EXPENSES_CONFIG,
  stickyNote: QUEUE_STICKY_NOTE_CONFIG,
};

// The ticket-type toggle list and the sticky note editor don't need the
// wide table layout the other sub-views use.
const DIALOG_WIDTH: Partial<Record<ApplicationQueueActiveView, 'sm' | 'md'>> = {
  ticketTypes: 'sm',
  stickyNote: 'md',
};

export const ApplicationQueuesSection = ({ data, onDataChange }: ApplicationQueuesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { options: userOptions } = useSharedUsers();
  const [activeView, setActiveView] = useState<ApplicationQueueActiveView>('queues');
  const [rows, setRows] = useState<IConfigApplicationQueue[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationQueue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.queues) {
      setRows(apiCat.queues);
    }
  }, [data, apiCat]);

  // The Approvals/Ticket Types/Timesheet/Expenses/Sticky Note buttons only
  // make sense in the context of a selected queue, so they stay hidden
  // until a row is selected — mirroring the User Management toolbar
  // (Service Lines/Applications use the same pattern). If the selection is
  // cleared while one of those views is active, fall back to the main
  // Application Queues table so the user isn't left on a view whose
  // toolbar button just disappeared.
  useEffect(() => {
    if (!selectedRowId && activeView !== 'queues') {
      setActiveView('queues');
    }
  }, [selectedRowId, activeView]);

  const handleSave = useCallback(
    (next: IConfigApplicationQueue[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      } else {
        saveSection('categorization', {
          businessCategories: apiCat?.businessCategories ?? [],
          serviceLines: apiCat?.serviceLines ?? [],
          applications: apiCat?.applications ?? [],
          queues: next,
          applicationCategories: apiCat?.applicationCategories ?? [],
          applicationSubCategories: apiCat?.applicationSubCategories ?? [],
          applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
        });
      }
    },
    [onDataChange, apiCat, saveSection],
  );

  // Drop-down options for the "Application" field. Sourced from the
  // existing applications list. value and label are the application
  // name; deduplicated case-insensitively and sorted alphabetically.
  const applicationOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    (apiCat?.applications ?? []).forEach((a) => {
      const name = String(a?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiCat?.applications]);

  // Drop-down options for the user-search fields (Queue lead, Manager
  // Level 1, Manager Level 2). Sourced from User Management → All Users
  // via the shared users cache. value and label are the user's full name
  // (firstName + ' ' + lastName). subtitle is the user's email and shows
  // as the secondary line in the popover, mirroring the User Management
  // data table. We store the full name so the data table can render the
  // name directly via the plain `mkCell` renderer. (If two users share a
  // name, both resolve to the same stored value; acceptable for this
  // internal team directory.)
  const userOpts = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string; subtitle?: string }[] = [];
    userOptions.forEach((u) => {
      const name = String(u.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({
        value: name,
        label: name,
        subtitle: u.email || undefined,
      });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [userOptions]);

  // Column definitions for the data table. Mirrors the Business
  // Categories / Applications table layout: bold cells for the primary
  // identifiers, description-style rendering for the multi-line text
  // fields, and a plain render for the user fields (which already
  // store the full name).
  const queueColumns: Column<IConfigApplicationQueueExtended>[] = useMemo(
    () => [
      { id: 'applicationName', label: 'Application', minWidth: 160, format: mkCell(true) },
      { id: 'name', label: 'Queue Name', minWidth: 180, format: mkCell(true) },
      { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
      { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
      { id: 'queueSpecificLead', label: 'Queue lead', minWidth: 160, format: mkCell() },
      { id: 'managerLevel1', label: 'Manager Level 1', minWidth: 160, format: mkCell() },
      { id: 'managerLevel2', label: 'Manager Level 2', minWidth: 160, format: mkCell() },
      { id: 'internalNote', label: 'Internal note', minWidth: 200, format: mkDescCell },
    ],
    [],
  );

  const handleNewClick = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback(() => {
    const selected = rows.find((r) => r.id === selectedRowId);
    if (selected) {
      setEditingRow(selected);
      setDialogOpen(true);
    }
  }, [rows, selectedRowId]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingRow(null);
  }, []);

  const handleDialogSave = useCallback(
    (form: Partial<IConfigApplicationQueue>) => {
      const myId = editingRow?.id;
      const next: IConfigApplicationQueue[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              applicationId: form.applicationId ?? '',
              applicationName: form.applicationName ?? '',
              name: form.name ?? '',
              shortDescription: form.shortDescription ?? '',
              description: form.description ?? '',
              predecessor: form.predecessor ?? '',
              successor: form.successor ?? '',
              queueSpecificLead: form.queueSpecificLead ?? '',
              managerLevel1: form.managerLevel1 ?? '',
              managerLevel2: form.managerLevel2 ?? '',
              internalNote: form.internalNote,
              approvals: [],
              ticketTypeActivations: [],
              timesheetProjects: [],
              expenseProjects: [],
              stickyNote: '',
            } as IConfigApplicationQueue,
          ];
      handleSave(next);
      handleDialogClose();
    },
    [rows, editingRow, handleSave, handleDialogClose],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRowId) return;
    try {
      const next = rows.filter((r) => r.id !== selectedRowId);
      handleSave(next);
      setSelectedRowId(null);
    } catch {
      // Errors already surface via saveSection; just close the dialog.
    } finally {
      setDeleteOpen(false);
    }
  }, [selectedRowId, rows, handleSave]);

  const allApprovals =
    rows?.flatMap((q) =>
      (q.approvals || []).map((ap) => ({ ...ap, queueId: q.id, queueName: q.name })),
    ) || [];

  const allTimesheets =
    rows?.flatMap((q) =>
      (q.timesheetProjects || []).map((ts) => ({
        ...ts,
        queueId: q.id,
        queueName: q.name,
      })),
    ) || [];

  const allExpenses =
    rows?.flatMap((q) =>
      (q.expenseProjects || []).map((ex) => ({
        ...ex,
        queueId: q.id,
        queueName: q.name,
      })),
    ) || [];

  const handleSubPanelSave = (
    field: 'approvals' | 'timesheetProjects' | 'expenseProjects',
    updatedItems: { queueId?: string }[],
  ) => {
    const updated = rows.map((q) => ({
      ...q,
      [field]: updatedItems.filter((item) => item.queueId === q.id),
    }));
    handleSave(updated);
  };

  const handleTicketTypeToggle = (
    ticketTypeKey: string,
    enabled: boolean,
    ttId: string | number,
  ) => {
    const updated = rows.map((q) => {
      const existingActivations = q.ticketTypeActivations || [];
      const existingIndex = existingActivations.findIndex((ta) => ta.ticketTypeId === ttId);

      let newActivations;
      if (existingIndex >= 0) {
        newActivations = existingActivations.map((ta, idx) =>
          idx === existingIndex ? { ...ta, enabled } : ta,
        );
      } else {
        newActivations = [
          ...existingActivations,
          { ticketTypeId: ttId as number, ticketTypeName: ticketTypeKey, enabled },
        ];
      }

      return { ...q, ticketTypeActivations: newActivations };
    });
    handleSave(updated);
  };

  const handleStickyNoteChange = (stickyNote: string) => {
    const updated = rows.map((q, idx) => (idx === 0 ? { ...q, stickyNote } : q));
    handleSave(updated);
  };

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  // Search box in the custom toolbar (GenericPanel's own is hidden via
  // hideToolbar since New/Edit/Delete/Clear are driven externally) — matches
  // the "search across every visible field" behavior used elsewhere (e.g.
  // UserManagementSection's table search).
  const filteredRows = search
    ? rows.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : rows;

  return (
    <GenericAccordion
      title='Application Queues'
      subtitle='Configure queues with associated approvals, timesheets, and expenses'
      icon={<HeadsetMicIcon sx={{ fontSize: '1rem' }} />}
      accent={CATEG_ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedRowId && (
            <Tooltip title='Create new application queue'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleNewClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New Queue
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Edit selected queue'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Edit
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Delete selected queue'>
              <Button
                size='small'
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Delete
              </Button>
            </Tooltip>
          )}

          {selectedRowId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedRowId &&
            VIEW_BUTTONS.filter((btn) => btn.key !== 'queues').map((btn) => (
              <Tooltip key={btn.key} title={btn.label}>
                <Button
                  size='small'
                  variant={activeView === btn.key ? 'contained' : 'outlined'}
                  startIcon={btn.icon}
                  onClick={() => setActiveView(btn.key)}
                  sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                >
                  {btn.label}
                </Button>
              </Tooltip>
            ))}

          {selectedRowId && <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />}

          {selectedRowId && (
            <Tooltip title='Clear selection'>
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedRowId(null)}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            </Tooltip>
          )}

          {!selectedRowId && (
            // SearchField's own wrapper defaults to width: 100% (meant for
            // standalone use), which forces it onto its own row inside a
            // flex toolbar — the `sx` prop can't win against that class
            // (same specificity, injection order dependent), so it's
            // wrapped in its own flexShrink:0 Box instead, keeping it
            // inline with the New button and pushed to the far right.
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <SearchField value={search} onChange={setSearch} className={classes.tableSearchField} />
            </Box>
          )}
        </Box>
      </GenericToolbar>
      {activeView === 'queues' && (
        <>
          <GenericPanel
            config={APPLICATION_QUEUE_MAIN_CONFIG}
            data={filteredRows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={queueColumns as unknown as undefined}
            variant='standard'
            hideHeader
            hideToolbar
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
          />

          <ApplicationQueueFormDialog
            open={dialogOpen}
            editing={editingRow}
            existingQueues={rows}
            applicationOptions={applicationOptions}
            userOptions={userOpts}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
            subtitle={APPLICATION_QUEUE_MAIN_CONFIG.subtitle}
          />

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            entityName='Application Queue'
            itemName={selectedRow?.name ?? ''}
          />
        </>
      )}
      {/* Approvals/Ticket Types/Timesheet/Expenses/Sticky Note open as a
          dialog over the Application Queues table (matching the User
          Management "Changes Log" dialog pattern and the Service
          Lines/Applications sections) instead of swapping the inline
          accordion body. The header mirrors every Configuration form
          dialog's gradient banner (see ConfigFormDialog) — icon + title +
          subtitle on an accent gradient, with a close (X) button. Each
          sub-panel is rendered with hideHeader so its own icon+title
          banner doesn't duplicate this one; it still keeps its normal data
          table + New/Edit/Delete toolbar. */}
      <Dialog
        open={activeView !== 'queues'}
        onClose={() => setActiveView('queues')}
        maxWidth={DIALOG_WIDTH[activeView] ?? 'xl'}
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '90vh' } }}
      >
        {(() => {
          const dlgConfig = VIEW_DIALOG_CONFIG[activeView];
          if (!dlgConfig) return null;
          return (
            <Box
              sx={{
                px: 3,
                py: 2.5,
                background: `linear-gradient(135deg, ${darken(dlgConfig.accent, 0.18)} 0%, ${dlgConfig.accent} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.75,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
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
                  <Box
                    sx={{
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {dlgConfig.icon}
                  </Box>
                </Box>
                <Box>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
                  >
                    {dlgConfig.title}
                  </Typography>
                  {dlgConfig.subtitle && (
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
                      {dlgConfig.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setActiveView('queues')} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          );
        })()}
        <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
          {activeView === 'approvals' && (
            <QueueApprovalsSection
              data={allApprovals}
              onDataChange={(next) => handleSubPanelSave('approvals', next)}
              hideHeader
              initialQueueFilter={selectedRow?.name}
            />
          )}
          {activeView === 'ticketTypes' && (
            <QueueTicketTypeSection
              rows={rows}
              onTicketTypeToggle={handleTicketTypeToggle}
              hideHeader
            />
          )}
          {activeView === 'timesheet' && (
            <QueueTimesheetSection
              data={allTimesheets}
              onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
              hideHeader
              initialQueueFilter={selectedRow?.name}
            />
          )}
          {activeView === 'expenses' && (
            <QueueExpenseSection
              data={allExpenses}
              onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
              hideHeader
              initialQueueFilter={selectedRow?.name}
            />
          )}
          {activeView === 'stickyNote' && (
            <QueueStickyNoteSection rows={rows} onStickyNoteChange={handleStickyNoteChange} />
          )}
        </DialogContent>
      </Dialog>
    </GenericAccordion>
  );
};
