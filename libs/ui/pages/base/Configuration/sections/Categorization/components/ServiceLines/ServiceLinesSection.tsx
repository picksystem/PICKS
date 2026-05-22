import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
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
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ClearIcon from '@mui/icons-material/Clear';
import {
  IConfigServiceLine,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigApproval,
  IConfigServiceLineTicketType,
  IConfigBusinessCategory,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { PanelToolbar, PanelTable } from '../shared';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const ACCENT_SL = '#2d5ebb';
const ACCENT_TS = '#2d5ebb';
const ACCENT_EX = '#2d5ebb';
const ACCENT_AP = '#2d5ebb';
const ACCENT_TT = '#2d5ebb';

// Types for flat rows
type FlatTsRow = IConfigTimesheetProject & { serviceLineId: string; serviceLineName: string };
type FlatExRow = IConfigExpenseProject & { serviceLineId: string; serviceLineName: string };

const EMPTY_SL_FORM = {
  businessCategoryId: '',
  businessCategoryName: '',
  name: '',
  description: '',
  manager: '',
};

const EMPTY_TS_FORM = {
  serviceLineId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxHoursPerDayPerResource: 8,
};

const EMPTY_EX_FORM = {
  serviceLineId: '',
  project: '',
  application: '',
  fromDate: '',
  toDate: '',
  activate: true,
  maxAmountPerDay: 0,
};

const EMPTY_AP: Omit<IConfigApproval, 'id'> = {
  approverName: '',
  approverRole: '',
  approvalOrder: 1,
  isRequired: true,
};

type ActivePanel = 'none' | 'timesheet' | 'expenses' | 'approvals' | 'ticketTypes';

interface ServiceLinesSectionProps {
  data?: IConfigServiceLine[];
  businessCategories?: IConfigBusinessCategory[];
  onDataChange?: (data: IConfigServiceLine[]) => void;
}

const ServiceLinesSection = ({
  data,
  businessCategories,
  onDataChange,
}: ServiceLinesSectionProps) => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection, ticketTypeKeys } = useConfiguration();

  const [rows, setRows] = useState<IConfigServiceLine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigServiceLine | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_SL_FORM);
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const cats = businessCategories ?? apiCat?.businessCategories ?? [];

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCat?.serviceLines) {
      setRows(apiCat.serviceLines);
    }
  }, [data, apiCat]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              businessCategoryId: editingRow.businessCategoryId,
              businessCategoryName: editingRow.businessCategoryName,
              name: editingRow.name,
              description: editingRow.description,
              manager: editingRow.manager,
            }
          : EMPTY_SL_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.businessCategoryName.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.manager.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const saveRows = (next: IConfigServiceLine[]) => {
    setRows(next);
    if (onDataChange) {
      onDataChange(next);
    } else {
      saveSection('categorization', {
        businessCategories: apiCat?.businessCategories ?? [],
        serviceLines: next,
        applications: apiCat?.applications ?? [],
        queues: apiCat?.queues ?? [],
        applicationCategories: apiCat?.applicationCategories ?? [],
        applicationSubCategories: apiCat?.applicationSubCategories ?? [],
        applicationNumberSequences: apiCat?.applicationNumberSequences ?? [],
      });
    }
  };

  const handleCategoryChange = (id: string) => {
    const cat = cats.find((c) => c.id === id);
    setForm((f) => ({ ...f, businessCategoryId: id, businessCategoryName: cat?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigServiceLine = {
        id: `sl_${Date.now()}`,
        ...form,
        timesheetProjects: [],
        expenseProjects: [],
        approvals: [],
        ticketTypeActivations: [],
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

  const handleSubPanelSave = (updated: IConfigServiceLine) =>
    saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));

  const togglePanel = (panel: ActivePanel) =>
    setActivePanel((prev) => (prev === panel ? 'none' : panel));

  const panelActive = activePanel !== 'none';

  const slColumns: Column<IConfigServiceLine>[] = [
    {
      id: 'businessCategoryName',
      label: 'Business Category',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Service Line Name',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'manager',
      label: 'Service Line Manager',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
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
              bgcolor: '#2d5ebb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LinearScaleIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Service Lines</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define service lines and associate them with business categories
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            <Button
              size='small'
              startIcon={<LinearScaleIcon />}
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
              Service Lines
            </Button>

            <Button
              size='small'
              startIcon={<ChecklistIcon />}
              variant={activePanel === 'approvals' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('approvals')}
            >
              Add Approvals
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
              startIcon={<AccessTimeIcon />}
              variant={activePanel === 'timesheet' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('timesheet')}
            >
              Add Timesheet Projects
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

        {/* Service Lines table */}
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
              <LinearScaleIcon sx={{ color: '#2d5ebb', fontSize: '1.1rem' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_SL }}>
                Service Lines
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                {rows.length} service line{rows.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Paper
              variant='outlined'
              sx={{
                borderRadius: 0,
                borderTop: 'none',
                borderBottom: 'none',
                px: 1.5,
                py: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
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
                columns={slColumns}
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

        {/* Sub-panels */}
        {activePanel === 'timesheet' && (
          <ServiceLineTimesheetPanel
            serviceLines={rows}
            defaultServiceLineId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'expenses' && (
          <ServiceLineExpensePanel
            serviceLines={rows}
            defaultServiceLineId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'approvals' && (
          <ServiceLineApprovalsPanel
            serviceLines={rows}
            initialServiceLineId={selectedId}
            onSave={handleSubPanelSave}
          />
        )}
        {activePanel === 'ticketTypes' && (
          <ServiceLineTicketTypePanel
            serviceLines={rows}
            initialServiceLineId={selectedId}
            allTicketTypeKeys={ticketTypeKeys}
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
        icon={<LinearScaleIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_SL}
        title='Service Line'
        subtitle='Define service lines and associate them with business categories'
        submitDisabled={!form.name.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
        <FormControl size='small' fullWidth required>
          <InputLabel>Business Category</InputLabel>
          <Select
            label='Business Category'
            value={form.businessCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {cats.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label='Service Line Name'
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
          label='Service Line Manager'
          size='small'
          fullWidth
          value={form.manager}
          onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Service Line'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// Sub-panel: Timesheet Projects
const ServiceLineTimesheetPanel = ({
  serviceLines,
  defaultServiceLineId,
  onSave,
}: {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatTsRow[] = serviceLines.flatMap((sl) =>
    (sl.timesheetProjects ?? []).map((p) => ({
      ...p,
      serviceLineId: sl.id,
      serviceLineName: sl.name,
    })),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatTsRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY_TS_FORM, serviceLineId: defaultServiceLineId ?? '' });

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              serviceLineId: editingRow.serviceLineId,
              project: editingRow.project,
              application: editingRow.application,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource,
            }
          : { ...EMPTY_TS_FORM, serviceLineId: defaultServiceLineId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.serviceLineName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.serviceLineId) return;
    const targetSL = serviceLines.find((s) => s.id === form.serviceLineId);
    if (!targetSL) return;

    const { serviceLineId: _sid, ...projectFields } = form;

    if (editingRow) {
      onSave({
        ...targetSL,
        timesheetProjects: (targetSL.timesheetProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, ...projectFields } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProject = { id: `ts_${Date.now()}`, ...projectFields };
      onSave({ ...targetSL, timesheetProjects: [...(targetSL.timesheetProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const sl = serviceLines.find((s) => s.id === selectedRow.serviceLineId);
    if (sl)
      onSave({
        ...sl,
        timesheetProjects: (sl.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatTsRow, val: boolean) => {
    const sl = serviceLines.find((s) => s.id === row.serviceLineId);
    if (sl)
      onSave({
        ...sl,
        timesheetProjects: (sl.timesheetProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const columns: Column<FlatTsRow>[] = [
    {
      id: 'project',
      label: 'Projects',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
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
      label: 'Max Hrs Allowed / Day / Resource',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Chip
          label={`${v} hrs`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_TS,
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
        <AccessTimeIcon sx={{ color: ACCENT_TS, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_TS }}>
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
            <Tooltip title='Add a new timesheet project'>
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
            </Tooltip>
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
            placeholder='Search projects…'
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
        accent={ACCENT_TS}
        title='Timesheet Project'
        subtitle='Add or edit a timesheet project for a service line'
        submitDisabled={!form.project.trim() || (!editingRow && !form.serviceLineId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Service Line:
            </Typography>
            <Chip
              label={editingRow.serviceLineName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_TS,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Service Line</InputLabel>
            <Select
              label='Service Line'
              value={form.serviceLineId}
              onChange={(e) => setForm((f) => ({ ...f, serviceLineId: e.target.value }))}
            >
              {serviceLines.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No service lines — add one first</em>
                </MenuItem>
              ) : (
                serviceLines.map((sl) => (
                  <MenuItem key={sl.id} value={sl.id}>
                    {sl.name}
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
        <TextField
          label='Application'
          size='small'
          fullWidth
          value={form.application}
          onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
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

// Sub-panel: Expense Projects
const ServiceLineExpensePanel = ({
  serviceLines,
  defaultServiceLineId,
  onSave,
}: {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}) => {
  const { classes } = useStyles();
  const allRows: FlatExRow[] = serviceLines.flatMap((sl) =>
    (sl.expenseProjects ?? []).map((p) => ({
      ...p,
      serviceLineId: sl.id,
      serviceLineName: sl.name,
    })),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatExRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY_EX_FORM, serviceLineId: defaultServiceLineId ?? '' });

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              serviceLineId: editingRow.serviceLineId,
              project: editingRow.project,
              application: editingRow.application,
              fromDate: editingRow.fromDate,
              toDate: editingRow.toDate,
              activate: editingRow.activate,
              maxAmountPerDay: editingRow.maxAmountPerDay,
            }
          : { ...EMPTY_EX_FORM, serviceLineId: defaultServiceLineId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter(
        (r) =>
          r.project.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()) ||
          r.serviceLineName.toLowerCase().includes(search.toLowerCase()),
      )
    : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.serviceLineId) return;
    const targetSL = serviceLines.find((s) => s.id === form.serviceLineId);
    if (!targetSL) return;

    const { serviceLineId: _sid, ...projectFields } = form;

    if (editingRow) {
      onSave({
        ...targetSL,
        expenseProjects: (targetSL.expenseProjects ?? []).map((p) =>
          p.id === editingRow.id ? { id: p.id, ...projectFields } : p,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseProject = { id: `ex_${Date.now()}`, ...projectFields };
      onSave({ ...targetSL, expenseProjects: [...(targetSL.expenseProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const sl = serviceLines.find((s) => s.id === selectedRow.serviceLineId);
    if (sl)
      onSave({
        ...sl,
        expenseProjects: (sl.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id),
      });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatExRow, val: boolean) => {
    const sl = serviceLines.find((s) => s.id === row.serviceLineId);
    if (sl)
      onSave({
        ...sl,
        expenseProjects: (sl.expenseProjects ?? []).map((p) =>
          p.id === row.id ? { ...p, activate: val } : p,
        ),
      });
  };

  const columns: Column<FlatExRow>[] = [
    {
      id: 'project',
      label: 'Expenses Project',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'fromDate',
      label: 'From Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'toDate',
      label: 'To Date',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {v ? String(v) : '—'}
        </Typography>
      ),
    },
    {
      id: 'activate',
      label: 'Activate',
      minWidth: 85,
      format: (_v, row): React.ReactNode => (
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
      label: 'Max Amount Allowed / Day / Resource',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Chip
          label={`$${Number(v).toFixed(2)}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_EX,
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
        <ReceiptLongIcon sx={{ color: ACCENT_EX, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_EX }}>
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
            <Tooltip title='Add a new expense project'>
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
            </Tooltip>
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
            placeholder='Search projects…'
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
        accent={ACCENT_EX}
        title='Expense Project'
        subtitle='Add or edit an expense project for a service line'
        submitDisabled={!form.project.trim() || (!editingRow && !form.serviceLineId)}
        submitLabel={editingRow ? 'Save Changes' : 'Add Project'}
        maxWidth='sm'
      >
        {editingRow ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Service Line:
            </Typography>
            <Chip
              label={editingRow.serviceLineName}
              size='small'
              sx={{
                bgcolor: alpha('#2d5ebb', 0.1),
                color: ACCENT_EX,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Service Line</InputLabel>
            <Select
              label='Service Line'
              value={form.serviceLineId}
              onChange={(e) => setForm((f) => ({ ...f, serviceLineId: e.target.value }))}
            >
              {serviceLines.length === 0 ? (
                <MenuItem disabled value=''>
                  <em>No service lines — add one first</em>
                </MenuItem>
              ) : (
                serviceLines.map((sl) => (
                  <MenuItem key={sl.id} value={sl.id}>
                    {sl.name}
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
        <TextField
          label='Application'
          size='small'
          fullWidth
          value={form.application}
          onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))}
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

// Sub-panel: Approvals
const ServiceLineApprovalsPanel = ({
  serviceLines,
  initialServiceLineId,
  onSave,
}: {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  onSave: (updated: IConfigServiceLine) => void;
}) => {
  const [slId, setSlId] = useState(initialServiceLineId ?? '');
  const [rows, setRows] = useState<IConfigApproval[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApproval | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'>>(EMPTY_AP);

  const activeSL = serviceLines.find((s) => s.id === slId) ?? null;

  useEffect(() => {
    setRows(activeSL?.approvals ?? []);
    setSelectedId(null);
  }, [slId]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              approverName: editingRow.approverName,
              approverRole: editingRow.approverRole,
              approvalOrder: editingRow.approvalOrder,
              isRequired: editingRow.isRequired,
            }
          : { ...EMPTY_AP, approvalOrder: rows.length + 1 },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const sorted = [...rows].sort((a, b) => a.approvalOrder - b.approvalOrder);
  const filtered = search
    ? sorted.filter(
        (r) =>
          r.approverName.toLowerCase().includes(search.toLowerCase()) ||
          r.approverRole.toLowerCase().includes(search.toLowerCase()),
      )
    : sorted;

  const saveRows = (next: IConfigApproval[]) => {
    if (!activeSL) return;
    setRows(next);
    onSave({ ...activeSL, approvals: next });
  };

  const handleSubmit = () => {
    if (!form.approverName.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApproval = { id: `ap_${Date.now()}`, ...form };
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

  const toggleRequired = (row: IConfigApproval, val: boolean) =>
    saveRows(rows.map((r) => (r.id === row.id ? { ...r, isRequired: val } : r)));

  const columns: Column<IConfigApproval>[] = [
    {
      id: 'approvalOrder',
      label: 'Order',
      minWidth: 70,
      format: (v): React.ReactNode => (
        <Chip
          label={`#${v}`}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: alpha('#2d5ebb', 0.1),
            color: ACCENT_AP,
            height: 22,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'approverName',
      label: 'Approver Name',
      minWidth: 170,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'approverRole',
      label: 'Approver Role',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'isRequired',
      label: 'Required',
      minWidth: 90,
      format: (_v, row): React.ReactNode => (
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
        <ChecklistIcon sx={{ color: ACCENT_AP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_AP }}>
          Add Approvals
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {rows.length} approver{rows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <PanelToolbar
        accent={ACCENT_AP}
        selectedLabel={selectedRow?.approverName ?? null}
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
      <PanelTable accent={ACCENT_AP}>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
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
        icon={<ChecklistIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_AP}
        title='Approver'
        subtitle='Add or edit an approver in the service line approval chain'
        submitDisabled={!form.approverName.trim()}
        submitLabel={editingRow ? 'Save Changes' : 'Add'}
        maxWidth='sm'
      >
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

// Sub-panel: Ticket Types
const ServiceLineTicketTypePanel = ({
  serviceLines,
  initialServiceLineId,
  allTicketTypeKeys,
  onSave,
}: {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  allTicketTypeKeys: string[];
  onSave: (updated: IConfigServiceLine) => void;
}) => {
  const activeSL = serviceLines.find((s) => s.id === initialServiceLineId) ?? null;
  const [rows, setRows] = useState<IConfigServiceLineTicketType[]>([]);

  const buildRows = (sl: IConfigServiceLine | null): IConfigServiceLineTicketType[] =>
    allTicketTypeKeys.map(
      (key, idx) =>
        sl?.ticketTypeActivations?.find((r) => r.ticketTypeName === key) ?? {
          ticketTypeId: idx + 1,
          ticketTypeName: key,
          enabled: true,
        },
    );

  useEffect(() => {
    setRows(buildRows(activeSL));
  }, [initialServiceLineId, allTicketTypeKeys.join(',')]);

  const saveRows = (next: IConfigServiceLineTicketType[]) => {
    if (!activeSL) {
      setRows(next);
      return;
    }
    setRows(next);
    onSave({ ...activeSL, ticketTypeActivations: next });
  };

  const toggleEnabled = (name: string, val: boolean) => {
    const updated = rows.map((r) => (r.ticketTypeName === name ? { ...r, enabled: val } : r));
    saveRows(updated);
  };
  const enabledCount = rows.filter((r) => r.enabled).length;

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
        <ToggleOnIcon sx={{ color: ACCENT_TT, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_TT }}>
          Enable / Disable Ticket Types
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {enabledCount} of {rows.length} enabled
        </Typography>
      </Box>

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
                <TableRow key={row.ticketTypeName} hover sx={{ '&:last-child td': { border: 0 } }}>
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
    </Box>
  );
};

export { ServiceLinesSection };
