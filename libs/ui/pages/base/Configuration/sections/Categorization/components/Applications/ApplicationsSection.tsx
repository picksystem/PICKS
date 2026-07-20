import { useState, useEffect, useCallback, useMemo } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AppsIcon from '@mui/icons-material/Apps';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { darken } from '@mui/material/styles';
import { SearchField } from '../../../../shared/SearchField';
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
import { Box, Button, Divider, Tooltip, Typography, type Column } from '@serviceops/component';
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
import { APP_APPROVALS_CONFIG } from './panels/AppApprovals/AppApprovalsSection.config';
import { APP_TIMESHEET_CONFIG } from './panels/AppTimesheet/AppTimesheetSection.config';
import { APP_EXPENSES_CONFIG } from './panels/AppExpenses/AppExpensesSection.config';
import { APP_SUPPORT_LINES_CONFIG } from './panels/AppSupportLines/AppSupportLinesSection.config';
import { TICKET_TYPE_TOGGLE_CONFIG as APP_TICKET_TYPE_CONFIG } from './panels/AppTicketType/AppTicketTypeSection.config';
import { APP_STICKY_NOTE_CONFIG } from './panels/AppStickyNote/AppStickyNoteSection.config';
import { CATEG_ACCENT, APPLICATION_MAIN_CONFIG, APP_BILLING_CODES_CONFIG } from '../shared';
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

// Header content (icon/title/subtitle/accent) for the sub-view dialog,
// matching the gradient banner used by every Configuration page form
// dialog (see ConfigFormDialog in @serviceops/configdialogs). Each entry
// reuses the same TableConfig already driving that view's own GenericPanel,
// so the dialog header and the data table underneath always agree.
const VIEW_DIALOG_CONFIG: Partial<
  Record<
    ApplicationActiveView,
    { title: string; subtitle?: string; accent: string; icon: React.ReactNode }
  >
> = {
  approvals: APP_APPROVALS_CONFIG,
  timesheet: APP_TIMESHEET_CONFIG,
  expenses: APP_EXPENSES_CONFIG,
  supportLines: APP_SUPPORT_LINES_CONFIG,
  billingCodes: APP_BILLING_CODES_CONFIG,
  ticketTypes: APP_TICKET_TYPE_CONFIG,
  stickyNote: APP_STICKY_NOTE_CONFIG,
};

// The ticket-type toggle list and the sticky note editor don't need the
// wide table layout the other sub-views use.
const DIALOG_WIDTH: Partial<Record<ApplicationActiveView, 'sm' | 'md'>> = {
  ticketTypes: 'sm',
  stickyNote: 'md',
};

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applications) {
      setRows(apiCat.applications);
    }
  }, [data, apiCat]);

  // The Approvals/Timesheet/Expenses/Support Lines/Billing Codes/Ticket
  // Types/Sticky Note buttons only make sense in the context of a selected
  // application, so they stay hidden until a row is selected — mirroring
  // the User Management toolbar (Service Lines uses the same pattern). If
  // the selection is cleared while one of those views is active, fall back
  // to the main Applications table so the user isn't left on a view whose
  // toolbar button just disappeared.
  useEffect(() => {
    if (!selectedRowId && activeView !== 'applications') {
      setActiveView('applications');
    }
  }, [selectedRowId, activeView]);

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

  const selectedRow = rows.find((r) => r.id === selectedRowId) ?? null;

  // Search box in the custom toolbar (GenericPanel's own is hidden via
  // hideToolbar since New/Edit/Delete/Clear are driven externally) — matches
  // the "search across every visible field" behavior used elsewhere (e.g.
  // UserManagementSection's table search).
  const filteredRows = search
    ? rows.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : rows;

  return (
    <GenericAccordion
      title='Applications'
      subtitle='Manage applications linked to service lines and configure their specific settings'
      icon={<AppsIcon sx={{ fontSize: '1rem' }} />}
      accent={CATEG_ACCENT}
      className={classes.sectionAccordion}
      defaultExpanded={false}
    >
      <GenericToolbar className={classes.actionToolbar}>
        <Box className={classes.toolbarButtons}>
          {!selectedRowId && (
            <Tooltip title='Create new application'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={handleNewClick}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Add New Application
              </Button>
            </Tooltip>
          )}

          {selectedRowId && (
            <Tooltip title='Edit selected application'>
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
            <Tooltip title='Delete selected application'>
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
            VIEW_BUTTONS.filter((btn) => btn.key !== 'applications').map((btn) => (
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
              <SearchField
                value={search}
                onChange={setSearch}
                className={classes.tableSearchField}
              />
            </Box>
          )}
        </Box>
      </GenericToolbar>
      {activeView === 'applications' && (
        <>
          <GenericPanel
            config={APPLICATION_MAIN_CONFIG}
            data={filteredRows as unknown as Record<string, unknown>[]}
            onSave={handleSave as (data: unknown[]) => void}
            customColumns={applicationColumns as unknown as undefined}
            variant='standard'
            hideHeader
            hideToolbar
            selectedRowId={selectedRowId}
            onRowSelect={setSelectedRowId}
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
      {/* Approvals/Timesheet/Expenses/Support Lines/Billing Codes/Ticket
          Types/Sticky Note open as a dialog over the Applications table
          (matching the User Management "Changes Log" dialog pattern and the
          Service Lines section) instead of swapping the inline accordion
          body. The header mirrors every Configuration form dialog's
          gradient banner (see ConfigFormDialog) — icon + title + subtitle
          on an accent gradient, with a close (X) button. Each sub-panel is
          rendered with hideHeader so its own icon+title banner doesn't
          duplicate this one; it still keeps its normal data table +
          New/Edit/Delete toolbar. */}
      <Dialog
        open={activeView !== 'applications'}
        onClose={() => setActiveView('applications')}
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
                    <Typography
                      sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}
                    >
                      {dlgConfig.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setActiveView('applications')} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          );
        })()}
        <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
          {activeView === 'approvals' && (
            <AppApprovalsSection
              data={allApprovals}
              onDataChange={(next) => handleSubPanelSave('approvals', next)}
              hideHeader
              initialApplicationFilter={selectedRow?.name}
            />
          )}
          {activeView === 'timesheet' && (
            <AppTimesheetSection
              data={allTimesheets}
              onDataChange={(next) => handleSubPanelSave('timesheetProjects', next)}
              hideHeader
              initialApplicationFilter={selectedRow?.name}
            />
          )}
          {activeView === 'expenses' && (
            <AppExpensesSection
              data={allExpenses}
              onDataChange={(next) => handleSubPanelSave('expenseProjects', next)}
              hideHeader
              initialApplicationFilter={selectedRow?.name}
            />
          )}
          {activeView === 'supportLines' && (
            <AppSupportLinesSection
              data={allSupportLines}
              onDataChange={(next) => handleSubPanelSave('supportLines', next)}
              hideHeader
              initialApplicationFilter={selectedRow?.name}
            />
          )}
          {activeView === 'billingCodes' && (
            <AppBillingCodesSection
              data={allBillingCodes}
              onDataChange={(next) => handleSubPanelSave('billingCodes', next)}
              hideHeader
              initialApplicationFilter={selectedRow?.name}
            />
          )}
          {activeView === 'ticketTypes' && (
            <AppTicketTypeSection
              rows={rows}
              onTicketTypeToggle={handleTicketTypeToggle}
              hideHeader
            />
          )}
          {activeView === 'stickyNote' && (
            <AppStickyNoteSection rows={rows} onStickyNoteChange={handleStickyNoteChange} />
          )}
        </DialogContent>
      </Dialog>
    </GenericAccordion>
  );
};
