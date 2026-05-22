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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  alpha,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LinkIcon from '@mui/icons-material/Link';
import {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
  IConfigWorkLocationAssociation,
} from '@serviceops/interfaces';
import {
  AssocProfilesPanelProps,
  NominatimResult,
  searchLocations,
  ShiftsPanelProps,
  WorkingTimesPanelProps,
  WorkLocationAssociationsPanelProps,
  LanguageOption,
  searchLanguages,
  TimezoneOption,
  searchTimezones,
  COMMON_TIMEZONES,
} from '../../util';
import { useStyles } from '../../styles';
import {
  ConfigDeleteDialog,
  ConfigFormDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';

const ACCENT_WL = '#0369a1';
const ACCENT_WT = '#0369a1';
const ACCENT_AP = '#0369a1';
const ACCENT_SM = '#0369a1';

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Shared panel header ────────────────────────────────────────────────────────

const PanelHeader = ({
  icon,
  title,
  count,
  countLabel,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countLabel: string;
  accent: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      bgcolor: alpha(accent, 0.08),
      border: '1px solid',
      borderColor: alpha(accent, 0.25),
      borderRadius: '10px 10px 0 0',
      borderBottom: 'none',
    }}
  >
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: accent }}>{title}</Typography>
    <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
      {count} {countLabel}
      {count !== 1 ? 's' : ''}
    </Typography>
  </Box>
);

// ── Working Times panel ────────────────────────────────────────────────────────

const EMPTY_WT = { workLocationId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' };

const WorkingTimesPanel = ({
  locations,
  workingTimes,
  defaultLocationId,
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
            bgcolor: alpha(ACCENT_WT, 0.1),
            color: ACCENT_WT,
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
        accent={ACCENT_WT}
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
            <>
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
            </>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': {
                  borderColor: '#2d5ebb',
                  bgcolor: alpha('#2d5ebb', 0.08),
                },
              }}
              onClick={() => setSelectedId(null)}
            >
              Clear
            </Button>
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
          borderColor: alpha(ACCENT_WT, 0.25),
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
        accent={ACCENT_WT}
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

const ShiftsPanel = ({ locations, shifts, defaultLocationId, onSave }: ShiftsPanelProps) => {
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
            bgcolor: alpha(ACCENT_SM, 0.1),
            color: ACCENT_SM,
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
        accent={ACCENT_SM}
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
            <>
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
            </>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': {
                  borderColor: '#2d5ebb',
                  bgcolor: alpha('#2d5ebb', 0.08),
                },
              }}
              onClick={() => setSelectedId(null)}
            >
              Clear
            </Button>
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
          borderColor: alpha(ACCENT_SM, 0.25),
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
        accent={ACCENT_SM}
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

