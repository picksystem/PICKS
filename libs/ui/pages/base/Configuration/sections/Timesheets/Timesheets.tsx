import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  TextField,
  Chip,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AppsIcon from '@mui/icons-material/Apps';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import {
  IConfigTimesheetProjectEntry,
  IConfigTimesheetProjectCategory,
} from '@serviceops/interfaces';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';
import {
  AssocPanel,
  toAssocRows,
  fromAssocRows,
  PanelHeader,
  PanelToolbar,
  PanelTable,
} from '../../shared/assocPanel';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT_MAIN = '#0369a1';
const ACCENT_SL = '#059669';
const ACCENT_APP = '#2563eb';
const ACCENT_QUE = '#7c3aed';
const ACCENT_RES = '#be185d';
const ACCENT_CAT = '#d97706';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveView = 'project' | 'serviceLine' | 'application' | 'queue' | 'resource';

const EMPTY_PROJ_FORM = { name: '', description: '', projectType: '', transitionType: '' };

// ── Timesheet Project Panel ────────────────────────────────────────────────────

const TimesheetProjectPanel = () => {
  const { timesheets: apiTS, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTimesheetProjectEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigTimesheetProjectEntry | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_PROJ_FORM);

  useEffect(() => {
    if (apiTS?.timesheetProjects) setRows(apiTS.timesheetProjects);
  }, [apiTS]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            name: editingRow.name,
            description: editingRow.description,
            projectType: editingRow.projectType,
            transitionType: editingRow.transitionType,
          }
        : EMPTY_PROJ_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.projectType.toLowerCase().includes(search.toLowerCase()) ||
          r.transitionType.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigTimesheetProjectEntry[]) => {
    setRows(next);
    saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: next,
      serviceLineEntries: apiTS?.serviceLineEntries ?? [],
      applicationEntries: apiTS?.applicationEntries ?? [],
      queueEntries: apiTS?.queueEntries ?? [],
      resourceEntries: apiTS?.resourceEntries ?? [],
      projectCategories: apiTS?.projectCategories ?? [],
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProjectEntry = {
        id: `tsp_${Date.now()}`,
        ...form,
        serviceLines: [],
        applications: [],
        queues: [],
        resources: [],
      };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigTimesheetProjectEntry>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 280 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'projectType',
      label: 'Project Type',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'transitionType',
      label: 'Transition Type',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_MAIN}
        icon={<AccessTimeIcon fontSize='small' />}
        title='Timesheet Projects'
      />
      <PanelToolbar
        accent={ACCENT_MAIN}
        selectedLabel={selectedRow?.name ?? null}
        onNew={() => {
          setEditingRow(null);
          setDialogOpen(true);
        }}
        onEdit={() => {
          setEditingRow(selectedRow);
          setDialogOpen(true);
        }}
        onDelete={() => setDeleteOpen(true)}
        search={search}
        onSearch={setSearch}
        onClear={() => setSelectedId(null)}
      />
      <PanelTable accent={ACCENT_MAIN}>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
          activeRowKey={selectedId ?? undefined}
        />
      </PanelTable>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_MAIN}
        title='Timesheet Project'
        subtitle='Define a timesheet project with its type and transition details'
        submitDisabled={!form.name.trim()}
        maxWidth='xs'
      >
        <TextField
          label='Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Q2 Infrastructure, Client Portal Upgrade'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of this timesheet project'
        />
        <TextField
          label='Project Type'
          size='small'
          fullWidth
          value={form.projectType}
          onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
          placeholder='e.g. Internal, Billable, Non-Billable'
        />
        <TextField
          label='Transition Type'
          size='small'
          fullWidth
          value={form.transitionType}
          onChange={(e) => setForm((f) => ({ ...f, transitionType: e.target.value }))}
          placeholder='e.g. Standard, Emergency, Planned'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Timesheet Project'
        itemName={selectedRow?.name}
      />
    </Box>
  );
};

// ── Timesheet Projects Section ─────────────────────────────────────────────────

