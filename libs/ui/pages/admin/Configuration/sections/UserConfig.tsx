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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from '../styles';
import { useConfiguration } from '../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../dialogs/ConfigDialogs';

const ACCENT = '#be185d';

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Shared panel header ────────────────────────────────────────────────────────

const PanelHeader = ({
  icon,
  title,
  count,
  countLabel,
  onBack,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countLabel: string;
  onBack: () => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      bgcolor: alpha(ACCENT, 0.08),
      border: '1px solid',
      borderColor: alpha(ACCENT, 0.25),
      borderRadius: '10px 10px 0 0',
      borderBottom: 'none',
    }}
  >
    <Button
      size='small'
      variant='text'
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{
        textTransform: 'none',
        color: ACCENT,
        fontWeight: 600,
        minWidth: 0,
        px: 1,
        py: 0.25,
        '&:hover': { bgcolor: alpha(ACCENT, 0.1) },
      }}
    >
      Back
    </Button>
    <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(ACCENT, 0.3) }} />
    <Box sx={{ color: ACCENT, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ACCENT }}>{title}</Typography>
    <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
      {count} {countLabel}
      {count !== 1 ? 's' : ''}
    </Typography>
  </Box>
);

// ── Location picker bar ────────────────────────────────────────────────────────

const LocationPicker = ({
  locations,
  value,
  onChange,
}: {
  locations: IConfigWorkLocation[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      bgcolor: alpha(ACCENT, 0.04),
      border: '1px solid',
      borderColor: alpha(ACCENT, 0.2),
      borderTop: 'none',
      borderBottom: 'none',
    }}
  >
    <Typography
      variant='caption'
      fontWeight={600}
      color='text.secondary'
      sx={{ whiteSpace: 'nowrap' }}
    >
      Work Location:
    </Typography>
    <FormControl size='small' sx={{ minWidth: 260 }}>
      <Select
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ fontSize: '0.82rem', '& .MuiSelect-select': { py: 0.6 } }}
        renderValue={(v) => {
          if (!v)
            return (
              <Typography component='span' sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>
                — select a location —
              </Typography>
            );
          return locations.find((l) => l.id === v)?.name ?? v;
        }}
      >
        {locations.length === 0 ? (
          <MenuItem disabled value=''>
            <em>No work locations</em>
          </MenuItem>
        ) : (
          locations.map((l) => (
            <MenuItem key={l.id} value={l.id} sx={{ fontSize: '0.82rem' }}>
              {l.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  </Box>
);

// ── Working Times panel ────────────────────────────────────────────────────────

const EMPTY_WT = { workLocationId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' };

interface WorkingTimesPanelProps {
  locations: IConfigWorkLocation[];
  workingTimes: IConfigWorkLocationWorkingTime[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (times: IConfigWorkLocationWorkingTime[]) => void;
}

const WorkingTimesPanel = ({
  locations,
  workingTimes,
  defaultLocationId,
  onBack,
  onSave,
}: WorkingTimesPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_WT>({
    ...EMPTY_WT,
    workLocationId: defaultLocationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              dayOfWeek: editingRow.dayOfWeek,
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
            }
          : { ...EMPTY_WT, workLocationId: defaultLocationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = workingTimes.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? workingTimes.filter(
        (r) =>
          r.workLocationName.toLowerCase().includes(search.toLowerCase()) ||
          r.dayOfWeek.toLowerCase().includes(search.toLowerCase()),
      )
    : workingTimes;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.dayOfWeek) return;
    const loc = locations.find((l) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        workingTimes.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationWorkingTime = {
        id: `wt_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...workingTimes, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(workingTimes.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigWorkLocationWorkingTime>[] = [
    {
      id: 'workLocationName',
      label: 'Work Location',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha(ACCENT, 0.1),
            color: ACCENT,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'dayOfWeek',
      label: 'Day of Week',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'endTime',
      label: 'End Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        icon={<AccessTimeIcon sx={{ fontSize: '1.1rem' }} />}
        title='Working Times'
        count={workingTimes.length}
        countLabel='entry'
        onBack={onBack}
      />
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
            <Tooltip title='Add working time'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
              sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.dayOfWeek}</strong> · {selectedRow.workLocationName}
            &nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(ACCENT, 0.25),
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
        accent={ACCENT}
        title='Working Time'
        subtitle='Configure working hours for a day and location'
        submitDisabled={!form.workLocationId}
        maxWidth='xs'
      >
        {editingRow ? (
          <TextField
            label='Work Location'
            size='small'
            fullWidth
            value={editingRow.workLocationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Work Location</InputLabel>
            <Select
              label='Work Location'
              value={form.workLocationId}
              onChange={(e) => setForm((f) => ({ ...f, workLocationId: e.target.value }))}
            >
              {locations.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl size='small' fullWidth required>
          <InputLabel>Day of Week</InputLabel>
          <Select
            label='Day of Week'
            value={form.dayOfWeek}
            onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
          >
            {DAY_OPTIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Start Time'
            type='time'
            size='small'
            fullWidth
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='End Time'
            type='time'
            size='small'
            fullWidth
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Time'
        itemName={
          selectedRow ? `${selectedRow.dayOfWeek} · ${selectedRow.workLocationName}` : undefined
        }
      />
    </Box>
  );
};

// ── Shift Management panel ─────────────────────────────────────────────────────

const EMPTY_SHIFT = {
  workLocationId: '',
  shiftName: '',
  description: '',
  startTime: '09:00',
  endTime: '17:00',
};

interface ShiftsPanelProps {
  locations: IConfigWorkLocation[];
  shifts: IConfigWorkLocationShift[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (shifts: IConfigWorkLocationShift[]) => void;
}

const ShiftsPanel = ({
  locations,
  shifts,
  defaultLocationId,
  onBack,
  onSave,
}: ShiftsPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationShift | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_SHIFT>({
    ...EMPTY_SHIFT,
    workLocationId: defaultLocationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              shiftName: editingRow.shiftName,
              description: editingRow.description,
              startTime: editingRow.startTime,
              endTime: editingRow.endTime,
            }
          : { ...EMPTY_SHIFT, workLocationId: defaultLocationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = shifts.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? shifts.filter(
        (r) =>
          r.workLocationName.toLowerCase().includes(search.toLowerCase()) ||
          r.shiftName.toLowerCase().includes(search.toLowerCase()),
      )
    : shifts;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.shiftName.trim()) return;
    const loc = locations.find((l) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        shifts.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationShift = {
        id: `sh_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...shifts, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(shifts.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigWorkLocationShift>[] = [
    {
      id: 'workLocationName',
      label: 'Work Location',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha(ACCENT, 0.1),
            color: ACCENT,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'shiftName',
      label: 'Shift Name',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'endTime',
      label: 'End Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontFamily='monospace' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        icon={<WatchLaterIcon sx={{ fontSize: '1.1rem' }} />}
        title='Shift Management'
        count={shifts.length}
        countLabel='shift'
        onBack={onBack}
      />
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
            <Tooltip title='Add shift'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
              sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.shiftName}</strong> · {selectedRow.workLocationName}
            &nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(ACCENT, 0.25),
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
        icon={<WatchLaterIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT}
        title='Shift'
        subtitle='Define shift hours and assign to a work location'
        submitDisabled={!form.workLocationId || !form.shiftName.trim()}
        maxWidth='sm'
      >
        {editingRow ? (
          <TextField
            label='Work Location'
            size='small'
            fullWidth
            value={editingRow.workLocationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Work Location</InputLabel>
            <Select
              label='Work Location'
              value={form.workLocationId}
              onChange={(e) => setForm((f) => ({ ...f, workLocationId: e.target.value }))}
            >
              {locations.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Shift Name'
          size='small'
          fullWidth
          required
          value={form.shiftName}
          onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Start Time'
            type='time'
            size='small'
            fullWidth
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='End Time'
            type='time'
            size='small'
            fullWidth
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Shift'
        itemName={selectedRow?.shiftName}
      />
    </Box>
  );
};

// ── Associated Consultant Profiles panel ───────────────────────────────────────

const EMPTY_ASSOC = { workLocationId: '', consultantProfileId: '', consultantName: '' };

interface AssocProfilesPanelProps {
  locations: IConfigWorkLocation[];
  associatedProfiles: IConfigWorkLocationAssociatedProfile[];
  defaultLocationId: string | null;
  onBack: () => void;
  onSave: (profiles: IConfigWorkLocationAssociatedProfile[]) => void;
}

const AssocProfilesPanel = ({
  locations,
  associatedProfiles,
  defaultLocationId,
  onBack,
  onSave,
}: AssocProfilesPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationAssociatedProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY_ASSOC>({
    ...EMPTY_ASSOC,
    workLocationId: defaultLocationId ?? '',
  });

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              consultantProfileId: editingRow.consultantProfileId,
              consultantName: editingRow.consultantName,
            }
          : { ...EMPTY_ASSOC, workLocationId: defaultLocationId ?? '' },
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = associatedProfiles.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? associatedProfiles.filter(
        (r) =>
          r.workLocationName.toLowerCase().includes(search.toLowerCase()) ||
          r.consultantName.toLowerCase().includes(search.toLowerCase()),
      )
    : associatedProfiles;

  const handleSubmit = () => {
    if (!form.workLocationId || !form.consultantName.trim()) return;
    const loc = locations.find((l) => l.id === form.workLocationId);
    if (editingRow) {
      onSave(
        associatedProfiles.map((r) =>
          r.id === editingRow.id
            ? { ...editingRow, ...form, workLocationName: loc?.name ?? editingRow.workLocationName }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationAssociatedProfile = {
        id: `ap_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        ...form,
      };
      onSave([...associatedProfiles, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };
  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(associatedProfiles.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigWorkLocationAssociatedProfile>[] = [
    {
      id: 'workLocationName',
      label: 'Work Location',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha(ACCENT, 0.1),
            color: ACCENT,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'consultantName',
      label: 'Consultant Profile',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'consultantProfileId',
      label: 'Profile ID',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontFamily='monospace'
          fontSize='0.78rem'
        >
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        icon={<GroupIcon sx={{ fontSize: '1.1rem' }} />}
        title='Associated Consultant Profiles'
        count={associatedProfiles.length}
        countLabel='profile'
        onBack={onBack}
      />
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
            <Tooltip title='Associate a consultant profile'>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
              sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9d174d' } }}
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
          <TextField
            size='small'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ml: { xs: 0, sm: 'auto' }, width: 210 }}
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
        {selectedRow && (
          <Typography variant='caption' color='text.secondary'>
            Selected: <strong>{selectedRow.consultantName}</strong>&nbsp;·&nbsp;
            <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
              Clear
            </Link>
          </Typography>
        )}
      </Paper>
      <Paper
        elevation={1}
        sx={{
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha(ACCENT, 0.25),
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
        icon={<GroupIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT}
        title='Associated Consultant Profile'
        subtitle='Link a consultant profile to a work location'
        submitDisabled={!form.workLocationId || !form.consultantName.trim()}
        maxWidth='sm'
      >
        {editingRow ? (
          <TextField
            label='Work Location'
            size='small'
            fullWidth
            value={editingRow.workLocationName}
            disabled
          />
        ) : (
          <FormControl size='small' fullWidth required>
            <InputLabel>Work Location</InputLabel>
            <Select
              label='Work Location'
              value={form.workLocationId}
              onChange={(e) => setForm((f) => ({ ...f, workLocationId: e.target.value }))}
            >
              {locations.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Consultant Name'
          size='small'
          fullWidth
          required
          value={form.consultantName}
          onChange={(e) => setForm((f) => ({ ...f, consultantName: e.target.value }))}
        />
        <TextField
          label='Consultant Profile ID'
          size='small'
          fullWidth
          value={form.consultantProfileId}
          onChange={(e) => setForm((f) => ({ ...f, consultantProfileId: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Associated Consultant Profile'
        itemName={selectedRow?.consultantName}
      />
    </Box>
  );
};

// ── Work Locations section ─────────────────────────────────────────────────────

const EMPTY_WL_FORM = {
  name: '',
  description: '',
  country: '',
  state: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  language: 'en',
  timezone: 'UTC',
  workCalendar: '',
};

const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MMM DD, YYYY'];
const TIME_FORMATS = ['12h', '24h'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
];

type WLActivePanel = 'none' | 'workingTimes' | 'associatedProfiles' | 'shifts';

const WorkLocations = () => {
  const { classes } = useStyles();
  const { userConfig: apiUC, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_WL_FORM);
  const [activePanel, setActivePanel] = useState<WLActivePanel>('none');

  useEffect(() => {
    if (apiUC?.workLocations) setRows(apiUC.workLocations);
  }, [apiUC]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              name: editingRow.name,
              description: editingRow.description,
              country: editingRow.country,
              state: editingRow.state,
              dateFormat: editingRow.dateFormat,
              timeFormat: editingRow.timeFormat,
              language: editingRow.language,
              timezone: editingRow.timezone,
              workCalendar: editingRow.workCalendar,
            }
          : EMPTY_WL_FORM,
      );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.country.toLowerCase().includes(search.toLowerCase()) ||
          r.state.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (
    locs: IConfigWorkLocation[],
    wt = apiUC?.workingTimes ?? [],
    sh = apiUC?.shifts ?? [],
    ap = apiUC?.associatedProfiles ?? [],
  ) => {
    setRows(locs);
    saveSection('userConfig', {
      workLocations: locs,
      workingTimes: wt,
      shifts: sh,
      associatedProfiles: ap,
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...form } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocation = { id: `wl_${Date.now()}`, ...form };
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
  const togglePanel = (panel: WLActivePanel) =>
    setActivePanel((p) => (p === panel ? 'none' : panel));
  const panelActive = activePanel !== 'none';

  const columns: Column<IConfigWorkLocation>[] = [
    {
      id: 'name',
      label: 'Work Location',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'country',
      label: 'Country',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'state',
      label: 'State',
      minWidth: 110,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'dateFormat',
      label: 'Date Format',
      minWidth: 115,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 20,
            bgcolor: alpha('#0369a1', 0.1),
            color: '#0369a1',
          }}
        />
      ),
    },
    {
      id: 'timeFormat',
      label: 'Time Format',
      minWidth: 105,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 20,
            bgcolor: alpha('#0f766e', 0.1),
            color: '#0f766e',
          }}
        />
      ),
    },
    {
      id: 'language',
      label: 'Language',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {LANGUAGES.find((l) => l.value === v)?.label ?? String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'timezone',
      label: 'Time Zone',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontFamily='monospace'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'workCalendar',
      label: 'Work Calendar',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocationOnIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Work Location</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define work locations and configure their regional, time and calendar settings
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {/* Toolbar */}
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {!panelActive &&
              (!selectedRow ? (
                <Tooltip title='Add a new work location'>
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingRow(null);
                      setDialogOpen(true);
                    }}
                    sx={{ textTransform: 'none' }}
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
                    sx={{ textTransform: 'none' }}
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
                  <Divider
                    orientation='vertical'
                    flexItem
                    className={classes.toolbarDivider}
                    sx={{ mx: 0.5 }}
                  />
                </>
              ))}
            <Button
              size='small'
              startIcon={<AccessTimeIcon />}
              variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('workingTimes')}
              sx={{ textTransform: 'none' }}
            >
              Working Times
            </Button>
            <Button
              size='small'
              startIcon={<GroupIcon />}
              variant={activePanel === 'associatedProfiles' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('associatedProfiles')}
              sx={{ textTransform: 'none' }}
            >
              Associated Consultant Profiles
            </Button>
            <Button
              size='small'
              startIcon={<WatchLaterIcon />}
              variant={activePanel === 'shifts' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => togglePanel('shifts')}
              sx={{ textTransform: 'none' }}
            >
              Shift Management
            </Button>
            {!panelActive && (
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
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Box>
          {!panelActive && selectedRow && (
            <Typography variant='caption' color='text.secondary' className={classes.selectionInfo}>
              Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
              <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                Clear
              </Link>
            </Typography>
          )}
        </Paper>

        {/* Main table */}
        {!panelActive && (
          <Paper elevation={1} className={classes.tablePaper}>
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
        )}

        {/* Sub-panels */}
        {activePanel === 'workingTimes' && (
          <WorkingTimesPanel
            locations={rows}
            workingTimes={apiUC?.workingTimes ?? []}
            defaultLocationId={selectedId}
            onBack={() => setActivePanel('none')}
            onSave={(wt) => save(rows, wt)}
          />
        )}
        {activePanel === 'associatedProfiles' && (
          <AssocProfilesPanel
            locations={rows}
            associatedProfiles={apiUC?.associatedProfiles ?? []}
            defaultLocationId={selectedId}
            onBack={() => setActivePanel('none')}
            onSave={(ap) => save(rows, apiUC?.workingTimes ?? [], apiUC?.shifts ?? [], ap)}
          />
        )}
        {activePanel === 'shifts' && (
          <ShiftsPanel
            locations={rows}
            shifts={apiUC?.shifts ?? []}
            defaultLocationId={selectedId}
            onBack={() => setActivePanel('none')}
            onSave={(sh) => save(rows, apiUC?.workingTimes ?? [], sh)}
          />
        )}
      </AccordionDetails>

      {/* New / Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<LocationOnIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT}
        title='Work Location'
        subtitle='Define work location regional and time settings'
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Work Location Name'
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='Country'
            size='small'
            fullWidth
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
          <TextField
            label='State / Province'
            size='small'
            fullWidth
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              label='Date Format'
              value={form.dateFormat}
              onChange={(e) => setForm((f) => ({ ...f, dateFormat: e.target.value }))}
            >
              {DATE_FORMATS.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' fullWidth>
            <InputLabel>Time Format</InputLabel>
            <Select
              label='Time Format'
              value={form.timeFormat}
              onChange={(e) => setForm((f) => ({ ...f, timeFormat: e.target.value }))}
            >
              {TIME_FORMATS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              label='Language'
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            >
              {LANGUAGES.map((l) => (
                <MenuItem key={l.value} value={l.value}>
                  {l.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Time Zone'
            size='small'
            fullWidth
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            placeholder='e.g. Asia/Kolkata'
          />
        </Box>
        <TextField
          label='Work Calendar'
          size='small'
          fullWidth
          value={form.workCalendar}
          onChange={(e) => setForm((f) => ({ ...f, workCalendar: e.target.value }))}
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Work Location'
        itemName={selectedRow?.name}
      />
    </Accordion>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const UserConfig = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.container}>
      <WorkLocations />
    </Box>
  );
};

export default UserConfig;