const AssocProfilesPanel = ({
  locations,
  associatedProfiles,
  defaultLocationId,
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
            bgcolor: alpha(ACCENT_AP, 0.1),
            color: ACCENT_AP,
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
        accent={ACCENT_AP}
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
          borderColor: alpha(ACCENT_AP, 0.25),
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
        accent={ACCENT_AP}
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

// ── Work Location Associations panel ─────────────────────────────────────────

const EMPTY_ASSOC_FORM = {
  workLocationId: '',
  associatedLocationId: '',
  description: '',
};

const WorkLocationAssociationsPanel = ({
  locations,
  associations,
  defaultLocationId,
  onSave,
}: WorkLocationAssociationsPanelProps) => {
  const { classes } = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkLocationAssociation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_ASSOC_FORM);

  // Associated location search state
  const [associatedLocationSuggestions, setAssociatedLocationSuggestions] = useState<
    NominatimResult[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (dialogOpen) {
      setForm(
        editingRow
          ? {
              workLocationId: editingRow.workLocationId,
              associatedLocationId: editingRow.associatedLocationId,
              description: editingRow.description,
            }
          : { ...EMPTY_ASSOC_FORM, workLocationId: defaultLocationId ?? '' },
      );
      setAssociatedLocationSuggestions([]);
    }
  }, [dialogOpen, editingRow]);

  const selectedRow = associations.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? associations.filter(
        (r) =>
          r.workLocationName.toLowerCase().includes(search.toLowerCase()) ||
          r.associatedLocationName.toLowerCase().includes(search.toLowerCase()),
      )
    : associations;

  const handleAssociatedLocationSearch = async (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    if (query.length < 2) {
      setAssociatedLocationSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchLocations(query);
      setAssociatedLocationSuggestions(results.slice(0, 5));
      setSearchLoading(false);
    }, 300);

    setSearchTimeout(timeoutId);
  };

  const handleSubmit = () => {
    if (!form.workLocationId || !form.associatedLocationId.trim()) return;
    const loc = locations.find((l) => l.id === form.workLocationId);
    const assocLoc = locations.find((l) => l.id === form.associatedLocationId);
    if (editingRow) {
      onSave(
        associations.map((r) =>
          r.id === editingRow.id
            ? {
                ...editingRow,
                ...form,
                workLocationName: loc?.name ?? editingRow.workLocationName,
                associatedLocationName: assocLoc?.name ?? editingRow.associatedLocationName,
              }
            : r,
        ),
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkLocationAssociation = {
        id: `wla_${Date.now()}`,
        workLocationName: loc?.name ?? '',
        associatedLocationName: assocLoc?.name ?? '',
        ...form,
      };
      onSave([...associations, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(associations.filter((r) => r.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const columns: Column<IConfigWorkLocationAssociation>[] = [
    {
      id: 'workLocationName',
      label: 'Work Location',
      minWidth: 150,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            bgcolor: alpha(ACCENT_WL, 0.1),
            color: ACCENT_WL,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 20,
          }}
        />
      ),
    },
    {
      id: 'associatedLocationName',
      label: 'Associated Location',
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
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' color='text.secondary' fontSize='0.8rem' noWrap>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <PanelHeader
        icon={<LinkIcon sx={{ fontSize: '1.1rem' }} />}
        title='Work Location Associations'
        count={associations.length}
        countLabel='association'
        accent={ACCENT_WL}
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
            <Tooltip title='Add a work location association'>
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
            <>
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
            </>
          )}
          {selectedRow && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<ClearIcon />}
              sx={{
                textTransform: 'none',
                borderColor: '#2d5ebb',
                color: '#2d5ebb',
                '&:hover': {
                  borderColor: '#2d5ebb',
                  bgcolor: alpha('#2d5ebb', 0.08),
                },
              }}
              onClick={() => setSelectedId(null)}
            >
              Clear
            </Button>
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
          borderColor: alpha('#6366f1', 0.25),
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
        icon={<LinkIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_WL}
        title='Work Location Association'
        subtitle='Link a work location to another location'
        submitDisabled={!form.workLocationId || !form.associatedLocationId.trim()}
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
        <Box sx={{ position: 'relative' }}>
          <FormControl size='small' fullWidth required>
            <InputLabel>Associated Location</InputLabel>
            <Select
              label='Associated Location'
              value={form.associatedLocationId}
              onChange={(e) => setForm((f) => ({ ...f, associatedLocationId: e.target.value }))}
              renderValue={(value) => {
                const loc = locations.find((l) => l.id === value);
                return loc?.name ?? value;
              }}
            >
              {locations
                .filter((l) => l.id !== form.workLocationId)
                .map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Work Location Association'
        itemName={selectedRow?.associatedLocationName}
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
  city: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  language: 'en',
  timezone: 'UTC',
  workCalendar: '',
};

const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MMM DD, YYYY'];
const TIME_FORMATS = ['12h', '24h'];

type WLActivePanel =
  | 'none'
  | 'workingTimes'
  | 'associatedProfiles'
  | 'shifts'
  | 'workLocationAssociations';

export const WorkLocations = () => {
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

  // Location search state
  const [countrySuggestions, setCountrySuggestions] = useState<NominatimResult[]>([]);
  const [stateSuggestions, setStateSuggestions] = useState<NominatimResult[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Language search state
  const [languageSuggestions, setLanguageSuggestions] = useState<LanguageOption[]>([]);
  const [languageSearchLoading, setLanguageSearchLoading] = useState(false);
  const [languageSearchOpen, setLanguageSearchOpen] = useState(false);

  // Store selected city coordinates for timezone
  const [selectedCityCoords, setSelectedCityCoords] = useState<{ lat: string; lon: string } | null>(
    null,
  );

  // Location name suggestions (using Nominatim/Photon API - same as city)
  const [locationNameSuggestions, setLocationNameSuggestions] = useState<NominatimResult[]>([]);
  const [locationNameLoading, setLocationNameLoading] = useState(false);
  const [locationNameOpen, setLocationNameOpen] = useState(false);
  const [locationNameSearchTimeout, setLocationNameSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [locationNameAbortController, setLocationNameAbortController] =
    useState<AbortController | null>(null);

  // Debounced search for locations
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchAbortController, setSearchAbortController] = useState<AbortController | null>(null);

  const handleLocationSearch = async (query: string, type: 'country' | 'state' | 'city') => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    // Cancel previous request
    if (searchAbortController) {
      searchAbortController.abort();
    }

    if (query.length < 2) {
      if (type === 'country') setCountrySuggestions([]);
      else if (type === 'state') setStateSuggestions([]);
      else setCitySuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setSearchAbortController(controller);
      setSearchLoading(true);

      const results = await searchLocations(query, controller.signal);

      if (type === 'country') {
        setCountrySuggestions(results.slice(0, 10));
      } else if (type === 'state') {
        setStateSuggestions(results.slice(0, 5));
      } else {
        setCitySuggestions(results.slice(0, 5));
      }
      setSearchLoading(false);
    }, 300);

    setSearchTimeout(timeoutId);
  };

  // Language search handler
  const [languageSearchTimeout, setLanguageSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [languageAbortController, setLanguageAbortController] = useState<AbortController | null>(
    null,
  );

  const handleLanguageSearch = async (query: string) => {
    if (languageSearchTimeout) {
      clearTimeout(languageSearchTimeout);
      setLanguageSearchTimeout(null);
    }

    if (languageAbortController) {
      languageAbortController.abort();
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setLanguageAbortController(controller);
      setLanguageSearchLoading(true);

      const results = await searchLanguages(query, controller.signal);
      setLanguageSuggestions(results.slice(0, 10));
      setLanguageSearchLoading(false);
    }, 300);

    setLanguageSearchTimeout(timeoutId);
  };

  const handleLocationNameSearch = async (query: string) => {
    if (locationNameSearchTimeout) {
      clearTimeout(locationNameSearchTimeout);
      setLocationNameSearchTimeout(null);
    }

    if (locationNameAbortController) {
      locationNameAbortController.abort();
    }

    if (query.length < 2) {
      setLocationNameSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setLocationNameAbortController(controller);
      setLocationNameLoading(true);

      const results = await searchLocations(query, controller.signal);
      setLocationNameSuggestions(results.slice(0, 5));
      setLocationNameLoading(false);
    }, 300);

    setLocationNameSearchTimeout(timeoutId);
  };

  // Timezone search state
  const [timezoneSuggestions, setTimezoneSuggestions] = useState<TimezoneOption[]>([]);
  const [timezoneSearchLoading, setTimezoneSearchLoading] = useState(false);
  const [timezoneSearchOpen, setTimezoneSearchOpen] = useState(false);
  const [timezoneSearchTimeout, setTimezoneSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [timezoneAbortController, setTimezoneAbortController] = useState<AbortController | null>(
    null,
  );

  const handleTimezoneSearch = async (query: string) => {
    if (timezoneSearchTimeout) {
      clearTimeout(timezoneSearchTimeout);
      setTimezoneSearchTimeout(null);
    }

    if (timezoneAbortController) {
      timezoneAbortController.abort();
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      setTimezoneAbortController(controller);
      setTimezoneSearchLoading(true);

      const results = await searchTimezones(query, controller.signal);
      setTimezoneSuggestions(results.slice(0, 10));
      setTimezoneSearchLoading(false);
    }, 300);

    setTimezoneSearchTimeout(timeoutId);
  };

  useEffect(() => {
    if (apiUC?.workLocations) setRows(apiUC.workLocations);
  }, [apiUC]);

  // Auto-fill timezone when city coordinates change
  useEffect(() => {
    if (selectedCityCoords && !form.timezone) {
      const autoFillTimezone = async () => {
        const tz = await import('../../util').then((m) =>
          m.getTimezoneForLocation(selectedCityCoords.lat, selectedCityCoords.lon),
        );
        if (tz) {
          setForm((f) => ({ ...f, timezone: tz.timezone }));
        }
      };
      autoFillTimezone();
    }
  }, [selectedCityCoords]);

  useEffect(() => {
    if (dialogOpen)
      setForm(
        editingRow
          ? {
              name: editingRow.name,
              description: editingRow.description,
              country: editingRow.country,
              state: editingRow.state,
              city: editingRow.city,
              dateFormat: editingRow.dateFormat,
              timeFormat: editingRow.timeFormat,
              language: editingRow.language,
              timezone: editingRow.timezone,
              workCalendar: editingRow.workCalendar,
            }
          : EMPTY_WL_FORM,
      );
  }, [dialogOpen, editingRow]);

  useEffect(() => {
    if (!dialogOpen) {
      setLanguageSuggestions([]);
      setLanguageSearchOpen(false);
      setTimezoneSuggestions([]);
      setTimezoneSearchOpen(false);
      setSelectedCityCoords(null);
      setLocationNameSuggestions([]);
      setLocationNameOpen(false);
      setLocationNameLoading(false);
    }
  }, [dialogOpen]);

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
    wla = apiUC?.workLocationAssociations ?? [],
  ) => {
    setRows(locs);
    saveSection('userConfig', {
      workLocations: locs,
      workingTimes: wt,
      shifts: sh,
      associatedProfiles: ap,
      workLocationAssociations: wla,
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
      id: 'city',
      label: 'City',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem'>
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
      label: 'State / Province',
      minWidth: 130,
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
          {String(v || '—')}
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
              bgcolor: ACCENT_WL,
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
        <Paper variant='outlined' className={classes.actionToolbar}>
          <Box className={classes.toolbarButtons} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              size='small'
              startIcon={<LocationOnIcon />}
              variant={!panelActive ? 'contained' : 'outlined'}
              onClick={() => setActivePanel('none')}
              sx={{
                textTransform: 'none',
                bgcolor: !panelActive ? '#2d5ebb' : undefined,
                color: !panelActive ? '#fff' : '#2d5ebb',
              }}
            >
              Work Locations
            </Button>
            <Button
              size='small'
              startIcon={<AccessTimeIcon />}
              variant={activePanel === 'workingTimes' ? 'contained' : 'outlined'}
              onClick={() => togglePanel('workingTimes')}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'workingTimes' ? '#2d5ebb' : undefined,
                color: activePanel === 'workingTimes' ? '#fff' : '#2d5ebb',
              }}
            >
              Working Times
            </Button>
            <Button
              size='small'
              startIcon={<GroupIcon />}
              variant={activePanel === 'associatedProfiles' ? 'contained' : 'outlined'}
              onClick={() => togglePanel('associatedProfiles')}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'associatedProfiles' ? '#2d5ebb' : undefined,
                color: activePanel === 'associatedProfiles' ? '#fff' : '#2d5ebb',
              }}
            >
              Associated Consultant Profiles
            </Button>
            <Button
              size='small'
              startIcon={<WatchLaterIcon />}
              variant={activePanel === 'shifts' ? 'contained' : 'outlined'}
              onClick={() => togglePanel('shifts')}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'shifts' ? '#2d5ebb' : undefined,
                color: activePanel === 'shifts' ? '#fff' : '#2d5ebb',
              }}
            >
              Shift Management
            </Button>
            <Button
              size='small'
              startIcon={<LinkIcon />}
              variant={activePanel === 'workLocationAssociations' ? 'contained' : 'outlined'}
              onClick={() => togglePanel('workLocationAssociations')}
              sx={{
                textTransform: 'none',
                bgcolor: activePanel === 'workLocationAssociations' ? '#2d5ebb' : undefined,
                color: activePanel === 'workLocationAssociations' ? '#fff' : '#2d5ebb',
              }}
            >
              Work Location Associations
            </Button>
          </Box>
        </Paper>

        {/* Work Locations table */}
        {!panelActive && (
          <Box sx={{ mt: 2 }}>
            <PanelHeader
              icon={<LocationOnIcon sx={{ fontSize: '1.1rem' }} />}
              title='Work Locations'
              count={rows.length}
              countLabel='location'
              accent={ACCENT_WL}
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
                  <Tooltip title='Add a new work location'>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#2d5ebb',
                        '&:hover': { bgcolor: '#2d5ebb' },
                      }}
                      onClick={() => {
                        setEditingRow(null);
                        setDialogOpen(true);
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
                      sx={{ bgcolor: '#2d5ebb', '&:hover': { bgcolor: '#2d5ebb' } }}
                      onClick={() => {
                        setEditingRow(selectedRow);
                        setDialogOpen(true);
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
                      sx={{
                        textTransform: 'none',
                        borderColor: '#2d5ebb',
                        color: '#2d5ebb',
                        '&:hover': {
                          borderColor: '#2d5ebb',
                          bgcolor: alpha('#2d5ebb', 0.08),
                        },
                      }}
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
                borderColor: alpha(ACCENT_WL, 0.25),
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
          </Box>
        )}

        {/* Sub-panels */}
        {activePanel === 'workingTimes' && (
          <WorkingTimesPanel
            locations={rows}
            workingTimes={apiUC?.workingTimes ?? []}
            defaultLocationId={selectedId}
            onSave={(wt) => save(rows, wt)}
          />
        )}
        {activePanel === 'associatedProfiles' && (
          <AssocProfilesPanel
            locations={rows}
            associatedProfiles={apiUC?.associatedProfiles ?? []}
            defaultLocationId={selectedId}
            onSave={(ap) =>
              save(
                rows,
                apiUC?.workingTimes ?? [],
                apiUC?.shifts ?? [],
                ap,
                apiUC?.workLocationAssociations ?? [],
              )
            }
          />
        )}
        {activePanel === 'shifts' && (
          <ShiftsPanel
            locations={rows}
            shifts={apiUC?.shifts ?? []}
            defaultLocationId={selectedId}
            onSave={(sh) =>
              save(
                rows,
                apiUC?.workingTimes ?? [],
                sh,
                apiUC?.associatedProfiles ?? [],
                apiUC?.workLocationAssociations ?? [],
              )
            }
          />
        )}
        {activePanel === 'workLocationAssociations' && (
          <WorkLocationAssociationsPanel
            locations={rows}
            associations={apiUC?.workLocationAssociations ?? []}
            defaultLocationId={selectedId}
            onSave={(wla) =>
              save(
                rows,
                apiUC?.workingTimes ?? [],
                apiUC?.shifts ?? [],
                apiUC?.associatedProfiles ?? [],
                wla,
              )
            }
          />
        )}
      </AccordionDetails>

      {/* New / Edit dialog */}

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
        accent={ACCENT_WL}
        title='Work Location'
        subtitle='Define work location regional and time settings'
        submitDisabled={!form.name.trim()}
        maxWidth='sm'
      >
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='Work Location Name'
            size='small'
            fullWidth
            required
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setLocationNameOpen(true);
              handleLocationNameSearch(e.target.value);
            }}
            onBlur={() => {
              setTimeout(() => setLocationNameOpen(false), 200);
            }}
            placeholder='Type location name...'
            InputProps={{
              endAdornment: locationNameLoading ? (
                <CircularProgress size={14} />
              ) : form.name ? (
                <InputAdornment position='end'>
                  <ClearIcon
                    sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary' }}
                    onClick={() => {
                      setForm((f) => ({ ...f, name: '' }));
                      setLocationNameSuggestions([]);
                    }}
                  />
                </InputAdornment>
              ) : (
                <InputAdornment position='end'>
                  <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          {locationNameSuggestions.length > 0 && locationNameOpen && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: 200,
                overflow: 'auto',
                mt: 0.5,
              }}
            >
              {locationNameSuggestions.map((option) => (
                <Box
                  key={option.place_id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => {
                    setForm((f) => ({ ...f, name: option.name }));
                    setLocationNameSuggestions([]);
                    setLocationNameOpen(false);
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: '1rem', color: ACCENT_WL }} />
                  <Typography variant='body2' fontWeight={600}>
                    {option.name}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
        <TextField
          label='Description'
          size='small'
          fullWidth
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <Box sx={{ position: 'relative' }}>
          <TextField
            label='City'
            size='small'
            fullWidth
            required
            value={form.city}
            onChange={(e) => {
              setForm((f) => ({ ...f, city: e.target.value }));
              handleLocationSearch(e.target.value, 'city');
            }}
            placeholder='Type city name...'
            InputProps={{
              endAdornment: searchLoading ? (
                <CircularProgress size={14} />
              ) : form.city ? (
                <InputAdornment position='end'>
                  <ClearIcon
                    sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary' }}
                    onClick={() => {
                      setForm((f) => ({ ...f, city: '', state: '', country: '' }));
                      setCitySuggestions([]);
                    }}
                  />
                </InputAdornment>
              ) : (
                <InputAdornment position='end'>
                  <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          {citySuggestions.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: 200,
                overflow: 'auto',
                mt: 0.5,
              }}
            >
              {citySuggestions.map((option) => (
                <Box
                  key={option.place_id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => {
                    setForm((f) => ({ ...f, city: option.display_name }));
                    if (option.address?.state) {
                      setForm((f) => ({ ...f, state: option.address?.state || '' }));
                    }
                    if (option.address?.country) {
                      setForm((f) => ({ ...f, country: option.address?.country || '' }));
                    }
                    // Store coordinates for timezone lookup
                    setSelectedCityCoords({ lat: option.lat, lon: option.lon });
                    setCitySuggestions([]);
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: '1rem', color: ACCENT_WL }} />
                  <Typography variant='body2'>{option.display_name}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label='State / Province'
            size='small'
            fullWidth
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            placeholder='Auto-filled from city'
          />
          <TextField
            label='Country'
            size='small'
            fullWidth
            required
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            placeholder='Auto-filled from city'
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
          <Box sx={{ position: 'relative', flex: 1 }}>
            <TextField
              label='Language'
              size='small'
              fullWidth
              value={form.language}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, language: val }));
                setLanguageSearchOpen(true);
                handleLanguageSearch(val);
              }}
              onFocus={() => {
                setLanguageSearchOpen(true);
                if (form.language) handleLanguageSearch(form.language);
              }}
              onBlur={() => {
                setTimeout(() => setLanguageSearchOpen(false), 200);
              }}
              placeholder='Search language...'
              InputProps={{
                endAdornment: languageSearchLoading ? (
                  <CircularProgress size={14} />
                ) : form.language ? (
                  <InputAdornment position='end'>
                    <ClearIcon
                      sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary' }}
                      onClick={() => {
                        setForm((f) => ({ ...f, language: '' }));
                        setLanguageSuggestions([]);
                      }}
                    />
                  </InputAdornment>
                ) : (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            {languageSuggestions.length > 0 && languageSearchOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 200,
                  overflow: 'auto',
                  mt: 0.5,
                }}
              >
                {languageSuggestions.map((option) => (
                  <Box
                    key={option.value}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onMouseDown={() => {
                      setForm((f) => ({ ...f, language: option.value }));
                      setLanguageSuggestions([]);
                      setLanguageSearchOpen(false);
                    }}
                  >
                    <Typography variant='body2' fontWeight={600}>
                      {option.label}
                    </Typography>
                    {option.nativeName && option.nativeName !== option.label.split(' (')[0] && (
                      <Typography variant='caption' color='text.secondary'>
                        {option.nativeName}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
          <Box sx={{ position: 'relative', flex: 1 }}>
            <TextField
              label='Time Zone'
              size='small'
              fullWidth
              value={form.timezone}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, timezone: val }));
                setTimezoneSearchOpen(true);
                handleTimezoneSearch(val);
              }}
              onFocus={() => {
                setTimezoneSearchOpen(true);
                if (form.timezone) handleTimezoneSearch(form.timezone);
              }}
              onBlur={() => {
                setTimeout(() => setTimezoneSearchOpen(false), 200);
              }}
              placeholder='Select timezone...'
              InputProps={{
                endAdornment: timezoneSearchLoading ? (
                  <CircularProgress size={14} />
                ) : form.timezone ? (
                  <InputAdornment position='end'>
                    <ClearIcon
                      sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary' }}
                      onClick={() => {
                        setForm((f) => ({ ...f, timezone: '' }));
                        setTimezoneSuggestions([]);
                      }}
                    />
                  </InputAdornment>
                ) : (
                  <InputAdornment position='end'>
                    <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            {timezoneSuggestions.length > 0 && timezoneSearchOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 200,
                  overflow: 'auto',
                  mt: 0.5,
                }}
              >
                {timezoneSuggestions.map((option) => (
                  <Box
                    key={option.value}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onMouseDown={() => {
                      setForm((f) => ({ ...f, timezone: option.value }));
                      setTimezoneSuggestions([]);
                      setTimezoneSearchOpen(false);
                    }}
                  >
                    <Typography variant='body2' fontWeight={600}>
                      {option.label}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {option.value}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
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
