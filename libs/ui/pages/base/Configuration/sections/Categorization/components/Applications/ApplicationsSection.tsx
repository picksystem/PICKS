import { useState, useEffect, useCallback, useMemo } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AppsIcon from '@mui/icons-material/Apps';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import {
  IConfigApplication,
  IConfigServiceLine,
  IConfigServiceLineTicketType,
} from '@serviceops/interfaces';
import { GenericToolbar } from '@serviceops/generictoolbar';
import { GenericPanel } from '@serviceops/genericpanel';
import { ConfigDeleteDialog } from '@serviceops/configdialogs';
import { ApplicationsFormDialog } from '@serviceops/pages/base/Configuration/dialogs/ApplicationsFormDialog';
import { useSharedUsers } from '../../../../hooks/useSharedUsers';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';
import {
  AppApprovalsSection,
  AppTimesheetSection,
  AppExpensesSection,
  AppSupportLinesSection,
  AppBillingCodesSection,
  AppTicketTypeSection,
  AppStickyNoteSection,
} from './panels';
import { CATEG_ACCENT, APPLICATION_MAIN_CONFIG } from '../shared';
import { ApplicationActiveView } from './ApplicationsSection.types';
import { useStyles } from '../../styles';
import { GenericAccordion } from '@serviceops/genericaccordion';
import { useConfiguration } from '@serviceops/confighooks';

export interface ApplicationsSectionProps {
  data?: IConfigApplication[];
  serviceLines?: IConfigServiceLine[];
  onDataChange?: (data: IConfigApplication[]) => void;
}

const VIEW_BUTTONS: { key: ApplicationActiveView; label: string; icon: React.ReactNode }[] = [
  {
    key: 'applications',
    label: 'Applications',
    icon: <AppsIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'approvals',
    label: 'Application Approvals',
    icon: <HowToRegIcon sx={{ fontSize: '1rem' }} />,
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
    key: 'supportLines',
    label: 'Support Lines / Queues',
    icon: <HeadsetMicIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'billingCodes',
    label: 'Billing Codes',
    icon: <CodeIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'ticketTypes',
    label: 'Enable / Disable Ticket Types',
    icon: <ToggleOnIcon sx={{ fontSize: '1rem' }} />,
  },
  {
    key: 'stickyNote',
    label: 'Sticky Note',
    icon: <StickyNote2Icon sx={{ fontSize: '1rem' }} />,
  },
];

