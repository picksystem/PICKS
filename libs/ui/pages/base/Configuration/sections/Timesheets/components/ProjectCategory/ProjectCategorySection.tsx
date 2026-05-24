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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { IConfigTimesheetProjectCategory } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  ConfigDeleteDialog,
  ConfigFormDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT_w = '#0369a1';

// ── Types ─────────────────────────────────────────────────────────────────────

const EMPTY_CAT_FORM = {
  project: '',
  name: '',
  description: '',
  transitionType: '',
  billability: '',
};

// ── Project Category ───────────────────────────────────────────────────────────

const ProjectCategorySection = () => {
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
            bgcolor: alpha('#2d5ebb', 0.12),
            color: ACCENT_w,
          }}
        />
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
            <WorkspacesIcon sx={{ color: '#fff', fontSize: '1rem' }} />
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
              <>
                <Tooltip title='Add a new Project Category'>
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
                      bgcolor: '#2d5ebb',
                      '&:hover': { bgcolor: alpha('#2d5ebb', 0.85) },
                    }}
                  >
                    New
                  </Button>
                </Tooltip>
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
              </>
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
                    bgcolor: '#2d5ebb',
                    '&:hover': { bgcolor: alpha('#2d5ebb', 0.85) },
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
                    bgcolor: 'divider',
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
        accent='#2d5ebb'
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

export { ProjectCategorySection };
