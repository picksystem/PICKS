import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Link,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import NumbersIcon from '@mui/icons-material/Numbers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppsIcon from '@mui/icons-material/Apps';
import CategoryIcon from '@mui/icons-material/Category';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CodeIcon from '@mui/icons-material/Code';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import {
  IConfigBusinessCategory,
  IConfigServiceLine,
  IConfigTimesheetProject,
  IConfigExpenseProject,
  IConfigApproval,
  IConfigServiceLineTicketType,
  IConfigApplication,
  IConfigSupportLine,
  IConfigBillingCode,
  IConfigApplicationQueue,
  IConfigApplicationCategory,
  IConfigApplicationSubCategory,
  IConfigApplicationNumberSequence,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { useGetTicketTypeQuery } from '@serviceops/services';

// ─────────────────────────────────────────────────────────────────────────────
// Business Categories
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_CAT_FORM = { name: '', description: '', head: '' };

const BusinessCategories = () => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigBusinessCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigBusinessCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_CAT_FORM);

  useEffect(() => { if (apiCat?.businessCategories) setRows(apiCat.businessCategories); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow ? { name: editingRow.name, description: editingRow.description, head: editingRow.head } : EMPTY_CAT_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.head.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigBusinessCategory[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: next, serviceLines: apiCat?.serviceLines ?? [], applications: apiCat?.applications ?? [], queues: apiCat?.queues ?? [], applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: apiCat?.applicationSubCategories ?? [], applicationNumberSequences: apiCat?.applicationNumberSequences ?? [] });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigBusinessCategory = { id: `bcat_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<IConfigBusinessCategory>[] = [
    { id: 'name', label: 'Business Category Name', minWidth: 180, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 220, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'head', label: 'Business Category Head', minWidth: 180, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AccountTreeIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Business Categories</Typography>
            <Typography className={classes.sectionSubtitle}>Manage business category groups and their designated heads</Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow
              ? <Tooltip title='Add a new business category'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
              : <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
            }
            {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
            <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
          </Box>
          {selectedRow && <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
        </Paper>
        <Paper elevation={1} className={classes.tablePaper}>
          <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
        </Paper>
      </AccordionDetails>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Business Category' : 'New Business Category'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <TextField label='Business Category Name' size='small' fullWidth required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <TextField label='Business Category Head' size='small' fullWidth value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.name.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Business Category</DialogTitle>
        <DialogContent><Typography variant='body2'>Are you sure you want to delete <strong>{selectedRow?.name}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared panel scaffold helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Coloured top-bar used by every sub-panel */
const PanelHeader = ({
  accent, icon, title, onBack,
}: { accent: string; icon: React.ReactNode; title: string; onBack: () => void }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(accent, 0.08), border: '1px solid', borderColor: alpha(accent, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
    <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack}
      sx={{ textTransform: 'none', color: accent, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(accent, 0.1) } }}
    >
      Back
    </Button>
    <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(accent, 0.3) }} />
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
  </Box>
);

/** Service-line selector row shown below the panel header */
const ServiceLinePicker = ({
  accent, serviceLines, value, onChange,
}: { accent: string; serviceLines: IConfigServiceLine[]; value: string; onChange: (id: string) => void }) => (
  <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(accent, 0.04), border: '1px solid', borderColor: alpha(accent, 0.2), borderTop: 'none', borderBottom: 'none' }}>
    <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
      Service Line:
    </Typography>
    <FormControl size='small' sx={{ minWidth: 240 }}>
      <Select
        displayEmpty value={value} onChange={(e) => onChange(e.target.value)}
        sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }}
        renderValue={(v) => {
          if (!v) return <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>— select a service line —</Typography>;
          return serviceLines.find((s) => s.id === v)?.name ?? v;
        }}
      >
        {serviceLines.length === 0
          ? <MenuItem disabled value=''><em>No service lines available</em></MenuItem>
          : serviceLines.map((sl) => <MenuItem key={sl.id} value={sl.id} sx={{ fontSize: '0.82rem' }}>{sl.name}</MenuItem>)
        }
      </Select>
    </FormControl>
  </Box>
);

/** Toolbar row with New / Edit / Delete / Search */
const PanelToolbar = ({
  accent, selectedLabel, onNew, onEdit, onDelete, search, onSearch, onClear,
}: {
  accent: string; selectedLabel: string | null;
  onNew: () => void; onEdit: () => void; onDelete: () => void;
  search: string; onSearch: (v: string) => void; onClear: () => void;
}) => {
  const { classes } = useStyles();
  return (
    <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box className={classes.toolbarButtons}>
        {!selectedLabel
          ? <Tooltip title='Add new row'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: accent, '&:hover': { bgcolor: alpha(accent, 0.85) } }} onClick={onNew}>New</Button></Tooltip>
          : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: accent, '&:hover': { bgcolor: alpha(accent, 0.85) } }} onClick={onEdit}>Edit</Button>
        }
        {selectedLabel && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={onDelete}>Delete</Button>}
        <TextField size='small' placeholder='Search…' value={search} onChange={(e) => onSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 200 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
      </Box>
      {selectedLabel && (
        <Typography variant='caption' color='text.secondary'>
          Selected: <strong>{selectedLabel}</strong>&nbsp;·&nbsp;
          <Link component='button' variant='caption' onClick={onClear}>Clear</Link>
        </Typography>
      )}
    </Paper>
  );
};

/** Bottom paper that wraps the DataTable with accent border */
const PanelTable = ({ accent, children }: { accent: string; children: React.ReactNode }) => (
  <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(accent, 0.25), borderTop: 'none' }}>
    {children}
  </Paper>
);

/** Shown inside the panel when no service line is selected yet */
const NoPick = ({ text }: { text: string }) => (
  <Box sx={{ py: 6, textAlign: 'center', border: '1px solid', borderTop: 'none', borderColor: 'divider', borderRadius: '0 0 10px 10px', bgcolor: 'grey.50' }}>
    <Typography variant='body2' color='text.disabled' fontSize='0.82rem'>{text}</Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Timesheet Projects panel  — flat view, opens immediately on button click
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_TS = '#0891b2';

/** Flat row = project fields + which service line it belongs to */
type FlatTsRow = IConfigTimesheetProject & { serviceLineId: string; serviceLineName: string };

const EMPTY_TS_FORM = {
  serviceLineId: '',
  project: '', application: '', fromDate: '', toDate: '',
  activate: true, maxHoursPerDayPerResource: 8,
};

interface TimesheetPanelProps {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onBack: () => void;
  onSave: (updated: IConfigServiceLine) => void;
}

const TimesheetPanel = ({ serviceLines, defaultServiceLineId, onBack, onSave }: TimesheetPanelProps) => {
  const { classes } = useStyles();

  // Flatten every service line's timesheet projects into one array
  const allRows: FlatTsRow[] = serviceLines.flatMap((sl) =>
    (sl.timesheetProjects ?? []).map((p) => ({ ...p, serviceLineId: sl.id, serviceLineName: sl.name })),
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
          ? { serviceLineId: editingRow.serviceLineId, project: editingRow.project, application: editingRow.application, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource }
          : { ...EMPTY_TS_FORM, serviceLineId: defaultServiceLineId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter((r) =>
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
      onSave({ ...targetSL, timesheetProjects: (targetSL.timesheetProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, ...projectFields } : p) });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigTimesheetProject = { id: `ts_${Date.now()}`, ...projectFields };
      onSave({ ...targetSL, timesheetProjects: [...(targetSL.timesheetProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const sl = serviceLines.find((s) => s.id === selectedRow.serviceLineId);
    if (sl) onSave({ ...sl, timesheetProjects: (sl.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatTsRow, val: boolean) => {
    const sl = serviceLines.find((s) => s.id === row.serviceLineId);
    if (sl) onSave({ ...sl, timesheetProjects: (sl.timesheetProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const columns: Column<FlatTsRow>[] = [
    {
      id: 'project', label: 'Projects', minWidth: 150,
      format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography>,
    },
    {
      id: 'application', label: 'Application', minWidth: 130,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography>,
    },
    {
      id: 'fromDate', label: 'From Date', minWidth: 105,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography>,
    },
    {
      id: 'toDate', label: 'To Date', minWidth: 105,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography>,
    },
    {
      id: 'activate', label: 'Activate', minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch size='small' color='success' checked={row.activate}
          onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxHoursPerDayPerResource', label: 'Max Hrs Allowed / Day / Resource', minWidth: 180,
      format: (v): React.ReactNode => (
        <Chip label={`${v} hrs`} size='small'
          sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_TS, 0.1), color: ACCENT_TS, height: 22, borderRadius: 1 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_TS, 0.08), border: '1px solid', borderColor: alpha(ACCENT_TS, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack}
          sx={{ textTransform: 'none', color: ACCENT_TS, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_TS, 0.1) } }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_TS, 0.3) }} />
        <AccessTimeIcon sx={{ color: ACCENT_TS, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_TS }}>
          Add Timesheet Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Toolbar ── */}
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow
            ? <Tooltip title='Add a new timesheet project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_TS, '&:hover': { bgcolor: '#0e7490' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_TS, '&:hover': { bgcolor: '#0e7490' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
          }
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField
            size='small' placeholder='Search projects…' value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
            slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }}
          />
        </Box>
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link>
          </Typography>
        )}
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_TS, 0.25), borderTop: 'none' }}>
        <DataTable
          columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>

      {/* ── New / Edit dialog ── */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          {editingRow ? 'Edit Timesheet Project' : 'New Timesheet Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {/* Service Line — dropdown on new, chip on edit */}
            {editingRow ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>Service Line:</Typography>
                <Chip label={editingRow.serviceLineName} size='small' sx={{ bgcolor: alpha(ACCENT_TS, 0.1), color: ACCENT_TS, fontWeight: 600, fontSize: '0.78rem' }} />
              </Box>
            ) : (
              <FormControl size='small' fullWidth required>
                <InputLabel>Service Line</InputLabel>
                <Select label='Service Line' value={form.serviceLineId} onChange={(e) => setForm((f) => ({ ...f, serviceLineId: e.target.value }))}>
                  {serviceLines.length === 0
                    ? <MenuItem disabled value=''><em>No service lines — add one first</em></MenuItem>
                    : serviceLines.map((sl) => <MenuItem key={sl.id} value={sl.id}>{sl.name}</MenuItem>)
                  }
                </Select>
              </FormControl>
            )}
            <TextField label='Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <TextField label='Application' size='small' fullWidth value={form.application} onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField
              label='Max Hours Allowed Per Day Per Resource' type='number' size='small' fullWidth
              value={form.maxHoursPerDayPerResource}
              onChange={(e) => setForm((f) => ({ ...f, maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)) }))}
              slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }}
            />
            <FormControlLabel
              control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />}
              label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.serviceLineId)}
            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_TS, '&:hover': { bgcolor: '#0e7490' } }}
          >
            {editingRow ? 'Save Changes' : 'Add Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Timesheet Project</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Expense Projects panel  — flat view, opens immediately on button click
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_EX = '#7c3aed';

type FlatExRow = IConfigExpenseProject & { serviceLineId: string; serviceLineName: string };

const EMPTY_EX_FORM = {
  serviceLineId: '',
  project: '', application: '', fromDate: '', toDate: '',
  activate: true, maxAmountPerDay: 0,
};

interface ExpensePanelProps {
  serviceLines: IConfigServiceLine[];
  defaultServiceLineId: string | null;
  onBack: () => void;
  onSave: (updated: IConfigServiceLine) => void;
}

const ExpensePanel = ({ serviceLines, defaultServiceLineId, onBack, onSave }: ExpensePanelProps) => {
  const { classes } = useStyles();

  const allRows: FlatExRow[] = serviceLines.flatMap((sl) =>
    (sl.expenseProjects ?? []).map((p) => ({ ...p, serviceLineId: sl.id, serviceLineName: sl.name })),
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
          ? { serviceLineId: editingRow.serviceLineId, project: editingRow.project, application: editingRow.application, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxAmountPerDay: editingRow.maxAmountPerDay }
          : { ...EMPTY_EX_FORM, serviceLineId: defaultServiceLineId ?? '' },
      );
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? allRows.filter((r) =>
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
      onSave({ ...targetSL, expenseProjects: (targetSL.expenseProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, ...projectFields } : p) });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigExpenseProject = { id: `ex_${Date.now()}`, ...projectFields };
      onSave({ ...targetSL, expenseProjects: [...(targetSL.expenseProjects ?? []), n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const sl = serviceLines.find((s) => s.id === selectedRow.serviceLineId);
    if (sl) onSave({ ...sl, expenseProjects: (sl.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };

  const toggleActivate = (row: FlatExRow, val: boolean) => {
    const sl = serviceLines.find((s) => s.id === row.serviceLineId);
    if (sl) onSave({ ...sl, expenseProjects: (sl.expenseProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const columns: Column<FlatExRow>[] = [
    {
      id: 'project', label: 'Expenses Project', minWidth: 150,
      format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography>,
    },
    {
      id: 'application', label: 'Application', minWidth: 130,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography>,
    },
    {
      id: 'fromDate', label: 'From Date', minWidth: 105,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography>,
    },
    {
      id: 'toDate', label: 'To Date', minWidth: 105,
      format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography>,
    },
    {
      id: 'activate', label: 'Activate', minWidth: 85,
      format: (_v, row): React.ReactNode => (
        <Switch size='small' color='success' checked={row.activate}
          onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'maxAmountPerDay', label: 'Max Amount Allowed / Day / Resource', minWidth: 200,
      format: (v): React.ReactNode => (
        <Chip label={`$${Number(v).toFixed(2)}`} size='small'
          sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_EX, 0.1), color: ACCENT_EX, height: 22, borderRadius: 1 }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_EX, 0.08), border: '1px solid', borderColor: alpha(ACCENT_EX, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack}
          sx={{ textTransform: 'none', color: ACCENT_EX, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_EX, 0.1) } }}
        >
          Back
        </Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_EX, 0.3) }} />
        <ReceiptLongIcon sx={{ color: ACCENT_EX, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_EX }}>
          Add Expenses Projects
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
          {allRows.length} project{allRows.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Toolbar ── */}
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow
            ? <Tooltip title='Add a new expense project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_EX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_EX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
          }
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField
            size='small' placeholder='Search projects…' value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
            slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }}
          />
        </Box>
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link>
          </Typography>
        )}
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_EX, 0.25), borderTop: 'none' }}>
        <DataTable
          columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)}
          activeRowKey={selectedId ?? undefined}
        />
      </Paper>

      {/* ── New / Edit dialog ── */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          {editingRow ? 'Edit Expense Project' : 'New Expense Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {editingRow ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='caption' color='text.secondary' fontWeight={600}>Service Line:</Typography>
                <Chip label={editingRow.serviceLineName} size='small' sx={{ bgcolor: alpha(ACCENT_EX, 0.1), color: ACCENT_EX, fontWeight: 600, fontSize: '0.78rem' }} />
              </Box>
            ) : (
              <FormControl size='small' fullWidth required>
                <InputLabel>Service Line</InputLabel>
                <Select label='Service Line' value={form.serviceLineId} onChange={(e) => setForm((f) => ({ ...f, serviceLineId: e.target.value }))}>
                  {serviceLines.length === 0
                    ? <MenuItem disabled value=''><em>No service lines — add one first</em></MenuItem>
                    : serviceLines.map((sl) => <MenuItem key={sl.id} value={sl.id}>{sl.name}</MenuItem>)
                  }
                </Select>
              </FormControl>
            )}
            <TextField label='Expenses Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <TextField label='Application' size='small' fullWidth value={form.application} onChange={(e) => setForm((f) => ({ ...f, application: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField
              label='Max Amount Allowed Per Day Per Resource ($)' type='number' size='small' fullWidth
              value={form.maxAmountPerDay}
              onChange={(e) => setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <FormControlLabel
              control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />}
              label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.serviceLineId)}
            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_EX, '&:hover': { bgcolor: '#6d28d9' } }}
          >
            {editingRow ? 'Save Changes' : 'Add Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense Project</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Approvals panel
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_AP = '#059669';
const EMPTY_AP: Omit<IConfigApproval, 'id'> = { approverName: '', approverRole: '', approvalOrder: 1, isRequired: true };

interface ApprovalsPanelProps {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  onBack: () => void;
  onSave: (updated: IConfigServiceLine) => void;
}

const ApprovalsPanel = ({ serviceLines, initialServiceLineId, onBack, onSave }: ApprovalsPanelProps) => {
  const [slId, setSlId] = useState(initialServiceLineId ?? '');
  const [rows, setRows] = useState<IConfigApproval[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApproval | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'>>(EMPTY_AP);

  const activeSL = serviceLines.find((s) => s.id === slId) ?? null;

  useEffect(() => { setRows(activeSL?.approvals ?? []); setSelectedId(null); }, [slId]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow ? { approverName: editingRow.approverName, approverRole: editingRow.approverRole, approvalOrder: editingRow.approvalOrder, isRequired: editingRow.isRequired } : { ...EMPTY_AP, approvalOrder: rows.length + 1 });
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const sorted = [...rows].sort((a, b) => a.approvalOrder - b.approvalOrder);
  const filtered = search ? sorted.filter((r) => r.approverName.toLowerCase().includes(search.toLowerCase()) || r.approverRole.toLowerCase().includes(search.toLowerCase())) : sorted;

  const saveRows = (next: IConfigApproval[]) => { if (!activeSL) return; setRows(next); onSave({ ...activeSL, approvals: next }); };

  const handleSubmit = () => {
    if (!form.approverName.trim()) return;
    if (editingRow) { saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))); setSelectedId(editingRow.id); }
    else { const n: IConfigApproval = { id: `ap_${Date.now()}`, ...form }; saveRows([...rows, n]); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => { if (!selectedRow) return; saveRows(rows.filter((r) => r.id !== selectedRow.id)); setSelectedId(null); setDeleteOpen(false); };
  const toggleRequired = (row: IConfigApproval, val: boolean) => saveRows(rows.map((r) => (r.id === row.id ? { ...r, isRequired: val } : r)));

  const columns: Column<IConfigApproval>[] = [
    { id: 'approvalOrder', label: 'Order', minWidth: 70, format: (v): React.ReactNode => <Chip label={`#${v}`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_AP, 0.1), color: ACCENT_AP, height: 22, borderRadius: 1 }} /> },
    { id: 'approverName', label: 'Approver Name', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'approverRole', label: 'Approver Role', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'isRequired', label: 'Required', minWidth: 90, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.isRequired} onChange={(e) => { e.stopPropagation(); toggleRequired(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader accent={ACCENT_AP} icon={<ChecklistIcon sx={{ fontSize: '1rem' }} />} title='Add Approvals' onBack={onBack} />
      <ServiceLinePicker accent={ACCENT_AP} serviceLines={serviceLines} value={slId} onChange={(id) => { setSlId(id); setSelectedId(null); }} />

      {!activeSL ? (
        <NoPick text='Select a service line above to view and manage its approval chain.' />
      ) : (
        <>
          <PanelToolbar accent={ACCENT_AP} selectedLabel={selectedRow?.approverName ?? null} onNew={() => { setEditingRow(null); setDialogOpen(true); }} onEdit={() => { setEditingRow(selectedRow); setDialogOpen(true); }} onDelete={() => setDeleteOpen(true)} search={search} onSearch={setSearch} onClear={() => setSelectedId(null)} />
          <PanelTable accent={ACCENT_AP}>
            <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
          </PanelTable>
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Approver' : 'New Approver'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <TextField label='Approver Name' size='small' fullWidth required value={form.approverName} onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))} />
            <TextField label='Approver Role' size='small' fullWidth value={form.approverRole} onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))} />
            <TextField label='Approval Order' type='number' size='small' fullWidth value={form.approvalOrder} onChange={(e) => setForm((f) => ({ ...f, approvalOrder: Math.max(1, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 1 } }} />
            <FormControlLabel control={<Switch checked={form.isRequired} color='success' onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Required</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.approverName.trim()} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_AP, '&:hover': { bgcolor: '#047857' } }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Approver</DialogTitle>
        <DialogContent><Typography variant='body2'>Remove <strong>{selectedRow?.approverName}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Ticket Type Activation panel
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_TT = '#ea580c';

interface TicketTypePanelProps {
  serviceLines: IConfigServiceLine[];
  initialServiceLineId: string | null;
  allTicketTypeKeys: string[];
  onBack: () => void;
  onSave: (updated: IConfigServiceLine) => void;
}

const TicketTypePanel = ({ serviceLines, initialServiceLineId, allTicketTypeKeys, onBack, onSave }: TicketTypePanelProps) => {
  const [slId, setSlId] = useState(initialServiceLineId ?? '');
  const [rows, setRows] = useState<IConfigServiceLineTicketType[]>([]);

  const activeSL = serviceLines.find((s) => s.id === slId) ?? null;

  const buildRows = (sl: IConfigServiceLine): IConfigServiceLineTicketType[] =>
    allTicketTypeKeys.map((key, idx) => sl.ticketTypeActivations?.find((r) => r.ticketTypeName === key) ?? { ticketTypeId: idx + 1, ticketTypeName: key, enabled: true });

  useEffect(() => { setRows(activeSL ? buildRows(activeSL) : []); }, [slId, allTicketTypeKeys.join(',')]);

  const saveRows = (next: IConfigServiceLineTicketType[]) => {
    if (!activeSL) return;
    setRows(next);
    onSave({ ...activeSL, ticketTypeActivations: next });
  };

  const toggleEnabled = (name: string, val: boolean) => saveRows(rows.map((r) => (r.ticketTypeName === name ? { ...r, enabled: val } : r)));
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader accent={ACCENT_TT} icon={<ToggleOnIcon sx={{ fontSize: '1rem' }} />} title='Enable / Disable Ticket Types' onBack={onBack} />
      <ServiceLinePicker accent={ACCENT_TT} serviceLines={serviceLines} value={slId} onChange={(id) => setSlId(id)} />

      {!activeSL ? (
        <NoPick text='Select a service line above to manage its ticket type activations.' />
      ) : (
        <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_TT, 0.25), borderTop: 'none' }}>
          <Box sx={{ px: 2, py: 0.75, bgcolor: alpha(ACCENT_TT, 0.05), borderBottom: '1px solid', borderColor: alpha(ACCENT_TT, 0.12) }}>
            <Typography variant='caption' color='text.secondary'>{enabledCount} of {rows.length} ticket types enabled</Typography>
          </Box>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(ACCENT_TT, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1 }}>Ticket Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1, width: 110, textAlign: 'center' }}>Enabled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0
                ? <TableRow><TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.disabled', fontSize: '0.82rem' }}>No ticket types configured</TableCell></TableRow>
                : rows.map((row) => (
                  <TableRow key={row.ticketTypeName} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.enabled ? ACCENT_TT : 'grey.400', flexShrink: 0 }} />
                        <Typography variant='body2' fontWeight={500} fontSize='0.84rem'>{row.ticketTypeName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, textAlign: 'center' }}>
                      <Switch size='small' checked={row.enabled} onChange={(e) => toggleEnabled(row.ticketTypeName, e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: row.enabled ? ACCENT_TT : undefined } }} />
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Lines
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_SL_FORM = { businessCategoryId: '', businessCategoryName: '', name: '', description: '', manager: '' };
type ActivePanel = 'none' | 'timesheet' | 'expenses' | 'approvals' | 'ticketTypes';

