import { useState, useEffect, useCallback, useMemo } from 'react';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { IConfigApplicationQueue } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/confighooks';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationQueueFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationQueueFormDialog';
import { useSharedUsers } from '../../../../hooks/useSharedUsers';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';
import { GenericAccordion } from '@serviceops/genericaccordion';
import {
  CATEG_ACCENT,
  APPLICATION_QUEUE_MAIN_CONFIG,
  IConfigApplicationQueueExtended,
} from '../shared';
import {
  QueueApprovalsSection,
  QueueTimesheetSection,
  QueueExpenseSection,
  QueueTicketTypeSection,
  QueueStickyNoteSection,
} from './panels';
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

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.queues) {
      setRows(apiCat.queues);
    }
  }, [data, apiCat]);

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

  return (
    <GenericAccordion
      title='Application Queues'
      subtitle='Configure queues with associated approvals, timesheets, and expenses'
      icon={<HeadsetMicIcon sx={{ fontSize: '1rem' }} />}
      accent={CATEG_ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar
        buttons={VIEW_BUTTONS.map((btn) => ({
          key: btn.key,
          label: btn.label,
          icon: btn.icon,
          isActive: activeView === btn.key,
          onClick: () => setActiveView(btn.key),
        }))}
      />
      {activeView === 'queues' && (
        <>
          <GenericPanel
            config={APPLICATION_QUEUE_MAIN_CONFIG}
            data={rows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={queueColumns as unknown as undefined}
            variant='standard'
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
            onNewClick={handleNewClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
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
      {activeView === 'approvals' && (
        <QueueApprovalsSection
          data={allApprovals}
          onDataChange={(next) => handleSubPanelSave('approvals', next)}
        />
      )}
      {activeView === 'ticketTypes' && (
        <QueueTicketTypeSection rows={rows} onTicketTypeToggle={handleTicketTypeToggle} />
      )}
      {activeView === 'timesheet' && (
        <QueueTimesheetSection
          data={allTimesheets}
          onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
        />
      )}
      {activeView === 'expenses' && (
        <QueueExpenseSection
          data={allExpenses}
          onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
        />
      )}
      {activeView === 'stickyNote' && (
        <QueueStickyNoteSection rows={rows} onStickyNoteChange={handleStickyNoteChange} />
      )}
    </GenericAccordion>
  );
};