export const ApplicationsSection = ({ data, onDataChange }: ApplicationsSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { options: userOptions } = useSharedUsers();
  const [activeView, setActiveView] = useState<ApplicationActiveView>('applications');
  const [rows, setRows] = useState<IConfigApplication[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applications) {
      setRows(apiCat.applications);
    }
  }, [data, apiCat]);

  const handleSave = useCallback(
    (next: IConfigApplication[]) => {
      setRows(next);
      if (onDataChange) {
        onDataChange(next);
      } else {
        saveSection('categorization', {
          businessCategories: apiCat?.businessCategories ?? [],
          serviceLines: apiCat?.serviceLines ?? [],
          applications: next,
          queues: apiCat?.queues ?? [],
          applicationCategories: apiCat?.applicationCategories ?? [],
          applicationSubCategories: apiCat?.applicationSubCategories ?? [],
          applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
        });
      }
    },
    [onDataChange, apiCat, saveSection],
  );

  // Drop-down options for the "Service line" field. Sourced from the
  // existing service-lines list. value and label are the service line
  // name; deduplicated case-insensitively and sorted alphabetically.
  const serviceLineOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    (apiCat?.serviceLines ?? []).forEach((sl) => {
      const name = String(sl?.name ?? '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: name, label: name });
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [apiCat?.serviceLines]);

  // Drop-down options for the user-search fields (Application lead,
  // Manager Level 1, Manager Level 2). Sourced from User Management →
  // All Users via the shared users cache. value and label are the
  // user's full name (firstName + ' ' + lastName). subtitle is the
  // user's email and shows as the secondary line in the popover. We
  // store the full name so the data table can render the name directly
  // via the plain `mkCell` renderer. (If two users share a name, both
  // resolve to the same stored value; acceptable for this internal
  // team directory.)
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
  // Categories / Service Lines table layout: bold cells for the
  // primary identifiers, description-style rendering for the
  // multi-line text fields, and a plain render for the user fields
  // (which already store the full name).
  const applicationColumns: Column<IConfigApplication>[] = useMemo(
    () => [
      { id: 'serviceLineName', label: 'Service line', minWidth: 160, format: mkCell(true) },
      { id: 'name', label: 'Application name', minWidth: 180, format: mkCell(true) },
      { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
      { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
      { id: 'applicationLead', label: 'Application lead', minWidth: 160, format: mkCell() },
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
    (form: Partial<IConfigApplication>) => {
      const myId = editingRow?.id;
      const next: IConfigApplication[] = myId
        ? rows.map((r) => (r.id === myId ? { ...r, ...form, id: r.id } : r))
        : [
            ...rows,
            {
              id: `${Date.now()}`,
              serviceLineId: form.serviceLineId ?? '',
              serviceLineName: form.serviceLineName ?? '',
              name: form.name ?? '',
              shortDescription: form.shortDescription ?? '',
              description: form.description ?? '',
              applicationLead: form.applicationLead ?? '',
              managerLevel1: form.managerLevel1 ?? '',
              managerLevel2: form.managerLevel2 ?? '',
              internalNote: form.internalNote,
              enableSupportLevels: false,
              approvals: [],
              ticketTypeActivations: [],
              supportLines: [],
              billingCodes: [],
              timesheetProjects: [],
              expenseProjects: [],
              stickyNote: '',
            } as IConfigApplication,
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
    rows?.flatMap((app) =>
      (app.approvals || []).map((ap) => ({
        ...ap,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allTimesheets =
    rows?.flatMap((app) =>
      (app.timesheetProjects || []).map((ts) => ({
        ...ts,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allExpenses =
    rows?.flatMap((app) =>
      (app.expenseProjects || []).map((ex) => ({
        ...ex,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allSupportLines =
    rows?.flatMap((app) =>
      (app.supportLines || []).map((sl) => ({
        ...sl,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const allBillingCodes =
    rows?.flatMap((app) =>
      (app.billingCodes || []).map((bc) => ({
        ...bc,
        applicationId: app.id,
        applicationName: app.name,
      })),
    ) || [];

  const handleSubPanelSave = (
    field: 'approvals' | 'timesheetProjects' | 'expenseProjects' | 'supportLines' | 'billingCodes',
    updatedItems: { applicationId?: string }[],
  ) => {
    const updated = rows.map((app) => ({
      ...app,
      [field]: updatedItems.filter((item) => item.applicationId === app.id),
    }));
    handleSave(updated);
  };

  const handleTicketTypeToggle = (
    ticketTypeKey: string,
    enabled: boolean,
    ttId: string | number,
  ) => {
    const updated = rows.map((app) => {
      const existingActivations = app.ticketTypeActivations || [];
      const existingIndex = existingActivations.findIndex((ta) => ta.ticketTypeId === ttId);

      let newActivations: IConfigServiceLineTicketType[];
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

      return { ...app, ticketTypeActivations: newActivations };
    });
    handleSave(updated);
  };

  const handleStickyNoteChange = (stickyNote: string) => {
    const updated = rows.map((app, idx) => (idx === 0 ? { ...app, stickyNote } : app));
    handleSave(updated);
  };

  return (
    <GenericAccordion
      title='Applications'
      subtitle='Manage applications linked to service lines and configure their specific settings'
      icon={<AppsIcon sx={{ fontSize: '1rem' }} />}
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
      {activeView === 'applications' && (
        <>
          <GenericPanel
            config={APPLICATION_MAIN_CONFIG}
            data={rows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={applicationColumns as unknown as undefined}
            variant='standard'
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
            onNewClick={handleNewClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />

          <ApplicationsFormDialog
            open={dialogOpen}
            editing={editingRow}
            existingApplications={rows}
            serviceLineOptions={serviceLineOptions}
            userOptions={userOpts}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
            subtitle={APPLICATION_MAIN_CONFIG.subtitle}
          />

          <ConfigDeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            entityName='Application'
            itemName={editingRow?.name ?? ''}
          />
        </>
      )}
      {activeView === 'approvals' && (
        <AppApprovalsSection
          data={allApprovals}
          onDataChange={(next) => handleSubPanelSave('approvals', next)}
        />
      )}
      {activeView === 'timesheet' && (
        <AppTimesheetSection
          data={allTimesheets}
          onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
        />
      )}
      {activeView === 'expenses' && (
        <AppExpensesSection
          data={allExpenses}
          onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
        />
      )}
      {activeView === 'supportLines' && (
        <AppSupportLinesSection
          data={allSupportLines}
          onDataChange={(next) => handleSubPanelSave('supportLines', next)}
        />
      )}
      {activeView === 'billingCodes' && (
        <AppBillingCodesSection
          data={allBillingCodes}
          onDataChange={(next) => handleSubPanelSave('billingCodes', next)}
        />
      )}
      {activeView === 'ticketTypes' && (
        <AppTicketTypeSection rows={rows} onTicketTypeToggle={handleTicketTypeToggle} />
      )}
      {activeView === 'stickyNote' && (
        <AppStickyNoteSection rows={rows} onStickyNoteChange={handleStickyNoteChange} />
      )}
    </GenericAccordion>
  );
};