const TimesheetProjectsSection = () => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();
  const [activeView, setActiveView] = useState<ActiveView>('project');

  const tsBase = () => ({
    conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
    cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
    timesheetProjects: apiTS?.timesheetProjects ?? [],
    serviceLineEntries: apiTS?.serviceLineEntries ?? [],
    applicationEntries: apiTS?.applicationEntries ?? [],
    queueEntries: apiTS?.queueEntries ?? [],
    resourceEntries: apiTS?.resourceEntries ?? [],
    projectCategories: apiTS?.projectCategories ?? [],
  });

  return (
    <Accordion defaultExpanded elevation={0} className={classes.sectionAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_MAIN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AccessTimeIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Timesheet Projects</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define and manage timesheet project entries with their types and associations
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' sx={{ p: 1.5, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              size='small'
              variant={activeView === 'project' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('project')}
              startIcon={<AccessTimeIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_MAIN,
                color: activeView === 'project' ? '#fff' : ACCENT_MAIN,
                bgcolor: activeView === 'project' ? ACCENT_MAIN : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'project' ? alpha(ACCENT_MAIN, 0.85) : alpha(ACCENT_MAIN, 0.08),
                  borderColor: ACCENT_MAIN,
                },
              }}
            >
              Timesheet Project
            </Button>
            <Button
              size='small'
              variant={activeView === 'serviceLine' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('serviceLine')}
              startIcon={<AccountTreeIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_SL,
                color: activeView === 'serviceLine' ? '#fff' : ACCENT_SL,
                bgcolor: activeView === 'serviceLine' ? ACCENT_SL : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'serviceLine' ? alpha(ACCENT_SL, 0.85) : alpha(ACCENT_SL, 0.08),
                  borderColor: ACCENT_SL,
                },
              }}
            >
              Add to Service Line
            </Button>
            <Button
              size='small'
              variant={activeView === 'application' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('application')}
              startIcon={<AppsIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_APP,
                color: activeView === 'application' ? '#fff' : ACCENT_APP,
                bgcolor: activeView === 'application' ? ACCENT_APP : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'application'
                      ? alpha(ACCENT_APP, 0.85)
                      : alpha(ACCENT_APP, 0.08),
                  borderColor: ACCENT_APP,
                },
              }}
            >
              Add to Application
            </Button>
            <Button
              size='small'
              variant={activeView === 'queue' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('queue')}
              startIcon={<QueueIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_QUE,
                color: activeView === 'queue' ? '#fff' : ACCENT_QUE,
                bgcolor: activeView === 'queue' ? ACCENT_QUE : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'queue' ? alpha(ACCENT_QUE, 0.85) : alpha(ACCENT_QUE, 0.08),
                  borderColor: ACCENT_QUE,
                },
              }}
            >
              Add to Queue
            </Button>
            <Button
              size='small'
              variant={activeView === 'resource' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('resource')}
              startIcon={<PersonIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_RES,
                color: activeView === 'resource' ? '#fff' : ACCENT_RES,
                bgcolor: activeView === 'resource' ? ACCENT_RES : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'resource' ? alpha(ACCENT_RES, 0.85) : alpha(ACCENT_RES, 0.08),
                  borderColor: ACCENT_RES,
                },
              }}
            >
              Add to Resource
            </Button>
          </Box>
        </Paper>

        {activeView === 'project' && <TimesheetProjectPanel />}
        {activeView === 'serviceLine' && (
          <AssocPanel
            Icon={AccountTreeIcon}
            accent={ACCENT_SL}
            title='Service Line Associations'
            entityName='Service Line Entry'
            assocLabel='Service Line'
            idPrefix='tssl'
            rows={toAssocRows(apiTS?.serviceLineEntries ?? [], 'serviceLine')}
            onSave={(next) =>
              saveSection('timesheets', {
                ...tsBase(),
                serviceLineEntries: fromAssocRows(next, 'serviceLine'),
              })
            }
          />
        )}
        {activeView === 'application' && (
          <AssocPanel
            Icon={AppsIcon}
            accent={ACCENT_APP}
            title='Application Associations'
            entityName='Application Entry'
            assocLabel='Application'
            idPrefix='tsapp'
            rows={toAssocRows(apiTS?.applicationEntries ?? [], 'application')}
            onSave={(next) =>
              saveSection('timesheets', {
                ...tsBase(),
                applicationEntries: fromAssocRows(next, 'application'),
              })
            }
          />
        )}
        {activeView === 'queue' && (
          <AssocPanel
            Icon={QueueIcon}
            accent={ACCENT_QUE}
            title='Queue Associations'
            entityName='Queue Entry'
            assocLabel='Queue'
            idPrefix='tsq'
            rows={toAssocRows(apiTS?.queueEntries ?? [], 'queue')}
            onSave={(next) =>
              saveSection('timesheets', {
                ...tsBase(),
                queueEntries: fromAssocRows(next, 'queue'),
              })
            }
          />
        )}
        {activeView === 'resource' && (
          <AssocPanel
            Icon={PersonIcon}
            accent={ACCENT_RES}
            title='Resource Associations'
            entityName='Resource Entry'
            assocLabel='Resource'
            idPrefix='tsres'
            rows={toAssocRows(apiTS?.resourceEntries ?? [], 'resource')}
            onSave={(next) =>
              saveSection('timesheets', {
                ...tsBase(),
                resourceEntries: fromAssocRows(next, 'resource'),
              })
            }
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// ── Project Category ───────────────────────────────────────────────────────────

const EMPTY_CAT_FORM = {
  project: '',
  name: '',
  description: '',
  transitionType: '',
  billability: '',
};

const ProjectCategory = () => {
  const { classes } = useStyles();
  const { timesheets: apiTS, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigTimesheetProjectCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigTimesheetProjectCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_FORM);

  useEffect(() => {
    if (apiTS?.projectCategories) setRows(apiTS.projectCategories);
  }, [apiTS]);

  useEffect(() => {
    if (!dialogOpen) return;
    setForm(
      editingRow
        ? {
            project: editingRow.project,
            name: editingRow.name,
            description: editingRow.description,
            transitionType: editingRow.transitionType,
            billability: editingRow.billability,
          }
        : EMPTY_CAT_FORM,
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.transitionType.toLowerCase().includes(search.toLowerCase()) ||
          r.billability.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigTimesheetProjectCategory[]) => {
    setRows(next);
    saveSection('timesheets', {
      conversionReasonCodes: apiTS?.conversionReasonCodes ?? [],
      cancellationReasonCodes: apiTS?.cancellationReasonCodes ?? [],
      timesheetProjects: apiTS?.timesheetProjects ?? [],
      serviceLineEntries: apiTS?.serviceLineEntries ?? [],
      applicationEntries: apiTS?.applicationEntries ?? [],
      queueEntries: apiTS?.queueEntries ?? [],
      resourceEntries: apiTS?.resourceEntries ?? [],
      projectCategories: next,
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProjectCategory = { id: `tscat_${Date.now()}`, ...form };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    save(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigTimesheetProjectCategory>[] = [
    {
      id: 'project',
      label: 'Project',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Name',
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
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 260 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'transitionType',
      label: 'Transition Type',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'billability',
      label: 'Billability',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: alpha(ACCENT_CAT, 0.12),
            color: ACCENT_CAT,
          }}
        />
      ),
    },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_CAT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CategoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Project Category</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define project categories with their transition type and billability
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow ? (
              <Tooltip title='Add a new project category'>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingRow(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CAT,
                    '&:hover': { bgcolor: alpha(ACCENT_CAT, 0.85) },
                  }}
                >
                  New
                </Button>
              </Tooltip>
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
                  sx={{
                    textTransform: 'none',
                    bgcolor: ACCENT_CAT,
                    '&:hover': { bgcolor: alpha(ACCENT_CAT, 0.85) },
                  }}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Delete
                </Button>
                <Box
                  component='span'
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: '1px',
                    height: '20px',
                    bgcolor: alpha(ACCENT_CAT, 0.3),
                    mx: 0.75,
                    alignSelf: 'center',
                  }}
                />
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedId(null)}
                  sx={{ textTransform: 'none' }}
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
                      <SearchIcon fontSize='small' />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>

        <Paper elevation={1} className={classes.tablePaper}>
          <DataTable
            columns={columns}
            data={filtered}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
            activeRowKey={selectedId ?? undefined}
          />
        </Paper>
      </AccordionDetails>

      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CategoryIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CAT}
        title='Project Category'
        subtitle='Define a project category with transition type and billability'
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Project'
          size='small'
          fullWidth
          required
          value={form.project}
          onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
          placeholder='e.g. Q2 Infrastructure'
        />
        <TextField
          label='Name'
          size='small'
          fullWidth
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. Development, Maintenance'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Brief description of this project category'
        />
        <TextField
          label='Transition Type'
          size='small'
          fullWidth
          value={form.transitionType}
          onChange={(e) => setForm((f) => ({ ...f, transitionType: e.target.value }))}
          placeholder='e.g. Standard, Emergency, Planned'
        />
        <TextField
          label='Billability'
          size='small'
          fullWidth
          value={form.billability}
          onChange={(e) => setForm((f) => ({ ...f, billability: e.target.value }))}
          placeholder='e.g. Billable, Non-Billable, Internal'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Project Category'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const Timesheets = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container}>
      <TimesheetProjectsSection />
      <ProjectCategory />
    </Box>
  );
};

export default Timesheets;
