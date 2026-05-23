import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  DataTable,
  Column,
  Chip,
  Switch,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel as MuiFormControlLabel,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import AppsIcon from '@mui/icons-material/Apps';
import ClearIcon from '@mui/icons-material/Clear';
import {
  IConfigApplication,
  IConfigServiceLine,
  IConfigApproval,
  IConfigServiceLineTicketType,
  IConfigSupportLine,
  IConfigBillingCode,
  IConfigTimesheetProject,
  IConfigExpenseProject,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { PanelHeader, NoPick } from '../shared';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const ACCENT_w = '#0369a1';

type FlatAppApRow = IConfigApproval & { applicationId: string; applicationName: string };
type FlatAppSlRow = IConfigSupportLine & { applicationId: string; applicationName: string };
type FlatAppBcRow = IConfigBillingCode & { applicationId: string; applicationName: string };
type FlatAppTsRow = IConfigTimesheetProject & { applicationId: string; applicationName: string };
type FlatAppExRow = IConfigExpenseProject & { applicationId: string; applicationName: string };

const EMPTY_APP_FORM = {
  serviceLineId: '',
  serviceLineName: '',
  name: '',
  description: '',
  enableSupportLevels: false,
  applicationLead: '',
  managerLevel1: '',
  managerLevel2: '',
};

const EMPTY_AAP: Omit<IConfigApproval, 'id'> = {
  approverName: '',
  approverRole: '',
  approvalOrder: 1,
  isRequired: true,
};

const EMPTY_ASL: Omit<IConfigSupportLine, 'id'> = { name: '', description: '', isActive: true };
const EMPTY_ABC: Omit<IConfigBillingCode, 'id'> = { code: '', description: '', isActive: true };
const EMPTY_ATS_FORM = {
  applicationId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};
const EMPTY_AEX_FORM = {
  applicationId: '',
  project: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxAmountPerDay: 0,
};

type AppActivePanel =
  | 'none'
  | 'approvals'
  | 'ticketTypes'
  | 'supportLines'
  | 'billingCodes'
  | 'timesheet'
  | 'stickyNote'
  | 'expenses';

interface ApplicationsSectionProps {
  data?: IConfigApplication[];
  serviceLines?: IConfigServiceLine[];
  onDataChange?: (data: IConfigApplication[]) => void;
}

const ApplicationsSection = ({
  data,
  serviceLines: providedServiceLines,
  onDataChange,
}: ApplicationsSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection, ticketTypeKeys } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplication | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_FORM);
  const [activePanel, setActivePanel] = useState<AppActivePanel>('none');

  const serviceLines = providedServiceLines ?? apiCat?.serviceLines ?? [];

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.applications) {
      setRows(apiCat.applications);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              serviceLineId: editingRow.serviceLineId,
              serviceLineName: editingRow.serviceLineName,
              name: editingRow.name,
              description: editingRow.description,
              enableSupportLevels: editingRow.enableSupportLevels,
              applicationLead: editingRow.applicationLead,
              managerLevel1: editingRow.managerLevel1,
              managerLevel2: editingRow.managerLevel2,
            }
          : EMPTY_APP_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.serviceLineName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationLead.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigApplication[]) => {
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
  };

  const handleServiceLineChange = (id: string) => {
    const sl = serviceLines.find((s) => s.id === id);
    setForm((f) => ({ ...f, serviceLineId: id, serviceLineName: sl?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplication = {
        id: `app_${Date.now()}`,
        ...form,
        approvals: [],
        ticketTypeActivations: [],
        supportLines: [],
        billingCodes: [],
        timesheetProjects: [],
        expenseProjects: [],
        stickyNote: '',
      };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const handleSubPanelSave = (updated: IConfigApplication) =>
    saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));

  const togglePanel = (panel: AppActivePanel) =>
    setActivePanel((prev) => (prev === panel ? 'none' : panel));

  const panelActive = activePanel !== 'none';

  const appColumns: Column<IConfigApplication>[] = [
    {
      id: 'serviceLineName',
      label: 'Service Line',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Application Name',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'enableSupportLevels',
      label: 'Enable Support Levels / Queues',
      minWidth: 190,
      format: (v): React.ReactNode => (
        <Chip
          label={v ? 'Enabled' : 'Disabled'}
          size='small'
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 20,
            bgcolor: v ? alpha('#2d5ebb', 0.1) : alpha('#64748b', 0.08),
            color: v ? ACCENT_w : 'text.secondary',
          }}
        />
      ),
    },
    {
      id: 'applicationLead',
      label: 'Application Lead',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'managerLevel1',
      label: 'Manager Level 1',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'managerLevel2',
      label: 'Manager Level 2',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DashboardIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Applications</Typography>
            <Typography className={classes.sectionSubtitle}>
              Manage applications linked to service lines and configure their specific settings
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              size='small'
              startIcon={<AppsIcon />}
              variant={!panelActive ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('none')}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: '#2d5ebb',
                bgcolor: !panelActive ? '#2d5ebb' : undefined,
                color: !panelActive ? '#fff' : '#2d5ebb',
                '&:hover': {
                  bgcolor: !panelActive ? '#2d5ebb' : alpha('#2d5ebb', 0.08),
                  borderColor: '#2d5ebb',
                },
              }}
            >
              Applications
            </Button>

            <Button
              size='small'
              startIcon={<ChecklistIcon />}
              variant={activePanel === 'approvals' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('approvals')}
            >
              Approvals
            </Button>
            <Button
              size='small'
              startIcon={<ToggleOnIcon />}
              variant={activePanel === 'ticketTypes' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('ticketTypes')}
            >
              Enable / Disable Ticket Types
            </Button>
            <Button
              size='small'
              startIcon={<HeadsetMicIcon />}
              variant={activePanel === 'supportLines' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('supportLines')}
            >
              Support Lines / Queues
            </Button>
            <Button
              size='small'
              startIcon={<CodeIcon />}
              variant={activePanel === 'billingCodes' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('billingCodes')}
            >
              Billing Codes
            </Button>
            <Button
              size='small'
              startIcon={<AccessTimeIcon />}
              variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('timesheet')}
            >
              Add Timesheet Projects
            </Button>
            <Button
              size='small'
              startIcon={<NoteAltIcon />}
              variant={activePanel === 'stickyNote' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('stickyNote')}
            >
              Add Sticky Note
            </Button>
            <Button
              size='small'
              startIcon={<ReceiptLongIcon />}
              variant={activePanel === 'expenses' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('expenses')}
            >
              Add Expenses Projects
            </Button>
          </Box>
        </Paper>

        {!panelActive && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                bgcolor: alpha('#2d5ebb', 0.08),
                border: '1px solid',
                borderColor: alpha('#2d5ebb', 0.25),
                borderRadius: '10px 10px 0 0',
                borderBottom: 'none',
              }}
            >
              <AppsIcon sx={{ color: '#2d5ebb', fontSize: '1.1rem' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
                Applications
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                {rows.length} application{rows.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Paper
              variant='outlined'
              sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
            >
              <Box className={classes.toolbarButtons}>
                {!selectedRow ? (
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                  >
                    New
                  </Button>
                ) : (
                  <>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditingRow(selectedRow);
                        setDialogOpen(true);
                      }}
                      sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                    <Box
                      component='span'
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        width: '1px',
                        height: '20px',
                        bgcolor: alpha('#2d5ebb', 0.3),
                        mx: 0.75,
                        alignSelf: 'center',
                      }}
                    />
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<ClearIcon />}
                      onClick={() => setSelectedId(null)}
                    >
                      Clear
                    </Button>
                  </>
                )}
                <TextField
                  size='small'
                  placeholder='Search…'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={classes.tableSearchField}
                  sx={{ ml: { xs: 0, sm: 'auto' } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <SearchIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Paper>

            <Paper elevation={1} className={classes.tablePaper} sx={{ borderTop: 'none' }}>
              <DataTable
                columns={appColumns}
                data={filtered}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
                activeRowKey={selectedId ?? undefined}
              />
            </Paper>
          </>
        )}

        {activePanel === 'approvals' && (
          <AppApprovalsPanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'ticketTypes' && (
          <AppTicketTypePanel
            applications={rows}
            defaultApplicationId={selectedId}
            allTicketTypeKeys={ticketTypeKeys}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'supportLines' && (
          <AppSupportLinesPanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'billingCodes' && (
          <AppBillingCodesPanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'timesheet' && (
          <AppTimesheetPanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'stickyNote' && (
          <AppStickyNotePanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'expenses' && (
          <AppExpensePanel
            applications={rows}
            defaultApplicationId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AppsIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Application'
        subtitle='Manage applications linked to service lines and configure their specific settings'
        submitDisabled={!form.name.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        <FormControl size='small' fullWidth required>
          <InputLabel>Service Line</InputLabel>
          <Select
            label='Service Line'
            value={form.serviceLineId}
            onChange={(e) => handleServiceLineChange(e.target.value)}
          >
            {serviceLines.map((sl) => (
              <MenuItem key={sl.id} value={sl.id}>
                {sl.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label='Application Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <TextField
          label='Application Lead'
          size='small'
          fullWidth
          value={form.applicationLead}
          onChange={(e) => setForm((f) => ({ ...f, applicationLead: e.target.value }))}
        />
        <TextField
          label='Manager Level 1'
          size='small'
          fullWidth
          value={form.managerLevel1}
          onChange={(e) => setForm((f) => ({ ...f, managerLevel1: e.target.value }))}
        />
        <TextField
          label='Manager Level 2'
          size='small'
          fullWidth
          value={form.managerLevel2}
          onChange={(e) => setForm((f) => ({ ...f, managerLevel2: e.target.value }))}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.enableSupportLevels}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, enableSupportLevels: e.target.checked }))}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Enable Support Levels / Queues
            </Typography>
          }
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Application'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// Sub-panel: App Approvals
const AppApprovalsPanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatAppApRow[] = applications.flatMap((app) =>
    (app.approvals ?? []).map((a) => ({ ...a, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppApRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'> & { applicationId: string }>({
    ...EMPTY_AAP,
    applicationId: defaultApplicationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              approverName: editingRow.approverName,
              approverRole: editingRow.approverRole,
              approvalOrder: editingRow.approvalOrder,
              isRequired: editingRow.isRequired,
            }
          : {
              ...EMPTY_AAP,
              applicationId: defaultApplicationId ?? '',
              approvalOrder: allRows.length + 1,
            },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.approverName.toLowerCase().includes(search.toLowerCase()) ||
          r.approverRole.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.approverName.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId);
    if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        approvals: (tgt.approvals ?? []).map((a) =>
          a.id === editingRow.id ? { id: a.id, ...fields } : a,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApproval = { id: `aap_${Date.now()}`, ...fields };
      onSave({ ...tgt, approvals: [...(tgt.approvals ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app)
      onSave({ ...app, approvals: (app.approvals ?? []).filter((a) => a.id !== selectedRow.id) });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleRequired = (row: FlatAppApRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app)
      onSave({
        ...app,
        approvals: (app.approvals ?? []).map((a) =>
          a.id === row.id ? { ...a, isRequired: val } : a,
        ),
      });
  };

  const columns: Column<FlatAppApRow>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'approvalOrder',
      label: 'Order',
      minWidth: 70,
      format: (v) => (
        <Chip
          label={`#${v}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.08),
            color: ACCENT_w,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'approverName',
      label: 'Approver Name',
      minWidth: 160,
      format: (v) => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'approverRole',
      label: 'Approver Role',
      minWidth: 150,
      format: (v) => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isRequired',
      label: 'Required',
      minWidth: 90,
      format: (_v, row) => (
        <Switch
          size='small'
          color='success'
          checked={row.isRequired}
          onChange={(e) => {
            e.stopPropagation();
            toggleRequired(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <ChecklistIcon sx={{ color: ACCENT_w, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
          Application Approvals
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} approver{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(null);
                setDialogOpen(true);
              }}
            >
              New
            </Button>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={classes.tableSearchField}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ChecklistIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Approver'
        subtitle='Add or edit an approver for an application'
        submitDisabled={!form.approverName.trim() || (!editingRow && !form.applicationId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Application:
            </Typography>
            <Chip
              label={editingRow.applicationName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_w,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Approver Name'
          size='small'
          fullWidth
          required
          value={form.approverName}
          onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))}
        />
        <TextField
          label='Approver Role'
          size='small'
          fullWidth
          value={form.approverRole}
          onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))}
        />
        <TextField
          label='Approval Order'
          type='number'
          size='small'
          fullWidth
          value={form.approvalOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, approvalOrder: Math.max(1, Number(e.target.value)) }))
          }
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.isRequired}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Required</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Approver'
        itemName={selectedRow?.approverName}
      />
    </Box>
  );
};

// Sub-panel: App Ticket Types
const AppTicketTypePanel = ({
  applications,
  defaultApplicationId,
  allTicketTypeKeys,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigApplication) => void;
}) => {
  const appId = defaultApplicationId || applications[0]?.id || '';
  const [rows, setRows] = useState<IConfigServiceLineTicketType[]>([]);
  const activeApp = applications.find((a) => a.id === appId) ?? null;

  const buildRows = (app: IConfigApplication) =>
    allTicketTypeKeys.map(
      (key, idx) =>
        app.ticketTypeActivations?.find((r) => r.ticketTypeName === key) ?? {
          ticketTypeId: idx + 1,
          ticketTypeName: key,
          enabled: true,
        },
    );

  useEffect(() => {
    setRows(activeApp ? buildRows(activeApp) : []);
  }, [appId, allTicketTypeKeys.join(',')]);

  const saveRows = (next: IConfigServiceLineTicketType[]) => {
    if (!activeApp) return;
    setRows(next);
    onSave({ ...activeApp, ticketTypeActivations: next });
  };
  const toggleEnabled = (name: string, val: boolean) =>
    saveRows(rows.map((r) => (r.ticketTypeName === name ? { ...r, enabled: val } : r)));
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        accent={ACCENT_w}
        icon={<ToggleOnIcon sx={{ fontSize: '1rem' }} />}
        title='Enable / Disable Application Specific Ticket Types'
      />
      {!activeApp ? (
        <NoPick text='No application available.' />
      ) : (
        <Paper
          elevation={1}
          sx={{
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#2d5ebb', 0.25),
            borderTop: 'none',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 0.75,
              bgcolor: alpha('#2d5ebb', 0.05),
              borderBottom: '1px solid',
              borderColor: alpha('#2d5ebb', 0.12),
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {enabledCount} of {rows.length} ticket types enabled
            </Typography>
          </Box>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#2d5ebb', 0.04) }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1,
                  }}
                >
                  Ticket Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1,
                    width: 110,
                    textAlign: 'center',
                  }}
                >
                  Enabled
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    sx={{ textAlign: 'center', py: 4, color: 'text.disabled', fontSize: '0.82rem' }}
                  >
                    No ticket types configured
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.ticketTypeName}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: row.enabled ? '#2d5ebb' : 'grey.400',
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant='body2' fontWeight={500} fontSize='0.84rem'>
                          {row.ticketTypeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, textAlign: 'center' }}>
                      <Switch
                        size='small'
                        checked={row.enabled}
                        onChange={(e) => toggleEnabled(row.ticketTypeName, e.target.checked)}
                        sx={{
                          '& .MuiSwitch-thumb': { bgcolor: row.enabled ? '#2d5ebb' : undefined },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

// Sub-panel: App Support Lines
const AppSupportLinesPanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatAppSlRow[] = applications.flatMap((app) =>
    (app.supportLines ?? []).map((s) => ({
      ...s,
      applicationId: app.id,
      applicationName: app.name,
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppSlRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigSupportLine, 'id'> & { applicationId: string }>({
    ...EMPTY_ASL,
    applicationId: defaultApplicationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              name: editingRow.name,
              description: editingRow.description,
              isActive: editingRow.isActive,
            }
          : { ...EMPTY_ASL, applicationId: defaultApplicationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId);
    if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        supportLines: (tgt.supportLines ?? []).map((s) =>
          s.id === editingRow.id ? { id: s.id, ...fields } : s,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigSupportLine = { id: `asl_${Date.now()}`, ...fields };
      onSave({ ...tgt, supportLines: [...(tgt.supportLines ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app)
      onSave({
        ...app,
        supportLines: (app.supportLines ?? []).filter((s) => s.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActive = (row: FlatAppSlRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app)
      onSave({
        ...app,
        supportLines: (app.supportLines ?? []).map((s) =>
          s.id === row.id ? { ...s, isActive: val } : s,
        ),
      });
  };

  const columns: Column<FlatAppSlRow>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'name',
      label: 'Support Line / Queue',
      minWidth: 160,
      format: (v) => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v) => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Active',
      minWidth: 80,
      format: (_v, row) => (
        <Switch
          size='small'
          color='success'
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            toggleActive(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <HeadsetMicIcon sx={{ color: ACCENT_w, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
          Application Specific Support Lines / Queues
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} support line{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(null);
                setDialogOpen(true);
              }}
            >
              New
            </Button>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={classes.tableSearchField}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<HeadsetMicIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Support Line / Queue'
        subtitle='Add or edit an application-specific support line or queue'
        submitDisabled={!form.name.trim() || (!editingRow && !form.applicationId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Application:
            </Typography>
            <Chip
              label={editingRow.applicationName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_w,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Support Line / Queue Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.isActive}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Active</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Support Line'
        itemName={selectedRow?.name}
      />
    </Box>
  );
};

// Sub-panel: App Billing Codes
const AppBillingCodesPanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatAppBcRow[] = applications.flatMap((app) =>
    (app.billingCodes ?? []).map((b) => ({
      ...b,
      applicationId: app.id,
      applicationName: app.name,
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppBcRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigBillingCode, 'id'> & { applicationId: string }>({
    ...EMPTY_ABC,
    applicationId: defaultApplicationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              code: editingRow.code,
              description: editingRow.description,
              isActive: editingRow.isActive,
            }
          : { ...EMPTY_ABC, applicationId: defaultApplicationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.code.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.code.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId);
    if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        billingCodes: (tgt.billingCodes ?? []).map((b) =>
          b.id === editingRow.id ? { id: b.id, ...fields } : b,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigBillingCode = { id: `abc_${Date.now()}`, ...fields };
      onSave({ ...tgt, billingCodes: [...(tgt.billingCodes ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app)
      onSave({
        ...app,
        billingCodes: (app.billingCodes ?? []).filter((b) => b.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActive = (row: FlatAppBcRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app)
      onSave({
        ...app,
        billingCodes: (app.billingCodes ?? []).map((b) =>
          b.id === row.id ? { ...b, isActive: val } : b,
        ),
      });
  };

  const columns: Column<FlatAppBcRow>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'code',
      label: 'Billing Code',
      minWidth: 130,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            bgcolor: alpha('#2d5ebb', 0.08),
            color: ACCENT_w,
            fontSize: '0.78rem',
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v) => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Active',
      minWidth: 80,
      format: (_v, row) => (
        <Switch
          size='small'
          color='success'
          checked={row.isActive}
          onChange={(e) => {
            e.stopPropagation();
            toggleActive(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <CodeIcon sx={{ color: ACCENT_w, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
          Application Specific Time Entry Billing Codes
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} code{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(null);
                setDialogOpen(true);
              }}
            >
              New
            </Button>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={classes.tableSearchField}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CodeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Billing Code'
        subtitle='Add or edit an application-specific time entry billing code'
        submitDisabled={!form.code.trim() || (!editingRow && !form.applicationId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Application:
            </Typography>
            <Chip
              label={editingRow.applicationName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_w,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Billing Code'
          size='small'
          fullWidth
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.isActive}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Active</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Billing Code'
        itemName={selectedRow?.code}
      />
    </Box>
  );
};

// Sub-panel: App Timesheet Projects
const AppTimesheetPanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatAppTsRow[] = applications.flatMap((app) =>
    (app.timesheetProjects ?? []).map((p) => ({
      ...p,
      applicationId: app.id,
      applicationName: app.name,
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppTsRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    ...EMPTY_ATS_FORM,
    applicationId: defaultApplicationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              project: editingRow.project,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
            }
          : { ...EMPTY_ATS_FORM, applicationId: defaultApplicationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId);
    if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        timesheetProjects: (tgt.timesheetProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, application: '', ...fields } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProject = { id: `ats_${Date.now()}`, application: '', ...fields };
      onSave({ ...tgt, timesheetProjects: [...(tgt.timesheetProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app)
      onSave({
        ...app,
        timesheetProjects: (app.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatAppTsRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app)
      onSave({
        ...app,
        timesheetProjects: (app.timesheetProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const columns: Column<FlatAppTsRow>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'project',
      label: 'Project',
      minWidth: 150,
      format: (v) => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v) => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v) => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row) => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxHoursPerDayPerResource',
      label: 'Max Hrs / Day / Resource',
      minWidth: 170,
      format: (v) => (
        <Chip
          label={`${v} hrs`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <AccessTimeIcon sx={{ color: ACCENT_w, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
          Add Timesheet Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(null);
                setDialogOpen(true);
              }}
            >
              New
            </Button>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={classes.tableSearchField}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Timesheet Project'
        subtitle='Add or edit an application-specific timesheet project'
        submitDisabled={!form.project.trim() || (!editingRow && !form.applicationId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Application:
            </Typography>
            <Chip
              label={editingRow.applicationName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_w,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='From Date'
            type='date'
            size='small'
            fullWidth
            value={form.fromDate}
            onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='To Date'
            type='date'
            size='small'
            fullWidth
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Max Hours Allowed Per Day Per Resource'
          type='number'
          size='small'
          fullWidth
          value={form.maxHoursPerDayPerResource}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)),
            }))
          }
          slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.activate}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Timesheet Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

// Sub-panel: App Sticky Note
const AppStickyNotePanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const activeApp = applications.find((a) => a.id === defaultApplicationId) ?? null;
  const [note, setNote] = useState(activeApp?.stickyNote ?? '');

  const handleSave = () => {
    if (activeApp) onSave({ ...activeApp, stickyNote: note });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        accent={ACCENT_w}
        icon={<NoteAltIcon sx={{ fontSize: '1rem' }} />}
        title='Add Sticky Note'
      />
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {activeApp && (
          <Typography variant='caption' color='text.secondary'>
            Sticky note for <strong>{activeApp.name}</strong>
          </Typography>
        )}
        <TextField
          multiline
          minRows={6}
          maxRows={16}
          fullWidth
          placeholder='Enter a sticky note…'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: alpha('#2d5ebb', 0.03),
              fontSize: '0.88rem',
              lineHeight: 1.6,
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size='small'
            onClick={() => setNote(activeApp?.stickyNote ?? '')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reset
          </Button>
          <Button
            size='small'
            variant='contained'
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: '#2d5ebb',
              '&:hover': { bgcolor: '#2d5ebb' },
            }}
          >
            Save Note
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

// Sub-panel: App Expense Projects
const AppExpensePanel = ({
  applications,
  defaultApplicationId,
  onSave,
}: {
  applications: IConfigApplication[];
  defaultApplicationId: string | null;
  onSave: (updated: IConfigApplication) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatAppExRow[] = applications.flatMap((app) =>
    (app.expenseProjects ?? []).map((p) => ({
      ...p,
      applicationId: app.id,
      applicationName: app.name,
    })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppExRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    ...EMPTY_AEX_FORM,
    applicationId: defaultApplicationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              applicationId: editingRow.applicationId,
              project: editingRow.project,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxAmountPerDay: editingRow.maxAmountPerDay,
            }
          : { ...EMPTY_AEX_FORM, applicationId: defaultApplicationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.applicationName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId);
    if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) {
      onSave({
        ...tgt,
        expenseProjects: (tgt.expenseProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, application: '', ...fields } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseProject = { id: `aex_${Date.now()}`, application: '', ...fields };
      onSave({ ...tgt, expenseProjects: [...(tgt.expenseProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app)
      onSave({
        ...app,
        expenseProjects: (app.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatAppExRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app)
      onSave({
        ...app,
        expenseProjects: (app.expenseProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const columns: Column<FlatAppExRow>[] = [
    {
      id: 'applicationName',
      label: 'Application',
      minWidth: 140,
      format: (v) => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'project',
      label: 'Expenses Project',
      minWidth: 150,
      format: (v) => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v) => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v) => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row) => (
        <Switch
          size='small'
          color='success'
          checked={row.activate}
          onChange={(e) => {
            e.stopPropagation();
            toggleActivate(row, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxAmountPerDay',
      label: 'Max Amount / Day / Resource',
      minWidth: 190,
      format: (v) => (
        <Chip
          label={`$${Number(v).toFixed(2)}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_w,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: alpha('#2d5ebb', 0.08),
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderRadius: '10px 10px 0 0',
          borderBottom: 'none',
        }}
      >
        <ReceiptLongIcon sx={{ color: ACCENT_w, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_w }}>
          Add Expenses Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Paper
        variant='outlined'
        sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1 }}
      >
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? (
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(null);
                setDialogOpen(true);
              }}
            >
              New
            </Button>
          ) : (
            <Button
              size='small'
              variant='contained'
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
              onClick={() => {
                setEditingRow(selectedRow);
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
          {selectedRow && (
            <>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: alpha('#2d5ebb', 0.3),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Button
                size='small'
                variant='outlined'
                startIcon={<ClearIcon />}
                onClick={() => setSelectedId(null)}
              >
                Clear
              </Button>
            </>
          )}
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={classes.tableSearchField}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#2d5ebb', 0.25),
          borderTop: 'none',
        }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<ReceiptLongIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_w}
        title='Expense Project'
        subtitle='Add or edit an application-specific expense project'
        submitDisabled={!form.project.trim() || (!editingRow && !form.applicationId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Application:
            </Typography>
            <Chip
              label={editingRow.applicationName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_w,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Application</InputLabel>
            <Select
              label='Application'
              value={form.applicationId}
              onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}
            >
              {applications.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No applications</em>
                </MenuItem>
              ) : (
                applications.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Expenses Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='From Date'
            type='date'
            size='small'
            fullWidth
            value={form.fromDate}
            onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='To Date'
            type='date'
            size='small'
            fullWidth
            value={form.toDate}
            onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Max Amount Allowed Per Day Per Resource ($)'
          type='number'
          size='small'
          fullWidth
          value={form.maxAmountPerDay}
          onChange={(e) =>
            setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))
          }
          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        />
        <MuiFormControlLabel
          control={
            <Switch
              checked={form.activate}
              color='success'
              onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
            />
          }
          label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
        />
      </ConfigFormDialog>
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Expense Project'
        itemName={selectedRow?.project}
      />
    </Box>
  );
};

export { ApplicationsSection };