const ServiceLines = () => {
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

  const businessCategories = apiCat?.businessCategories ?? [];

  useEffect(() => { if (apiCat?.serviceLines) setRows(apiCat.serviceLines); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow ? { businessCategoryId: editingRow.businessCategoryId, businessCategoryName: editingRow.businessCategoryName, name: editingRow.name, description: editingRow.description, manager: editingRow.manager } : EMPTY_SL_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.businessCategoryName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.manager.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigServiceLine[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: next, applications: apiCat?.applications ?? [], queues: apiCat?.queues ?? [], applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: apiCat?.applicationSubCategories ?? [], applicationNumberSequences: apiCat?.applicationNumberSequences ?? [] });
  };

  const handleCategoryChange = (id: string) => { const cat = businessCategories.find((c) => c.id === id); setForm((f) => ({ ...f, businessCategoryId: id, businessCategoryName: cat?.name ?? '' })); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) { saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))); setSelectedId(editingRow.id); }
    else { const n: IConfigServiceLine = { id: `sl_${Date.now()}`, ...form, timesheetProjects: [], expenseProjects: [], approvals: [], ticketTypeActivations: [] }; saveRows([...rows, n]); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => { if (!selectedRow) return; saveRows(rows.filter((r) => r.id !== selectedRow.id)); setSelectedId(null); setDeleteOpen(false); };

  const handleSubPanelSave = (updated: IConfigServiceLine) => saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));

  const togglePanel = (panel: ActivePanel) => setActivePanel((prev) => (prev === panel ? 'none' : panel));

  const panelActive = activePanel !== 'none';

  const slColumns: Column<IConfigServiceLine>[] = [
    { id: 'businessCategoryName', label: 'Business Category', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'name', label: 'Service Line Name', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 220, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'manager', label: 'Service Line Manager', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LinearScaleIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Service Lines</Typography>
            <Typography className={classes.sectionSubtitle}>Define service lines and associate them with business categories</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* ── Toolbar ── */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!panelActive && (
              !selectedRow
                ? <Tooltip title='Add a new service line'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
                : <>
                    <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
                    <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>
                    <Divider orientation='vertical' flexItem className={classes.toolbarDivider} sx={{ mx: 0.5 }} />
                  </>
            )}

            <Button size='small' startIcon={<ChecklistIcon />} variant={activePanel === 'approvals' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('approvals')}>Add Approvals</Button>
            <Button size='small' startIcon={<ToggleOnIcon />} variant={activePanel === 'ticketTypes' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('ticketTypes')}>Enable / Disable Ticket Types</Button>
            <Button size='small' startIcon={<AccessTimeIcon />} variant={activePanel === 'timesheet' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('timesheet')}>Add Timesheet Projects</Button>
            <Button size='small' startIcon={<ReceiptLongIcon />} variant={activePanel === 'expenses' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('expenses')}>Add Expenses Projects</Button>

            {!panelActive && (
              <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
            )}
          </Box>
          {!panelActive && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link>
            </Typography>
          )}
        </Paper>

        {/* ── Service Lines table: hidden while a panel is open ── */}
        {!panelActive && (
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable columns={slColumns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
          </Paper>
        )}

        {/* ── Sub-panels: replace the table, always openable ── */}
        {activePanel === 'timesheet' && (
          <TimesheetPanel serviceLines={rows} defaultServiceLineId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'expenses' && (
          <ExpensePanel serviceLines={rows} defaultServiceLineId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'approvals' && (
          <ApprovalsPanel serviceLines={rows} initialServiceLineId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'ticketTypes' && (
          <TicketTypePanel serviceLines={rows} initialServiceLineId={selectedId} allTicketTypeKeys={ticketTypeKeys} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
      </AccordionDetails>

      {/* ── Service Line Form ── */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Service Line' : 'New Service Line'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <FormControl size='small' fullWidth required>
              <InputLabel>Business Category</InputLabel>
              <Select label='Business Category' value={form.businessCategoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
                {businessCategories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label='Service Line Name' size='small' fullWidth required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <TextField label='Service Line Manager' size='small' fullWidth value={form.manager} onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.name.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Service Line</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application-level shared helper: Application Picker
// ─────────────────────────────────────────────────────────────────────────────

const ApplicationPicker = ({
  accent, applications, value, onChange,
}: { accent: string; applications: IConfigApplication[]; value: string; onChange: (id: string) => void }) => (
  <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(accent, 0.04), border: '1px solid', borderColor: alpha(accent, 0.2), borderTop: 'none', borderBottom: 'none' }}>
    <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>Application:</Typography>
    <FormControl size='small' sx={{ minWidth: 260 }}>
      <Select displayEmpty value={value} onChange={(e) => onChange(e.target.value)}
        sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }}
        renderValue={(v) => {
          if (!v) return <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>— select an application —</Typography>;
          return applications.find((a) => a.id === v)?.name ?? v;
        }}
      >
        {applications.length === 0
          ? <MenuItem disabled value=''><em>No applications available</em></MenuItem>
          : applications.map((app) => <MenuItem key={app.id} value={app.id} sx={{ fontSize: '0.82rem' }}>{app.name}</MenuItem>)
        }
      </Select>
    </FormControl>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// App Approvals panel — flat view across all applications
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_AAP = '#059669';
type FlatAppApRow = IConfigApproval & { applicationId: string; applicationName: string };
const EMPTY_AAP: Omit<IConfigApproval, 'id'> = { approverName: '', approverRole: '', approvalOrder: 1, isRequired: true };

interface AppApprovalsPanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppApprovalsPanel = ({ applications, defaultApplicationId, onBack, onSave }: AppApprovalsPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatAppApRow[] = applications.flatMap((app) =>
    (app.approvals ?? []).map((a) => ({ ...a, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppApRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'> & { applicationId: string }>({ ...EMPTY_AAP, applicationId: defaultApplicationId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, approverName: editingRow.approverName, approverRole: editingRow.approverRole, approvalOrder: editingRow.approvalOrder, isRequired: editingRow.isRequired }
      : { ...EMPTY_AAP, applicationId: defaultApplicationId ?? '', approvalOrder: allRows.length + 1 });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.approverName.toLowerCase().includes(search.toLowerCase()) || r.approverRole.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.approverName.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId); if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, approvals: (tgt.approvals ?? []).map((a) => a.id === editingRow.id ? { id: a.id, ...fields } : a) }); setSelectedId(editingRow.id); }
    else { const n: IConfigApproval = { id: `aap_${Date.now()}`, ...fields }; onSave({ ...tgt, approvals: [...(tgt.approvals ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app) onSave({ ...app, approvals: (app.approvals ?? []).filter((a) => a.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleRequired = (row: FlatAppApRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app) onSave({ ...app, approvals: (app.approvals ?? []).map((a) => a.id === row.id ? { ...a, isRequired: val } : a) });
  };

  const columns: Column<FlatAppApRow>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_AAP, 0.1), color: ACCENT_AAP, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'approvalOrder', label: 'Order', minWidth: 70, format: (v): React.ReactNode => <Chip label={`#${v}`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_AAP, 0.08), color: ACCENT_AAP, height: 22, borderRadius: 1 }} /> },
    { id: 'approverName', label: 'Approver Name', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'approverRole', label: 'Approver Role', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'isRequired', label: 'Required', minWidth: 90, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.isRequired} onChange={(e) => { e.stopPropagation(); toggleRequired(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_AAP, 0.08), border: '1px solid', borderColor: alpha(ACCENT_AAP, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_AAP, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_AAP, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_AAP, 0.3) }} />
        <ChecklistIcon sx={{ color: ACCENT_AAP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_AAP }}>Application Approvals</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} approver{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add approver'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_AAP, '&:hover': { bgcolor: '#047857' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_AAP, '&:hover': { bgcolor: '#047857' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.approverName}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_AAP, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Approver' : 'New Approver'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Application:</Typography><Chip label={editingRow.applicationName} size='small' sx={{ bgcolor: alpha(ACCENT_AAP, 0.1), color: ACCENT_AAP, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Approver Name' size='small' fullWidth required value={form.approverName} onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))} />
            <TextField label='Approver Role' size='small' fullWidth value={form.approverRole} onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))} />
            <TextField label='Approval Order' type='number' size='small' fullWidth value={form.approvalOrder} onChange={(e) => setForm((f) => ({ ...f, approvalOrder: Math.max(1, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 1 } }} />
            <FormControlLabel control={<Switch checked={form.isRequired} color='success' onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Required</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.approverName.trim() || (!editingRow && !form.applicationId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_AAP, '&:hover': { bgcolor: '#047857' } }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Approver</DialogTitle>
        <DialogContent><Typography variant='body2'>Remove <strong>{selectedRow?.approverName}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Ticket Type panel — picker-based
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_ATT = '#ea580c';

interface AppTicketTypePanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; allTicketTypeKeys: string[]; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppTicketTypePanel = ({ applications, defaultApplicationId, allTicketTypeKeys, onBack, onSave }: AppTicketTypePanelProps) => {
  const [appId, setAppId] = useState(defaultApplicationId ?? '');
  const [rows, setRows] = useState<IConfigServiceLineTicketType[]>([]);
  const activeApp = applications.find((a) => a.id === appId) ?? null;

  const buildRows = (app: IConfigApplication) =>
    allTicketTypeKeys.map((key, idx) => app.ticketTypeActivations?.find((r) => r.ticketTypeName === key) ?? { ticketTypeId: idx + 1, ticketTypeName: key, enabled: true });

  useEffect(() => { setRows(activeApp ? buildRows(activeApp) : []); }, [appId, allTicketTypeKeys.join(',')]);

  const saveRows = (next: IConfigServiceLineTicketType[]) => { if (!activeApp) return; setRows(next); onSave({ ...activeApp, ticketTypeActivations: next }); };
  const toggleEnabled = (name: string, val: boolean) => saveRows(rows.map((r) => (r.ticketTypeName === name ? { ...r, enabled: val } : r)));
  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader accent={ACCENT_ATT} icon={<ToggleOnIcon sx={{ fontSize: '1rem' }} />} title='Enable / Disable Application Specific Ticket Types' onBack={onBack} />
      <ApplicationPicker accent={ACCENT_ATT} applications={applications} value={appId} onChange={(id) => setAppId(id)} />
      {!activeApp ? <NoPick text='Select an application above to manage its ticket type activations.' /> : (
        <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_ATT, 0.25), borderTop: 'none' }}>
          <Box sx={{ px: 2, py: 0.75, bgcolor: alpha(ACCENT_ATT, 0.05), borderBottom: '1px solid', borderColor: alpha(ACCENT_ATT, 0.12) }}>
            <Typography variant='caption' color='text.secondary'>{enabledCount} of {rows.length} ticket types enabled</Typography>
          </Box>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(ACCENT_ATT, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1 }}>Ticket Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1, width: 110, textAlign: 'center' }}>Enabled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0
                ? <TableRow><TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.disabled', fontSize: '0.82rem' }}>No ticket types configured</TableCell></TableRow>
                : rows.map((row) => (
                  <TableRow key={row.ticketTypeName} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.enabled ? ACCENT_ATT : 'grey.400', flexShrink: 0 }} />
                        <Typography variant='body2' fontWeight={500} fontSize='0.84rem'>{row.ticketTypeName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.75, textAlign: 'center' }}>
                      <Switch size='small' checked={row.enabled} onChange={(e) => toggleEnabled(row.ticketTypeName, e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: row.enabled ? ACCENT_ATT : undefined } }} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Support Lines / Queues panel — flat view
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_ASL = '#0284c7';
type FlatAppSlRow = IConfigSupportLine & { applicationId: string; applicationName: string };
const EMPTY_ASL: Omit<IConfigSupportLine, 'id'> = { name: '', description: '', isActive: true };

interface AppSupportLinesPanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppSupportLinesPanel = ({ applications, defaultApplicationId, onBack, onSave }: AppSupportLinesPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatAppSlRow[] = applications.flatMap((app) =>
    (app.supportLines ?? []).map((s) => ({ ...s, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppSlRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigSupportLine, 'id'> & { applicationId: string }>({ ...EMPTY_ASL, applicationId: defaultApplicationId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, name: editingRow.name, description: editingRow.description, isActive: editingRow.isActive }
      : { ...EMPTY_ASL, applicationId: defaultApplicationId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId); if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, supportLines: (tgt.supportLines ?? []).map((s) => s.id === editingRow.id ? { id: s.id, ...fields } : s) }); setSelectedId(editingRow.id); }
    else { const n: IConfigSupportLine = { id: `asl_${Date.now()}`, ...fields }; onSave({ ...tgt, supportLines: [...(tgt.supportLines ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app) onSave({ ...app, supportLines: (app.supportLines ?? []).filter((s) => s.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleActive = (row: FlatAppSlRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app) onSave({ ...app, supportLines: (app.supportLines ?? []).map((s) => s.id === row.id ? { ...s, isActive: val } : s) });
  };

  const columns: Column<FlatAppSlRow>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_ASL, 0.1), color: ACCENT_ASL, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'name', label: 'Support Line / Queue', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 200, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'isActive', label: 'Active', minWidth: 80, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.isActive} onChange={(e) => { e.stopPropagation(); toggleActive(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_ASL, 0.08), border: '1px solid', borderColor: alpha(ACCENT_ASL, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_ASL, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_ASL, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_ASL, 0.3) }} />
        <HeadsetMicIcon sx={{ color: ACCENT_ASL, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_ASL }}>Application Specific Support Lines / Queues</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} support line{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add support line'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_ASL, '&:hover': { bgcolor: '#0369a1' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_ASL, '&:hover': { bgcolor: '#0369a1' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_ASL, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Support Line / Queue' : 'New Support Line / Queue'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Application:</Typography><Chip label={editingRow.applicationName} size='small' sx={{ bgcolor: alpha(ACCENT_ASL, 0.1), color: ACCENT_ASL, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Support Line / Queue Name' size='small' fullWidth required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <FormControlLabel control={<Switch checked={form.isActive} color='success' onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Active</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.name.trim() || (!editingRow && !form.applicationId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_ASL, '&:hover': { bgcolor: '#0369a1' } }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Support Line</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Billing Codes panel — flat view
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_ABC = '#0f766e';
type FlatAppBcRow = IConfigBillingCode & { applicationId: string; applicationName: string };
const EMPTY_ABC: Omit<IConfigBillingCode, 'id'> = { code: '', description: '', isActive: true };

interface AppBillingCodesPanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppBillingCodesPanel = ({ applications, defaultApplicationId, onBack, onSave }: AppBillingCodesPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatAppBcRow[] = applications.flatMap((app) =>
    (app.billingCodes ?? []).map((b) => ({ ...b, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppBcRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigBillingCode, 'id'> & { applicationId: string }>({ ...EMPTY_ABC, applicationId: defaultApplicationId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, code: editingRow.code, description: editingRow.description, isActive: editingRow.isActive }
      : { ...EMPTY_ABC, applicationId: defaultApplicationId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.code.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.code.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId); if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, billingCodes: (tgt.billingCodes ?? []).map((b) => b.id === editingRow.id ? { id: b.id, ...fields } : b) }); setSelectedId(editingRow.id); }
    else { const n: IConfigBillingCode = { id: `abc_${Date.now()}`, ...fields }; onSave({ ...tgt, billingCodes: [...(tgt.billingCodes ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app) onSave({ ...app, billingCodes: (app.billingCodes ?? []).filter((b) => b.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleActive = (row: FlatAppBcRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app) onSave({ ...app, billingCodes: (app.billingCodes ?? []).map((b) => b.id === row.id ? { ...b, isActive: val } : b) });
  };

  const columns: Column<FlatAppBcRow>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_ABC, 0.1), color: ACCENT_ABC, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'code', label: 'Billing Code', minWidth: 130, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: alpha(ACCENT_ABC, 0.08), color: ACCENT_ABC, fontSize: '0.78rem', height: 22, borderRadius: 1 }} /> },
    { id: 'description', label: 'Description', minWidth: 200, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'isActive', label: 'Active', minWidth: 80, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.isActive} onChange={(e) => { e.stopPropagation(); toggleActive(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_ABC, 0.08), border: '1px solid', borderColor: alpha(ACCENT_ABC, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_ABC, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_ABC, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_ABC, 0.3) }} />
        <CodeIcon sx={{ color: ACCENT_ABC, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_ABC }}>Application Specific Time Entry Billing Codes</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} code{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add billing code'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_ABC, '&:hover': { bgcolor: '#0d6460' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_ABC, '&:hover': { bgcolor: '#0d6460' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.code}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_ABC, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Billing Code' : 'New Billing Code'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Application:</Typography><Chip label={editingRow.applicationName} size='small' sx={{ bgcolor: alpha(ACCENT_ABC, 0.1), color: ACCENT_ABC, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Billing Code' size='small' fullWidth required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <FormControlLabel control={<Switch checked={form.isActive} color='success' onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Active</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.code.trim() || (!editingRow && !form.applicationId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_ABC, '&:hover': { bgcolor: '#0d6460' } }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Billing Code</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.code}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Timesheet Projects panel — flat view
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_ATS = '#0891b2';
type FlatAppTsRow = IConfigTimesheetProject & { applicationId: string; applicationName: string };
const EMPTY_ATS_FORM = { applicationId: '', project: '', fromDate: '', toDate: '', activate: true, maxHoursPerDayPerResource: 8 };

interface AppTimesheetPanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppTimesheetPanel = ({ applications, defaultApplicationId, onBack, onSave }: AppTimesheetPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatAppTsRow[] = applications.flatMap((app) =>
    (app.timesheetProjects ?? []).map((p) => ({ ...p, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppTsRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY_ATS_FORM, applicationId: defaultApplicationId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, project: editingRow.project, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource }
      : { ...EMPTY_ATS_FORM, applicationId: defaultApplicationId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.project.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId); if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, timesheetProjects: (tgt.timesheetProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, application: '', ...fields } : p) }); setSelectedId(editingRow.id); }
    else { const n: IConfigTimesheetProject = { id: `ats_${Date.now()}`, application: '', ...fields }; onSave({ ...tgt, timesheetProjects: [...(tgt.timesheetProjects ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app) onSave({ ...app, timesheetProjects: (app.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleActivate = (row: FlatAppTsRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app) onSave({ ...app, timesheetProjects: (app.timesheetProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const columns: Column<FlatAppTsRow>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_ATS, 0.1), color: ACCENT_ATS, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'project', label: 'Project', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'fromDate', label: 'From Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'toDate', label: 'To Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'activate', label: 'Activate', minWidth: 85, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.activate} onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
    { id: 'maxHoursPerDayPerResource', label: 'Max Hrs / Day / Resource', minWidth: 170, format: (v): React.ReactNode => <Chip label={`${v} hrs`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_ATS, 0.1), color: ACCENT_ATS, height: 22, borderRadius: 1 }} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_ATS, 0.08), border: '1px solid', borderColor: alpha(ACCENT_ATS, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_ATS, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_ATS, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_ATS, 0.3) }} />
        <AccessTimeIcon sx={{ color: ACCENT_ATS, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_ATS }}>Add Timesheet Projects</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} project{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add timesheet project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_ATS, '&:hover': { bgcolor: '#0e7490' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_ATS, '&:hover': { bgcolor: '#0e7490' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_ATS, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Timesheet Project' : 'New Timesheet Project'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Application:</Typography><Chip label={editingRow.applicationName} size='small' sx={{ bgcolor: alpha(ACCENT_ATS, 0.1), color: ACCENT_ATS, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField label='Max Hours Allowed Per Day Per Resource' type='number' size='small' fullWidth value={form.maxHoursPerDayPerResource} onChange={(e) => setForm((f) => ({ ...f, maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }} />
            <FormControlLabel control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.applicationId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_ATS, '&:hover': { bgcolor: '#0e7490' } }}>{editingRow ? 'Save Changes' : 'Add Project'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Timesheet Project</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Sticky Note panel — simple textarea
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_ASN = '#d97706';

interface AppStickyNotePanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppStickyNotePanel = ({ applications, defaultApplicationId, onBack, onSave }: AppStickyNotePanelProps) => {
  const activeApp = applications.find((a) => a.id === defaultApplicationId) ?? null;
  const [note, setNote] = useState(activeApp?.stickyNote ?? '');

  const handleSave = () => { if (activeApp) onSave({ ...activeApp, stickyNote: note }); };

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader accent={ACCENT_ASN} icon={<NoteAltIcon sx={{ fontSize: '1rem' }} />} title='Add Sticky Note' onBack={onBack} />
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', border: '1px solid', borderColor: alpha(ACCENT_ASN, 0.25), borderTop: 'none', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeApp && (
          <Typography variant='caption' color='text.secondary'>
            Sticky note for <strong>{activeApp.name}</strong>
          </Typography>
        )}
        <TextField
          multiline minRows={6} maxRows={16} fullWidth
          placeholder='Enter a sticky note…'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: alpha(ACCENT_ASN, 0.03), fontSize: '0.88rem', lineHeight: 1.6 } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size='small' onClick={() => setNote(activeApp?.stickyNote ?? '')} sx={{ textTransform: 'none', borderRadius: 2 }}>Reset</Button>
          <Button size='small' variant='contained' onClick={handleSave} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_ASN, '&:hover': { bgcolor: '#b45309' } }}>Save Note</Button>
        </Box>
      </Paper>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App Expense Projects panel — flat view
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_AEX = '#7c3aed';
type FlatAppExRow = IConfigExpenseProject & { applicationId: string; applicationName: string };
const EMPTY_AEX_FORM = { applicationId: '', project: '', fromDate: '', toDate: '', activate: true, maxAmountPerDay: 0 };

interface AppExpensePanelProps { applications: IConfigApplication[]; defaultApplicationId: string | null; onBack: () => void; onSave: (updated: IConfigApplication) => void; }

const AppExpensePanel = ({ applications, defaultApplicationId, onBack, onSave }: AppExpensePanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatAppExRow[] = applications.flatMap((app) =>
    (app.expenseProjects ?? []).map((p) => ({ ...p, applicationId: app.id, applicationName: app.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatAppExRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...EMPTY_AEX_FORM, applicationId: defaultApplicationId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, project: editingRow.project, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxAmountPerDay: editingRow.maxAmountPerDay }
      : { ...EMPTY_AEX_FORM, applicationId: defaultApplicationId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.project.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.project.trim() || !form.applicationId) return;
    const tgt = applications.find((a) => a.id === form.applicationId); if (!tgt) return;
    const { applicationId: _aid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, expenseProjects: (tgt.expenseProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, application: '', ...fields } : p) }); setSelectedId(editingRow.id); }
    else { const n: IConfigExpenseProject = { id: `aex_${Date.now()}`, application: '', ...fields }; onSave({ ...tgt, expenseProjects: [...(tgt.expenseProjects ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const app = applications.find((a) => a.id === selectedRow.applicationId);
    if (app) onSave({ ...app, expenseProjects: (app.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleActivate = (row: FlatAppExRow, val: boolean) => {
    const app = applications.find((a) => a.id === row.applicationId);
    if (app) onSave({ ...app, expenseProjects: (app.expenseProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const columns: Column<FlatAppExRow>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_AEX, 0.1), color: ACCENT_AEX, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'project', label: 'Expenses Project', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'fromDate', label: 'From Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'toDate', label: 'To Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'activate', label: 'Activate', minWidth: 85, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.activate} onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
    { id: 'maxAmountPerDay', label: 'Max Amount / Day / Resource', minWidth: 190, format: (v): React.ReactNode => <Chip label={`$${Number(v).toFixed(2)}`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_AEX, 0.1), color: ACCENT_AEX, height: 22, borderRadius: 1 }} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_AEX, 0.08), border: '1px solid', borderColor: alpha(ACCENT_AEX, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_AEX, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_AEX, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_AEX, 0.3) }} />
        <ReceiptLongIcon sx={{ color: ACCENT_AEX, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_AEX }}>Add Expenses Projects</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} project{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add expense project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_AEX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_AEX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_AEX, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Expense Project' : 'New Expense Project'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Application:</Typography><Chip label={editingRow.applicationName} size='small' sx={{ bgcolor: alpha(ACCENT_AEX, 0.1), color: ACCENT_AEX, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => setForm((f) => ({ ...f, applicationId: e.target.value }))}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Expenses Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField label='Max Amount Allowed Per Day Per Resource ($)' type='number' size='small' fullWidth value={form.maxAmountPerDay} onChange={(e) => setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
            <FormControlLabel control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.applicationId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_AEX, '&:hover': { bgcolor: '#6d28d9' } }}>{editingRow ? 'Save Changes' : 'Add Project'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense Project</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_APP_FORM = { serviceLineId: '', serviceLineName: '', name: '', description: '', enableSupportLevels: false, applicationLead: '', managerLevel1: '', managerLevel2: '' };
type AppActivePanel = 'none' | 'approvals' | 'ticketTypes' | 'supportLines' | 'billingCodes' | 'timesheet' | 'stickyNote' | 'expenses';

const Applications = () => {
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

  const serviceLines = apiCat?.serviceLines ?? [];

  useEffect(() => { if (apiCat?.applications) setRows(apiCat.applications); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { serviceLineId: editingRow.serviceLineId, serviceLineName: editingRow.serviceLineName, name: editingRow.name, description: editingRow.description, enableSupportLevels: editingRow.enableSupportLevels, applicationLead: editingRow.applicationLead, managerLevel1: editingRow.managerLevel1, managerLevel2: editingRow.managerLevel2 }
      : EMPTY_APP_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.serviceLineName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.applicationLead.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigApplication[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: apiCat?.serviceLines ?? [], applications: next, queues: apiCat?.queues ?? [], applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: apiCat?.applicationSubCategories ?? [], applicationNumberSequences: apiCat?.applicationNumberSequences ?? [] });
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
      const n: IConfigApplication = { id: `app_${Date.now()}`, ...form, approvals: [], ticketTypeActivations: [], supportLines: [], billingCodes: [], timesheetProjects: [], expenseProjects: [], stickyNote: '' };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => { if (!selectedRow) return; saveRows(rows.filter((r) => r.id !== selectedRow.id)); setSelectedId(null); setDeleteOpen(false); };
  const handleSubPanelSave = (updated: IConfigApplication) => saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));
  const togglePanel = (panel: AppActivePanel) => setActivePanel((prev) => (prev === panel ? 'none' : panel));
  const panelActive = activePanel !== 'none';

  const appColumns: Column<IConfigApplication>[] = [
    { id: 'serviceLineName', label: 'Service Line', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'name', label: 'Application Name', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 200, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'enableSupportLevels', label: 'Enable Support Levels / Queues', minWidth: 190, format: (v): React.ReactNode => <Chip label={v ? 'Enabled' : 'Disabled'} size='small' sx={{ fontWeight: 600, fontSize: '0.72rem', height: 20, bgcolor: v ? alpha('#059669', 0.1) : alpha('#64748b', 0.08), color: v ? '#059669' : 'text.secondary' }} /> },
    { id: 'applicationLead', label: 'Application Lead', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'managerLevel1', label: 'Manager Level 1', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'managerLevel2', label: 'Manager Level 2', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AppsIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Applications</Typography>
            <Typography className={classes.sectionSubtitle}>Manage applications linked to service lines and configure their specific settings</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* ── Toolbar ── */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {!panelActive && (
              !selectedRow
                ? <Tooltip title='Add a new application'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
                : <>
                    <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
                    <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>
                    <Divider orientation='vertical' flexItem className={classes.toolbarDivider} sx={{ mx: 0.5 }} />
                  </>
            )}
            <Button size='small' startIcon={<ChecklistIcon />} variant={activePanel === 'approvals' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('approvals')}>Approvals</Button>
            <Button size='small' startIcon={<ToggleOnIcon />} variant={activePanel === 'ticketTypes' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('ticketTypes')}>Enable / Disable Ticket Types</Button>
            <Button size='small' startIcon={<HeadsetMicIcon />} variant={activePanel === 'supportLines' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('supportLines')}>Support Lines / Queues</Button>
            <Button size='small' startIcon={<CodeIcon />} variant={activePanel === 'billingCodes' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('billingCodes')}>Billing Codes</Button>
            <Button size='small' startIcon={<AccessTimeIcon />} variant={activePanel === 'timesheet' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('timesheet')}>Add Timesheet Projects</Button>
            <Button size='small' startIcon={<NoteAltIcon />} variant={activePanel === 'stickyNote' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('stickyNote')}>Add Sticky Note</Button>
            <Button size='small' startIcon={<ReceiptLongIcon />} variant={activePanel === 'expenses' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('expenses')}>Add Expenses Projects</Button>
            {!panelActive && (
              <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
            )}
          </Box>
          {!panelActive && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link>
            </Typography>
          )}
        </Paper>

        {/* ── Main table ── */}
        {!panelActive && (
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable columns={appColumns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
          </Paper>
        )}

        {/* ── Sub-panels ── */}
        {activePanel === 'approvals' && <AppApprovalsPanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'ticketTypes' && <AppTicketTypePanel applications={rows} defaultApplicationId={selectedId} allTicketTypeKeys={ticketTypeKeys} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'supportLines' && <AppSupportLinesPanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'billingCodes' && <AppBillingCodesPanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'timesheet' && <AppTimesheetPanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'stickyNote' && <AppStickyNotePanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
        {activePanel === 'expenses' && <AppExpensePanel applications={rows} defaultApplicationId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />}
      </AccordionDetails>

      {/* ── New / Edit Application dialog ── */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Application' : 'New Application'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <FormControl size='small' fullWidth required>
              <InputLabel>Service Line</InputLabel>
              <Select label='Service Line' value={form.serviceLineId} onChange={(e) => handleServiceLineChange(e.target.value)}>
                {serviceLines.map((sl) => <MenuItem key={sl.id} value={sl.id}>{sl.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label='Application Name' size='small' fullWidth required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <TextField label='Application Lead' size='small' fullWidth value={form.applicationLead} onChange={(e) => setForm((f) => ({ ...f, applicationLead: e.target.value }))} />
            <TextField label='Manager Level 1' size='small' fullWidth value={form.managerLevel1} onChange={(e) => setForm((f) => ({ ...f, managerLevel1: e.target.value }))} />
            <TextField label='Manager Level 2' size='small' fullWidth value={form.managerLevel2} onChange={(e) => setForm((f) => ({ ...f, managerLevel2: e.target.value }))} />
            <FormControlLabel control={<Switch checked={form.enableSupportLevels} color='success' onChange={(e) => setForm((f) => ({ ...f, enableSupportLevels: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Enable Support Levels / Queues</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.name.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Application</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue-level panels
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_QAP = '#d97706';
const ACCENT_QTT = '#0369a1';
const ACCENT_QTS = '#0f766e';
const ACCENT_QEX = '#7c3aed';

type FlatQueueApRow = IConfigApproval & { queueId: string; queueName: string };
const EMPTY_QAP: Omit<IConfigApproval, 'id'> = { approverName: '', approverRole: '', approvalOrder: 1, isRequired: true };

interface QueueApprovalsPanelProps { queues: IConfigApplicationQueue[]; defaultQueueId: string | null; onBack: () => void; onSave: (updated: IConfigApplicationQueue) => void; }

const QueueApprovalsPanel = ({ queues, defaultQueueId, onBack, onSave }: QueueApprovalsPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatQueueApRow[] = queues.flatMap((q) =>
    (q.approvals ?? []).map((a) => ({ ...a, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueApRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Omit<IConfigApproval, 'id'> & { queueId: string }>({ ...EMPTY_QAP, queueId: defaultQueueId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { queueId: editingRow.queueId, approverName: editingRow.approverName, approverRole: editingRow.approverRole, approvalOrder: editingRow.approvalOrder, isRequired: editingRow.isRequired }
      : { ...EMPTY_QAP, queueId: defaultQueueId ?? '', approvalOrder: allRows.length + 1 });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.approverName.toLowerCase().includes(search.toLowerCase()) || r.approverRole.toLowerCase().includes(search.toLowerCase()) || r.queueName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const handleSubmit = () => {
    if (!form.approverName.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId); if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, approvals: (tgt.approvals ?? []).map((a) => a.id === editingRow.id ? { id: a.id, ...fields } : a) }); setSelectedId(editingRow.id); }
    else { const n: IConfigApproval = { id: `qap_${Date.now()}`, ...fields }; onSave({ ...tgt, approvals: [...(tgt.approvals ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q) onSave({ ...q, approvals: (q.approvals ?? []).filter((a) => a.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };
  const toggleRequired = (row: FlatQueueApRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q) onSave({ ...q, approvals: (q.approvals ?? []).map((a) => a.id === row.id ? { ...a, isRequired: val } : a) });
  };

  const columns: Column<FlatQueueApRow>[] = [
    { id: 'queueName', label: 'Queue', minWidth: 140, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_QAP, 0.1), color: ACCENT_QAP, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'approvalOrder', label: 'Order', minWidth: 70, format: (v): React.ReactNode => <Chip label={`#${v}`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_QAP, 0.08), color: ACCENT_QAP, height: 22, borderRadius: 1 }} /> },
    { id: 'approverName', label: 'Approver Name', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'approverRole', label: 'Approver Role', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'isRequired', label: 'Required', minWidth: 90, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.isRequired} onChange={(e) => { e.stopPropagation(); toggleRequired(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_QAP, 0.08), border: '1px solid', borderColor: alpha(ACCENT_QAP, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_QAP, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_QAP, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_QAP, 0.3) }} />
        <ChecklistIcon sx={{ color: ACCENT_QAP, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QAP }}>Queue Approvals</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} approver{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add approver'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_QAP, '&:hover': { bgcolor: '#b45309' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_QAP, '&:hover': { bgcolor: '#b45309' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.approverName}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_QAP, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Queue Approver' : 'New Queue Approver'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow
              ? <Chip label={editingRow.queueName} size='small' sx={{ bgcolor: alpha(ACCENT_QAP, 0.1), color: ACCENT_QAP, fontWeight: 600, alignSelf: 'flex-start' }} />
              : <FormControl size='small' fullWidth required><InputLabel>Queue</InputLabel><Select label='Queue' value={form.queueId} onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}>{queues.length === 0 ? <MenuItem disabled value=''><em>No queues</em></MenuItem> : queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}</Select></FormControl>
            }
            <TextField label='Approver Name' size='small' fullWidth required value={form.approverName} onChange={(e) => setForm((f) => ({ ...f, approverName: e.target.value }))} />
            <TextField label='Approver Role' size='small' fullWidth value={form.approverRole} onChange={(e) => setForm((f) => ({ ...f, approverRole: e.target.value }))} />
            <TextField label='Approval Order' type='number' size='small' fullWidth value={form.approvalOrder} onChange={(e) => setForm((f) => ({ ...f, approvalOrder: Math.max(1, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 1 } }} />
            <FormControlLabel control={<Switch checked={form.isRequired} color='success' onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Required</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.approverName.trim() || !form.queueId} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_QAP, '&:hover': { bgcolor: '#b45309' } }}>{editingRow ? 'Save Changes' : 'Add Approver'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Queue Approver</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.approverName}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface QueueTicketTypePanelProps { queues: IConfigApplicationQueue[]; initialQueueId: string | null; allTicketTypeKeys: string[]; onBack: () => void; onSave: (updated: IConfigApplicationQueue) => void; }

const QueueTicketTypePanel = ({ queues, initialQueueId, allTicketTypeKeys, onBack, onSave }: QueueTicketTypePanelProps) => {
  const [selectedQueueId, setSelectedQueueId] = useState(initialQueueId ?? (queues[0]?.id ?? ''));
  const selectedQueue = queues.find((q) => q.id === selectedQueueId) ?? null;

  const rows: IConfigServiceLineTicketType[] = allTicketTypeKeys.map((key) => {
    const existing = (selectedQueue?.ticketTypeActivations ?? []).find((tt) => tt.ticketTypeName === key);
    return existing ?? { ticketTypeId: 0, ticketTypeName: key, enabled: true };
  });

  const toggleEnabled = (name: string, val: boolean) => {
    if (!selectedQueue) return;
    const updated = rows.map((r) => r.ticketTypeName === name ? { ...r, enabled: val } : r);
    onSave({ ...selectedQueue, ticketTypeActivations: updated });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_QTT, 0.08), border: '1px solid', borderColor: alpha(ACCENT_QTT, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_QTT, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_QTT, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_QTT, 0.3) }} />
        <ToggleOnIcon sx={{ color: ACCENT_QTT, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QTT }}>Enable / Disable Ticket Types</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{rows.filter((r) => r.enabled).length}/{rows.length} enabled</Typography>
      </Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(ACCENT_QTT, 0.04), border: '1px solid', borderColor: alpha(ACCENT_QTT, 0.2), borderTop: 'none', borderBottom: 'none' }}>
        <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>Queue:</Typography>
        <FormControl size='small' sx={{ minWidth: 260 }}>
          <Select displayEmpty value={selectedQueueId} onChange={(e) => setSelectedQueueId(e.target.value)} sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }} renderValue={(v) => { if (!v) return <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>— select a queue —</Typography>; return queues.find((q) => q.id === v)?.name ?? v; }}>
            {queues.length === 0 ? <MenuItem disabled value=''><em>No queues</em></MenuItem> : queues.map((q) => <MenuItem key={q.id} value={q.id} sx={{ fontSize: '0.82rem' }}>{q.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {selectedQueue ? (
        <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_QTT, 0.25), borderTop: 'none' }}>
          <Table size='small'>
            <TableHead sx={{ bgcolor: alpha(ACCENT_QTT, 0.06) }}>
              <TableRow><TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', py: 0.75 }}>Ticket Type</TableCell><TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', py: 0.75, textAlign: 'center', width: 100 }}>Enabled</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0
                ? <TableRow><TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.disabled', fontSize: '0.82rem' }}>No ticket types configured</TableCell></TableRow>
                : rows.map((row) => (
                  <TableRow key={row.ticketTypeName} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 0.75 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.enabled ? ACCENT_QTT : 'grey.400', flexShrink: 0 }} /><Typography variant='body2' fontWeight={500} fontSize='0.84rem'>{row.ticketTypeName}</Typography></Box></TableCell>
                    <TableCell sx={{ py: 0.75, textAlign: 'center' }}><Switch size='small' checked={row.enabled} onChange={(e) => toggleEnabled(row.ticketTypeName, e.target.checked)} /></TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', p: 3, textAlign: 'center', border: '1px solid', borderColor: alpha(ACCENT_QTT, 0.25), borderTop: 'none' }}>
          <Typography color='text.secondary' fontSize='0.82rem'>Select a queue to manage ticket types</Typography>
        </Paper>
      )}
    </Box>
  );
};

type FlatQueueTSRow = IConfigTimesheetProject & { queueId: string; queueName: string };
const EMPTY_QTS = { queueId: '', project: '', fromDate: '', toDate: '', activate: true, maxHoursPerDayPerResource: 8 };

interface QueueTimesheetPanelProps { queues: IConfigApplicationQueue[]; defaultQueueId: string | null; onBack: () => void; onSave: (updated: IConfigApplicationQueue) => void; }

const QueueTimesheetPanel = ({ queues, defaultQueueId, onBack, onSave }: QueueTimesheetPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatQueueTSRow[] = queues.flatMap((q) =>
    (q.timesheetProjects ?? []).map((p) => ({ ...p, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueTSRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_QTS>({ ...EMPTY_QTS, queueId: defaultQueueId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { queueId: editingRow.queueId, project: editingRow.project, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxHoursPerDayPerResource: editingRow.maxHoursPerDayPerResource }
      : { ...EMPTY_QTS, queueId: defaultQueueId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.project.toLowerCase().includes(search.toLowerCase()) || r.queueName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const toggleActivate = (row: FlatQueueTSRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q) onSave({ ...q, timesheetProjects: (q.timesheetProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const handleSubmit = () => {
    if (!form.project.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId); if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, timesheetProjects: (tgt.timesheetProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, ...fields, application: tgt.applicationName } : p) }); setSelectedId(editingRow.id); }
    else { const n: IConfigTimesheetProject = { id: `qts_${Date.now()}`, ...fields, application: tgt.applicationName }; onSave({ ...tgt, timesheetProjects: [...(tgt.timesheetProjects ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q) onSave({ ...q, timesheetProjects: (q.timesheetProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<FlatQueueTSRow>[] = [
    { id: 'queueName', label: 'Queue', minWidth: 130, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_QTS, 0.1), color: ACCENT_QTS, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'project', label: 'Timesheet Project', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'fromDate', label: 'From Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'toDate', label: 'To Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'activate', label: 'Activate', minWidth: 85, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.activate} onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
    { id: 'maxHoursPerDayPerResource', label: 'Max Hours / Day', minWidth: 145, format: (v): React.ReactNode => <Chip label={`${v}h`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_QTS, 0.1), color: ACCENT_QTS, height: 22, borderRadius: 1 }} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_QTS, 0.08), border: '1px solid', borderColor: alpha(ACCENT_QTS, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_QTS, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_QTS, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_QTS, 0.3) }} />
        <AccessTimeIcon sx={{ color: ACCENT_QTS, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QTS }}>Add Timesheet Projects</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} project{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add timesheet project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_QTS, '&:hover': { bgcolor: '#0f5e56' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_QTS, '&:hover': { bgcolor: '#0f5e56' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_QTS, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Timesheet Project' : 'New Timesheet Project'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Queue:</Typography><Chip label={editingRow.queueName} size='small' sx={{ bgcolor: alpha(ACCENT_QTS, 0.1), color: ACCENT_QTS, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Queue</InputLabel><Select label='Queue' value={form.queueId} onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}>{queues.length === 0 ? <MenuItem disabled value=''><em>No queues</em></MenuItem> : queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Timesheet Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField label='Max Hours Per Day Per Resource' type='number' size='small' fullWidth value={form.maxHoursPerDayPerResource} onChange={(e) => setForm((f) => ({ ...f, maxHoursPerDayPerResource: Math.max(0, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 0, step: 0.5 } }} />
            <FormControlLabel control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.queueId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_QTS, '&:hover': { bgcolor: '#0f5e56' } }}>{editingRow ? 'Save Changes' : 'Add Project'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Timesheet Project</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

type FlatQueueEXRow = IConfigExpenseProject & { queueId: string; queueName: string };
const EMPTY_QEX = { queueId: '', project: '', fromDate: '', toDate: '', activate: true, maxAmountPerDay: 0 };

interface QueueExpensesPanelProps { queues: IConfigApplicationQueue[]; defaultQueueId: string | null; onBack: () => void; onSave: (updated: IConfigApplicationQueue) => void; }

const QueueExpensesPanel = ({ queues, defaultQueueId, onBack, onSave }: QueueExpensesPanelProps) => {
  const { classes } = useStyles();
  const allRows: FlatQueueEXRow[] = queues.flatMap((q) =>
    (q.expenseProjects ?? []).map((p) => ({ ...p, queueId: q.id, queueName: q.name })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FlatQueueEXRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_QEX>({ ...EMPTY_QEX, queueId: defaultQueueId ?? '' });

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { queueId: editingRow.queueId, project: editingRow.project, fromDate: editingRow.fromDate, toDate: editingRow.toDate, activate: editingRow.activate, maxAmountPerDay: editingRow.maxAmountPerDay }
      : { ...EMPTY_QEX, queueId: defaultQueueId ?? '' });
  }, [dialogOpen, editingRow]);

  const selectedRow = allRows.find((r) => r.id === selectedId) ?? null;
  const filtered = search ? allRows.filter((r) => r.project.toLowerCase().includes(search.toLowerCase()) || r.queueName.toLowerCase().includes(search.toLowerCase())) : allRows;

  const toggleActivate = (row: FlatQueueEXRow, val: boolean) => {
    const q = queues.find((qq) => qq.id === row.queueId);
    if (q) onSave({ ...q, expenseProjects: (q.expenseProjects ?? []).map((p) => p.id === row.id ? { ...p, activate: val } : p) });
  };

  const handleSubmit = () => {
    if (!form.project.trim() || !form.queueId) return;
    const tgt = queues.find((q) => q.id === form.queueId); if (!tgt) return;
    const { queueId: _qid, ...fields } = form;
    if (editingRow) { onSave({ ...tgt, expenseProjects: (tgt.expenseProjects ?? []).map((p) => p.id === editingRow.id ? { id: p.id, ...fields, application: tgt.applicationName } : p) }); setSelectedId(editingRow.id); }
    else { const n: IConfigExpenseProject = { id: `qex_${Date.now()}`, ...fields, application: tgt.applicationName }; onSave({ ...tgt, expenseProjects: [...(tgt.expenseProjects ?? []), n] }); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    const q = queues.find((qq) => qq.id === selectedRow.queueId);
    if (q) onSave({ ...q, expenseProjects: (q.expenseProjects ?? []).filter((p) => p.id !== selectedRow.id) });
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<FlatQueueEXRow>[] = [
    { id: 'queueName', label: 'Queue', minWidth: 130, format: (v): React.ReactNode => <Chip label={String(v || '—')} size='small' sx={{ bgcolor: alpha(ACCENT_QEX, 0.1), color: ACCENT_QEX, fontWeight: 600, fontSize: '0.75rem', height: 20 }} /> },
    { id: 'project', label: 'Expenses Project', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'fromDate', label: 'From Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'toDate', label: 'To Date', minWidth: 105, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>{v ? String(v) : '—'}</Typography> },
    { id: 'activate', label: 'Activate', minWidth: 85, format: (_v, row): React.ReactNode => <Switch size='small' color='success' checked={row.activate} onChange={(e) => { e.stopPropagation(); toggleActivate(row, e.target.checked); }} onClick={(e) => e.stopPropagation()} /> },
    { id: 'maxAmountPerDay', label: 'Max Amount / Day', minWidth: 145, format: (v): React.ReactNode => <Chip label={`$${Number(v).toFixed(2)}`} size='small' sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(ACCENT_QEX, 0.1), color: ACCENT_QEX, height: 22, borderRadius: 1 }} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: alpha(ACCENT_QEX, 0.08), border: '1px solid', borderColor: alpha(ACCENT_QEX, 0.25), borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
        <Button size='small' variant='text' startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', color: ACCENT_QEX, fontWeight: 600, minWidth: 0, px: 1, py: 0.25, '&:hover': { bgcolor: alpha(ACCENT_QEX, 0.1) } }}>Back</Button>
        <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT_QEX, 0.3) }} />
        <ReceiptLongIcon sx={{ color: ACCENT_QEX, fontSize: '1.1rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: ACCENT_QEX }}>Add Expenses Projects</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>{allRows.length} project{allRows.length !== 1 ? 's' : ''}</Typography>
      </Box>
      <Paper variant='outlined' sx={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box className={classes.toolbarButtons}>
          {!selectedRow ? <Tooltip title='Add expense project'><Button size='small' variant='contained' startIcon={<AddIcon />} sx={{ bgcolor: ACCENT_QEX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
            : <Button size='small' variant='contained' startIcon={<EditIcon />} sx={{ bgcolor: ACCENT_QEX, '&:hover': { bgcolor: '#6d28d9' } }} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>}
          {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>}
          <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon sx={{ fontSize: '1rem' }} /></InputAdornment> } }} />
        </Box>
        {selectedRow && <Typography variant='caption' color='text.secondary'>Selected: <strong>{selectedRow.project}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
      </Paper>
      <Paper elevation={1} sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid', borderColor: alpha(ACCENT_QEX, 0.25), borderTop: 'none' }}>
        <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
      </Paper>
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Expense Project' : 'New Expense Project'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant='caption' color='text.secondary' fontWeight={600}>Queue:</Typography><Chip label={editingRow.queueName} size='small' sx={{ bgcolor: alpha(ACCENT_QEX, 0.1), color: ACCENT_QEX, fontWeight: 600, fontSize: '0.78rem' }} /></Box>
              : <FormControl size='small' fullWidth required><InputLabel>Queue</InputLabel><Select label='Queue' value={form.queueId} onChange={(e) => setForm((f) => ({ ...f, queueId: e.target.value }))}>{queues.length === 0 ? <MenuItem disabled value=''><em>No queues</em></MenuItem> : queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}</Select></FormControl>}
            <TextField label='Expenses Project' size='small' fullWidth required value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='From Date' type='date' size='small' fullWidth value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label='To Date' type='date' size='small' fullWidth value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField label='Max Amount Allowed Per Day Per Resource ($)' type='number' size='small' fullWidth value={form.maxAmountPerDay} onChange={(e) => setForm((f) => ({ ...f, maxAmountPerDay: Math.max(0, Number(e.target.value)) }))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
            <FormControlLabel control={<Switch checked={form.activate} color='success' onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))} />} label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Activate</Typography>} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.project.trim() || (!editingRow && !form.queueId)} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: ACCENT_QEX, '&:hover': { bgcolor: '#6d28d9' } }}>{editingRow ? 'Save Changes' : 'Add Project'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense Project</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.project}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application Queues
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_Q_FORM = { applicationId: '', applicationName: '', name: '', description: '', predecessor: '', successor: '', queueSpecificLead: '', managerLevel1: '', managerLevel2: '' };
type QueueActivePanel = 'none' | 'approvals' | 'ticketTypes' | 'timesheet' | 'expenses';

const ApplicationQueues = () => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection, ticketTypeKeys } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationQueue[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationQueue | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_Q_FORM);
  const [activePanel, setActivePanel] = useState<QueueActivePanel>('none');

  const applications = apiCat?.applications ?? [];

  useEffect(() => { if (apiCat?.queues) setRows(apiCat.queues); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, applicationName: editingRow.applicationName, name: editingRow.name, description: editingRow.description, predecessor: editingRow.predecessor, successor: editingRow.successor, queueSpecificLead: editingRow.queueSpecificLead, managerLevel1: editingRow.managerLevel1, managerLevel2: editingRow.managerLevel2 }
      : EMPTY_Q_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.applicationName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.queueSpecificLead.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigApplicationQueue[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: apiCat?.serviceLines ?? [], applications: apiCat?.applications ?? [], queues: next, applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: apiCat?.applicationSubCategories ?? [], applicationNumberSequences: apiCat?.applicationNumberSequences ?? [] });
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) { saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r))); setSelectedId(editingRow.id); }
    else { const n: IConfigApplicationQueue = { id: `q_${Date.now()}`, ...form, approvals: [], ticketTypeActivations: [], timesheetProjects: [], expenseProjects: [] }; saveRows([...rows, n]); setSelectedId(n.id); }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => { if (!selectedRow) return; saveRows(rows.filter((r) => r.id !== selectedRow.id)); setSelectedId(null); setDeleteOpen(false); };
  const handleSubPanelSave = (updated: IConfigApplicationQueue) => saveRows(rows.map((r) => (r.id === updated.id ? updated : r)));
  const togglePanel = (panel: QueueActivePanel) => setActivePanel((prev) => (prev === panel ? 'none' : panel));
  const panelActive = activePanel !== 'none';

  const qColumns: Column<IConfigApplicationQueue>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'name', label: 'Queue Name', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 200, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
    { id: 'queueSpecificLead', label: 'Queue Lead', minWidth: 140, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'managerLevel1', label: 'Manager L1', minWidth: 130, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'managerLevel2', label: 'Manager L2', minWidth: 130, format: (v): React.ReactNode => <Typography variant='body2' fontSize='0.82rem'>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HeadsetMicIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Queues</Typography>
            <Typography className={classes.sectionSubtitle}>Manage application queues and configure their routing settings</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {!panelActive && (
              !selectedRow
                ? <Tooltip title='Add a new application queue'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }}>New</Button></Tooltip>
                : <>
                    <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }}>Edit</Button>
                    <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)}>Delete</Button>
                    <Divider orientation='vertical' flexItem className={classes.toolbarDivider} sx={{ mx: 0.5 }} />
                  </>
            )}
            <Button size='small' startIcon={<ChecklistIcon />} variant={activePanel === 'approvals' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('approvals')}>Add Approvals</Button>
            <Button size='small' startIcon={<ToggleOnIcon />} variant={activePanel === 'ticketTypes' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('ticketTypes')}>Enable / Disable Ticket Types</Button>
            <Button size='small' startIcon={<AccessTimeIcon />} variant={activePanel === 'timesheet' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('timesheet')}>Add Timesheet Projects</Button>
            <Button size='small' startIcon={<ReceiptLongIcon />} variant={activePanel === 'expenses' ? 'contained' : 'outlined'} color='primary' onClick={() => togglePanel('expenses')}>Add Expenses Projects</Button>
            {!panelActive && (
              <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
            )}
          </Box>
          {!panelActive && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link>
            </Typography>
          )}
        </Paper>

        {!panelActive && (
          <Paper elevation={1} className={classes.tablePaper}>
            <DataTable columns={qColumns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
          </Paper>
        )}

        {activePanel === 'approvals' && (
          <QueueApprovalsPanel queues={rows} defaultQueueId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'ticketTypes' && (
          <QueueTicketTypePanel queues={rows} initialQueueId={selectedId} allTicketTypeKeys={ticketTypeKeys} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'timesheet' && (
          <QueueTimesheetPanel queues={rows} defaultQueueId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
        {activePanel === 'expenses' && (
          <QueueExpensesPanel queues={rows} defaultQueueId={selectedId} onBack={() => setActivePanel('none')} onSave={handleSubPanelSave} />
        )}
      </AccordionDetails>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Application Queue' : 'New Application Queue'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow
              ? <TextField label='Application' size='small' fullWidth value={form.applicationName} disabled />
              : <FormControl size='small' fullWidth required><InputLabel>Application</InputLabel><Select label='Application' value={form.applicationId} onChange={(e) => handleApplicationChange(e.target.value)}>{applications.length === 0 ? <MenuItem disabled value=''><em>No applications</em></MenuItem> : applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl>
            }
            <TextField label='Queue Name' size='small' fullWidth required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='Predecessor' size='small' fullWidth value={form.predecessor} onChange={(e) => setForm((f) => ({ ...f, predecessor: e.target.value }))} />
              <TextField label='Successor' size='small' fullWidth value={form.successor} onChange={(e) => setForm((f) => ({ ...f, successor: e.target.value }))} />
            </Box>
            <TextField label='Queue Specific Lead' size='small' fullWidth value={form.queueSpecificLead} onChange={(e) => setForm((f) => ({ ...f, queueSpecificLead: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label='Manager Level 1' size='small' fullWidth value={form.managerLevel1} onChange={(e) => setForm((f) => ({ ...f, managerLevel1: e.target.value }))} />
              <TextField label='Manager Level 2' size='small' fullWidth value={form.managerLevel2} onChange={(e) => setForm((f) => ({ ...f, managerLevel2: e.target.value }))} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.name.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Application Queue</DialogTitle>
        <DialogContent><Typography variant='body2'>Delete <strong>{selectedRow?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application Categories
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_APP_CAT_FORM = { applicationId: '', applicationName: '', categoryName: '', description: '' };

const ApplicationCategories = () => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_CAT_FORM);

  const applications = apiCat?.applications ?? [];

  useEffect(() => { if (apiCat?.applicationCategories) setRows(apiCat.applicationCategories); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, applicationName: editingRow.applicationName, categoryName: editingRow.categoryName, description: editingRow.description }
      : EMPTY_APP_CAT_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.applicationName.toLowerCase().includes(search.toLowerCase()) || r.categoryName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigApplicationCategory[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: apiCat?.serviceLines ?? [], applications: apiCat?.applications ?? [], queues: apiCat?.queues ?? [], applicationCategories: next, applicationSubCategories: apiCat?.applicationSubCategories ?? [] });
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.categoryName.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationCategory = { id: `appcat_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<IConfigApplicationCategory>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 160, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'categoryName', label: 'Application Category', minWidth: 180, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 220, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CategoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Categories</Typography>
            <Typography className={classes.sectionSubtitle}>Manage categories assigned to applications</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow
              ? <Tooltip title='Add a new application category'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>New</Button></Tooltip>
              : <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Edit</Button>
            }
            {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Delete</Button>}
            <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
          </Box>
          {selectedRow && <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>Selected: <strong>{selectedRow.categoryName}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
        </Paper>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
        </Paper>
      </AccordionDetails>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Application Category' : 'New Application Category'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? (
              <TextField label='Application' size='small' fullWidth value={form.applicationName} disabled />
            ) : (
              <FormControl size='small' fullWidth required>
                <InputLabel>Application</InputLabel>
                <Select label='Application' value={form.applicationId} onChange={(e) => handleApplicationChange(e.target.value)}>
                  {applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <TextField label='Application Category' size='small' fullWidth required value={form.categoryName} onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.categoryName.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Application Category</DialogTitle>
        <DialogContent><Typography variant='body2'>Are you sure you want to delete <strong>{selectedRow?.categoryName}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application Sub-Categories
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_APP_SUBCAT_FORM = { applicationId: '', applicationName: '', applicationCategoryId: '', applicationCategoryName: '', subCategoryName: '', description: '' };

const ApplicationSubCategories = () => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigApplicationSubCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationSubCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_SUBCAT_FORM);

  const applications = apiCat?.applications ?? [];
  const allCategories = apiCat?.applicationCategories ?? [];
  const filteredCategories = allCategories.filter((c) => !form.applicationId || c.applicationId === form.applicationId);

  useEffect(() => { if (apiCat?.applicationSubCategories) setRows(apiCat.applicationSubCategories); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, applicationName: editingRow.applicationName, applicationCategoryId: editingRow.applicationCategoryId, applicationCategoryName: editingRow.applicationCategoryName, subCategoryName: editingRow.subCategoryName, description: editingRow.description }
      : EMPTY_APP_SUBCAT_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.applicationName.toLowerCase().includes(search.toLowerCase()) || r.applicationCategoryName.toLowerCase().includes(search.toLowerCase()) || r.subCategoryName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigApplicationSubCategory[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: apiCat?.serviceLines ?? [], applications: apiCat?.applications ?? [], queues: apiCat?.queues ?? [], applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: next, applicationNumberSequences: apiCat?.applicationNumberSequences ?? [] });
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '', applicationCategoryId: '', applicationCategoryName: '' }));
  };

  const handleCategoryChange = (id: string) => {
    const cat = allCategories.find((c) => c.id === id);
    setForm((f) => ({ ...f, applicationCategoryId: id, applicationCategoryName: cat?.categoryName ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.subCategoryName.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationSubCategory = { id: `appsubcat_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<IConfigApplicationSubCategory>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'applicationCategoryName', label: 'Application Category', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'subCategoryName', label: 'Application Sub-Category', minWidth: 190, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'description', label: 'Description', minWidth: 220, format: (v): React.ReactNode => <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CategoryIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Sub-Categories</Typography>
            <Typography className={classes.sectionSubtitle}>Manage sub-categories assigned to application categories</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow
              ? <Tooltip title='Add a new application sub-category'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>New</Button></Tooltip>
              : <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Edit</Button>
            }
            {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Delete</Button>}
            <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
          </Box>
          {selectedRow && <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>Selected: <strong>{selectedRow.subCategoryName}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
        </Paper>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
        </Paper>
      </AccordionDetails>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Application Sub-Category' : 'New Application Sub-Category'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? (
              <>
                <TextField label='Application' size='small' fullWidth value={form.applicationName} disabled />
                <TextField label='Application Category' size='small' fullWidth value={form.applicationCategoryName} disabled />
              </>
            ) : (
              <>
                <FormControl size='small' fullWidth required>
                  <InputLabel>Application</InputLabel>
                  <Select label='Application' value={form.applicationId} onChange={(e) => handleApplicationChange(e.target.value)}>
                    {applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size='small' fullWidth required disabled={!form.applicationId}>
                  <InputLabel>Application Category</InputLabel>
                  <Select label='Application Category' value={form.applicationCategoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
                    {filteredCategories.map((c) => <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}
            <TextField label='Application Sub-Category' size='small' fullWidth required value={form.subCategoryName} onChange={(e) => setForm((f) => ({ ...f, subCategoryName: e.target.value }))} />
            <TextField label='Description' size='small' fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.subCategoryName.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Application Sub-Category</DialogTitle>
        <DialogContent><Typography variant='body2'>Are you sure you want to delete <strong>{selectedRow?.subCategoryName}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Application Number Sequences
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_APP_NUMSEQ_FORM = { applicationId: '', applicationName: '', ticketTypeId: 0, ticketTypeName: '', numberSequenceCode: '', numericCharLength: 0, numberSequenceFormat: '' };

const ApplicationNumberSequences = () => {
  const { classes } = useStyles();
  const { categorization: apiCat, saveSection } = useConfiguration();
  const { data: ticketTypesData } = useGetTicketTypeQuery();

  const activeTicketTypes = ticketTypesData?.filter((t) => t.isActive) ?? [];
  const applications = apiCat?.applications ?? [];

  const [rows, setRows] = useState<IConfigApplicationNumberSequence[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigApplicationNumberSequence | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_APP_NUMSEQ_FORM);

  useEffect(() => { if (apiCat?.applicationNumberSequences) setRows(apiCat.applicationNumberSequences); }, [apiCat]);

  useEffect(() => {
    if (dialogOpen) setForm(editingRow
      ? { applicationId: editingRow.applicationId, applicationName: editingRow.applicationName, ticketTypeId: editingRow.ticketTypeId, ticketTypeName: editingRow.ticketTypeName, numberSequenceCode: editingRow.numberSequenceCode, numericCharLength: editingRow.numericCharLength, numberSequenceFormat: editingRow.numberSequenceFormat }
      : EMPTY_APP_NUMSEQ_FORM);
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.applicationName.toLowerCase().includes(search.toLowerCase()) || r.ticketTypeName.toLowerCase().includes(search.toLowerCase()) || r.numberSequenceCode.toLowerCase().includes(search.toLowerCase()) || r.numberSequenceFormat.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const saveRows = (next: IConfigApplicationNumberSequence[]) => {
    setRows(next);
    saveSection('categorization', { businessCategories: apiCat?.businessCategories ?? [], serviceLines: apiCat?.serviceLines ?? [], applications: apiCat?.applications ?? [], queues: apiCat?.queues ?? [], applicationCategories: apiCat?.applicationCategories ?? [], applicationSubCategories: apiCat?.applicationSubCategories ?? [], applicationNumberSequences: next });
  };

  const handleApplicationChange = (id: string) => {
    const app = applications.find((a) => a.id === id);
    setForm((f) => ({ ...f, applicationId: id, applicationName: app?.name ?? '' }));
  };

  const handleTicketTypeChange = (id: number) => {
    const tt = activeTicketTypes.find((t) => t.id === id);
    setForm((f) => ({ ...f, ticketTypeId: id, ticketTypeName: tt?.displayName ?? tt?.name ?? '' }));
  };

  const handleSubmit = () => {
    if (!form.numberSequenceCode.trim()) return;
    if (editingRow) {
      saveRows(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigApplicationNumberSequence = { id: `appnumseq_${Date.now()}`, ...form };
      saveRows([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false); setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    saveRows(rows.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null); setDeleteOpen(false);
  };

  const columns: Column<IConfigApplicationNumberSequence>[] = [
    { id: 'applicationName', label: 'Application', minWidth: 140, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'ticketTypeName', label: 'Ticket Type', minWidth: 130, format: (v): React.ReactNode => <Typography variant='body2' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'numberSequenceCode', label: 'Number Sequence Code', minWidth: 170, format: (v): React.ReactNode => <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>{String(v || '—')}</Typography> },
    { id: 'numericCharLength', label: 'Numeric Char Length', minWidth: 150, format: (v): React.ReactNode => <Typography variant='body2' fontFamily='monospace' fontWeight={500} fontSize='0.82rem'>{String(v)}</Typography> },
    { id: 'numberSequenceFormat', label: 'Number Sequence Format', minWidth: 180, format: (v): React.ReactNode => <Typography variant='body2' fontFamily='monospace' fontWeight={500} fontSize='0.82rem'>{String(v || '—')}</Typography> },
  ];

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <NumbersIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Application Specific Number Sequence</Typography>
            <Typography className={classes.sectionSubtitle}>Manage number sequences per application and ticket type</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons}>
            {!selectedRow
              ? <Tooltip title='Add a new number sequence'><Button size='small' variant='contained' startIcon={<AddIcon />} onClick={() => { setEditingRow(null); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>New</Button></Tooltip>
              : <Button size='small' variant='contained' startIcon={<EditIcon />} onClick={() => { setEditingRow(selectedRow); setDialogOpen(true); }} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Edit</Button>
            }
            {selectedRow && <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>Delete</Button>}
            <TextField size='small' placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} className={classes.tableSearchField} sx={{ ml: { xs: 0, sm: 'auto' } }} slotProps={{ input: { endAdornment: <InputAdornment position='end'><SearchIcon /></InputAdornment> } }} />
          </Box>
          {selectedRow && <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>Selected: <strong>{selectedRow.numberSequenceCode}</strong>&nbsp;·&nbsp;<Link component='button' variant='caption' onClick={() => setSelectedId(null)}>Clear</Link></Typography>}
        </Paper>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filtered} rowKey='id' searchable={false} initialRowsPerPage={10} onRowClick={(row) => setSelectedId(selectedId === row.id ? null : row.id)} activeRowKey={selectedId ?? undefined} />
        </Paper>
      </AccordionDetails>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingRow(null); }} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRow ? 'Edit Number Sequence' : 'New Number Sequence'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            {editingRow ? (
              <>
                <TextField label='Application' size='small' fullWidth value={form.applicationName} disabled />
                <TextField label='Ticket Type' size='small' fullWidth value={form.ticketTypeName} disabled />
              </>
            ) : (
              <>
                <FormControl size='small' fullWidth required>
                  <InputLabel>Application</InputLabel>
                  <Select label='Application' value={form.applicationId} onChange={(e) => handleApplicationChange(e.target.value)}>
                    {applications.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size='small' fullWidth required>
                  <InputLabel>Ticket Type</InputLabel>
                  <Select label='Ticket Type' value={form.ticketTypeId || ''} onChange={(e) => handleTicketTypeChange(Number(e.target.value))}>
                    {activeTicketTypes.map((tt) => <MenuItem key={tt.id} value={tt.id}>{tt.displayName || tt.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}
            <TextField label='Number Sequence Code' size='small' fullWidth required value={form.numberSequenceCode} onChange={(e) => setForm((f) => ({ ...f, numberSequenceCode: e.target.value }))} />
            <TextField label='Numeric Char Length' type='number' size='small' fullWidth value={form.numericCharLength} onChange={(e) => { const v = parseInt(e.target.value, 10); setForm((f) => ({ ...f, numericCharLength: isNaN(v) || v < 0 ? 0 : v })); }} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label='Number Sequence Format' size='small' fullWidth value={form.numberSequenceFormat} onChange={(e) => setForm((f) => ({ ...f, numberSequenceFormat: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setEditingRow(null); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!form.numberSequenceCode.trim()} sx={{ textTransform: 'none', borderRadius: 2 }}>{editingRow ? 'Save Changes' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Number Sequence</DialogTitle>
        <DialogContent><Typography variant='body2'>Are you sure you want to delete the number sequence <strong>{selectedRow?.numberSequenceCode}</strong>? This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const Categorization = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <BusinessCategories />
      <ServiceLines />
      <Applications />
      <ApplicationQueues />
      <ApplicationCategories />
      <ApplicationSubCategories />
      <ApplicationNumberSequences />
    </Box>
  );
};

export default Categorization;
