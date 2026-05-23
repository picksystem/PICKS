import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Switch,
  DataTable,
  Column,
} from '@serviceops/component';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  alpha,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
} from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { ACCENT_WC, ACCENT_WT, ACCENT_CT, ACCENT_WL, ACCENT_CC, ACCENT_BH } from '../shared';
import { PanelHeader, PanelTable, PanelToolbar } from '../../../Categorization/components/shared';
import { ActiveChip } from '@serviceops/pages/base/Configuration/shared/assocPanel';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_WT_FORM = {
  calendarName: '',
  dayOfWeek: '',
  timeBlocks: [{ startTime: '09:00', endTime: '17:00' }],
  isWorkingDay: true,
};
const EMPTY_CT_FORM = {
  calendarName: '',
  date: '',
  day: '',
  startTime: '09:00',
  endTime: '17:00',
  isWorkingDay: false,
  note: '',
};
const EMPTY_WL_FORM = { calendarName: '', workLocation: '', effectiveFrom: '', effectiveTo: '' };
const EMPTY_CO_FORM = {
  calendarName: '',
  consultantName: '',
  role: '',
  application: '',
  effectiveFrom: '',
  effectiveTo: '',
};
const EMPTY_WC_FORM = { name: '', holidayCalendar: '', workingDayTemplate: '' };

type WCActiveView = 'calendar' | 'workingTimes' | 'composedTimes' | 'workLocations' | 'consultants';

const dayFromDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

// ── Working Time Panel ─────────────────────────────────────────────────────────

const WorkingTimePanel = ({
  calendarRow,
  allTimes,
  onSave,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allTimes: IConfigWorkingCalendarTime[];
  onSave: (next: IConfigWorkingCalendarTime[]) => void;
  onBack?: () => void;
}) => {
  const rows = calendarRow ? allTimes.filter((t) => t.calendarName === calendarRow.name) : allTimes;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkingCalendarTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wtForm, setWtForm] = useState({ ...EMPTY_WT_FORM });

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.dayOfWeek.toLowerCase().includes(search.toLowerCase()) ||
          r.timeBlocks.some((b) => b.startTime.includes(search) || b.endTime.includes(search)),
      )
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    setWtForm(
      editingRow
        ? {
            calendarName: editingRow.calendarName,
            dayOfWeek: editingRow.dayOfWeek,
            timeBlocks: editingRow.timeBlocks || [{ startTime: '09:00', endTime: '17:00' }],
            isWorkingDay: editingRow.isWorkingDay,
          }
        : { ...EMPTY_WT_FORM, calendarName: calendarRow?.name ?? '' },
    );
  }, [dialogOpen, editingRow, calendarRow]);

  const handleSubmit = () => {
    if (!wtForm.calendarName.trim()) return;
    const validBlocks = wtForm.timeBlocks.filter((b) => b.startTime && b.endTime);
    if (validBlocks.length === 0) validBlocks.push({ startTime: '09:00', endTime: '17:00' });
    const formData = { ...wtForm, timeBlocks: validBlocks };
    let next: IConfigWorkingCalendarTime[];
    if (editingRow) {
      next = allTimes.map((t) => (t.id === editingRow.id ? { ...editingRow, ...formData } : t));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkingCalendarTime = { id: `wt_${Date.now()}`, ...formData };
      next = [...allTimes, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(allTimes.filter((t) => t.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const wtCols: Column<IConfigWorkingCalendarTime>[] = [
    {
      id: 'dayOfWeek',
      label: 'Day of Week',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'timeBlocks',
      label: 'Working Hours',
      minWidth: 250,
      format: (v): React.ReactNode => {
        const blocks = Array.isArray(v) ? v : [];
        if (blocks.length === 0)
          return (
            <Typography variant='body2' color='text.disabled'>
              —
            </Typography>
          );
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {blocks.map((block: { startTime: string; endTime: string }, idx: number) => (
              <Chip
                key={idx}
                label={`${block.startTime} – ${block.endTime}`}
                size='small'
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 22,
                  borderRadius: '6px',
                  bgcolor: alpha(ACCENT_WT, 0.1),
                  color: ACCENT_WT,
                }}
              />
            ))}
          </Box>
        );
      },
    },
    { id: 'isWorkingDay', label: 'Working Day', minWidth: 110, format: ActiveChip },
  ];

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_WT}
        icon={<AccessTimeIcon fontSize='small' />}
        title={
          calendarRow ? `Working Times — ${calendarRow.name}` : 'Working Times (All Calendars)'
        }
      />
      <PanelToolbar
        accent={ACCENT_WT}
        selectedLabel={
          selectedRow
            ? `${selectedRow.dayOfWeek} (${(selectedRow.timeBlocks || []).map((b) => `${b.startTime}–${b.endTime}`).join(', ')})`
            : null
        }
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
      <PanelTable accent={ACCENT_WT}>
        <DataTable
          columns={wtCols}
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
        accent={ACCENT_WT}
        title='Working Time'
        submitDisabled={!wtForm.calendarName.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          value={wtForm.calendarName}
          onChange={(e) => setWtForm((f) => ({ ...f, calendarName: e.target.value }))}
          disabled={!!calendarRow}
        />
        <FormControl size='small' fullWidth>
          <InputLabel>Day of Week</InputLabel>
          <Select
            value={wtForm.dayOfWeek}
            label='Day of Week'
            onChange={(e) => setWtForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
          >
            {DAYS_OF_WEEK.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box>
          <Typography variant='body2' fontWeight={600} sx={{ mb: 1 }}>
            Working Hours (add multiple blocks for breaks)
          </Typography>
          {wtForm.timeBlocks.map((block, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label='Start Time'
                type='time'
                size='small'
                sx={{ flex: 1 }}
                value={block.startTime}
                onChange={(e) => {
                  const newBlocks = [...wtForm.timeBlocks];
                  newBlocks[idx] = { ...block, startTime: e.target.value };
                  setWtForm((f) => ({ ...f, timeBlocks: newBlocks }));
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label='End Time'
                type='time'
                size='small'
                sx={{ flex: 1 }}
                value={block.endTime}
                onChange={(e) => {
                  const newBlocks = [...wtForm.timeBlocks];
                  newBlocks[idx] = { ...block, endTime: e.target.value };
                  setWtForm((f) => ({ ...f, timeBlocks: newBlocks }));
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              {wtForm.timeBlocks.length > 1 && (
                <IconButton
                  size='small'
                  color='error'
                  onClick={() =>
                    setWtForm((f) => ({
                      ...f,
                      timeBlocks: f.timeBlocks.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            size='small'
            startIcon={<AddIcon />}
            onClick={() =>
              setWtForm((f) => ({
                ...f,
                timeBlocks: [...f.timeBlocks, { startTime: '12:00', endTime: '13:00' }],
              }))
            }
            sx={{ mt: 0.5 }}
          >
            Add Time Block
          </Button>
        </Box>
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={wtForm.isWorkingDay}
              onChange={(e) => setWtForm((f) => ({ ...f, isWorkingDay: e.target.checked }))}
            />
          }
          label={
            <Typography variant='body2' fontSize='0.82rem'>
              Is Working Day
            </Typography>
          }
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Time'
        itemName={
          selectedRow
            ? `${selectedRow.dayOfWeek} (${(selectedRow.timeBlocks || []).map((b) => `${b.startTime}–${b.endTime}`).join(', ')})`
            : undefined
        }
      />
    </Box>
  );
};

// ── Composed Times Panel ──────────────────────────────────────────────────────

const ComposedTimesPanel = ({
  calendarRow,
  allComposed,
  onSave,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allComposed: IConfigComposedWorkingTime[];
  onSave: (next: IConfigComposedWorkingTime[]) => void;
  onBack?: () => void;
}) => {
  const rows = calendarRow
    ? allComposed.filter((c) => c.calendarName === calendarRow.name)
    : allComposed;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigComposedWorkingTime | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [ctForm, setCtForm] = useState({ ...EMPTY_CT_FORM });

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.date.includes(search) ||
          r.day.toLowerCase().includes(search.toLowerCase()) ||
          r.note.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    setCtForm(
      editingRow
        ? {
            calendarName: editingRow.calendarName,
            date: editingRow.date,
            day: editingRow.day,
            startTime: editingRow.startTime,
            endTime: editingRow.endTime,
            isWorkingDay: editingRow.isWorkingDay,
            note: editingRow.note,
          }
        : { ...EMPTY_CT_FORM, calendarName: calendarRow?.name ?? '' },
    );
  }, [dialogOpen, editingRow, calendarRow]);

  const handleCtDateChange = (d: Dayjs | null) => {
    const iso = d && d.isValid() ? d.format('YYYY-MM-DD') : '';
    setCtForm((f) => ({ ...f, date: iso, day: iso ? dayFromDate(iso) : '' }));
  };

  const handleSubmit = () => {
    if (!ctForm.calendarName.trim() || !ctForm.date.trim()) return;
    let next: IConfigComposedWorkingTime[];
    if (editingRow) {
      next = allComposed.map((c) => (c.id === editingRow.id ? { ...editingRow, ...ctForm } : c));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigComposedWorkingTime = { id: `ct_${Date.now()}`, ...ctForm };
      next = [...allComposed, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(allComposed.filter((c) => c.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const ctCols: Column<IConfigComposedWorkingTime>[] = [
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'day',
      label: 'Day',
      minWidth: 110,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem' color='text.secondary'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'startTime',
      label: 'Start Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            bgcolor: alpha(ACCENT_CT, 0.1),
            color: ACCENT_CT,
          }}
        />
      ),
    },
    {
      id: 'endTime',
      label: 'End Time',
      minWidth: 100,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            bgcolor: alpha('#dc2626', 0.1),
            color: '#dc2626',
          }}
        />
      ),
    },
    { id: 'isWorkingDay', label: 'Working Day', minWidth: 110, format: ActiveChip },
    {
      id: 'note',
      label: 'Note',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem' noWrap sx={{ maxWidth: 220 }}>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_CT}
        icon={<EventNoteIcon fontSize='small' />}
        title={
          calendarRow
            ? `Composed Working Times — ${calendarRow.name}`
            : 'Composed Working Times (All Calendars)'
        }
      />
      <PanelToolbar
        accent={ACCENT_CT}
        selectedLabel={
          selectedRow
            ? `${selectedRow.date}  (${selectedRow.startTime}–${selectedRow.endTime})`
            : null
        }
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
      <PanelTable accent={ACCENT_CT}>
        <DataTable
          columns={ctCols}
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
        icon={<EventNoteIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CT}
        title='Composed Working Time'
        submitDisabled={!ctForm.calendarName.trim() || !ctForm.date.trim()}
        maxWidth='sm'
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          value={ctForm.calendarName}
          onChange={(e) => setCtForm((f) => ({ ...f, calendarName: e.target.value }))}
          disabled={!!calendarRow}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Date'
            value={ctForm.date ? dayjs(ctForm.date) : null}
            onChange={handleCtDateChange}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Start Time'
            type='time'
            size='small'
            sx={{ flex: 1 }}
            value={ctForm.startTime}
            onChange={(e) => setCtForm((f) => ({ ...f, startTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='End Time'
            type='time'
            size='small'
            sx={{ flex: 1 }}
            value={ctForm.endTime}
            onChange={(e) => setCtForm((f) => ({ ...f, endTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={ctForm.isWorkingDay}
              onChange={(e) => setCtForm((f) => ({ ...f, isWorkingDay: e.target.checked }))}
            />
          }
          label={
            <Typography variant='body2' fontSize='0.82rem'>
              Is Working Day
            </Typography>
          }
        />
        <TextField
          label='Note'
          size='small'
          fullWidth
          value={ctForm.note}
          onChange={(e) => setCtForm((f) => ({ ...f, note: e.target.value }))}
          placeholder='e.g. Special arrangement for this day'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Composed Working Time'
        itemName={selectedRow?.date}
      />
    </Box>
  );
};

// ── Work Locations Panel ─────────────────────────────────────────────────────

const WorkLocationsPanel = ({
  calendarRow,
  allLocations,
  onSave,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allLocations: IConfigCalendarWorkLocation[];
  onSave: (next: IConfigCalendarWorkLocation[]) => void;
  onBack?: () => void;
}) => {
  const rows = calendarRow
    ? allLocations.filter((l) => l.calendarName === calendarRow.name)
    : allLocations;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigCalendarWorkLocation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wlForm, setWlForm] = useState({ ...EMPTY_WL_FORM });

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter((r) => r.workLocation.toLowerCase().includes(search.toLowerCase()))
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    setWlForm(
      editingRow
        ? {
            calendarName: editingRow.calendarName,
            workLocation: editingRow.workLocation,
            effectiveFrom: editingRow.effectiveFrom,
            effectiveTo: editingRow.effectiveTo,
          }
        : { ...EMPTY_WL_FORM, calendarName: calendarRow?.name ?? '' },
    );
  }, [dialogOpen, editingRow, calendarRow]);

  const handleSubmit = () => {
    if (!wlForm.calendarName.trim() || !wlForm.workLocation.trim()) return;
    let next: IConfigCalendarWorkLocation[];
    if (editingRow) {
      next = allLocations.map((l) => (l.id === editingRow.id ? { ...editingRow, ...wlForm } : l));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigCalendarWorkLocation = { id: `wl_${Date.now()}`, ...wlForm };
      next = [...allLocations, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(allLocations.filter((l) => l.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const wlCols: Column<IConfigCalendarWorkLocation>[] = [
    {
      id: 'workLocation',
      label: 'Work Location',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'effectiveFrom',
      label: 'Effective From',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'effectiveTo',
      label: 'Effective To',
      minWidth: 130,
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
        accent={ACCENT_WL}
        icon={<BusinessIcon fontSize='small' />}
        title={
          calendarRow ? `Work Locations — ${calendarRow.name}` : 'Work Locations (All Calendars)'
        }
      />
      <PanelToolbar
        accent={ACCENT_WL}
        selectedLabel={selectedRow?.workLocation ?? null}
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
      <PanelTable accent={ACCENT_WL}>
        <DataTable
          columns={wlCols}
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
        icon={<BusinessIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_WL}
        title='Work Location Association'
        submitDisabled={!wlForm.calendarName.trim() || !wlForm.workLocation.trim()}
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          value={wlForm.calendarName}
          onChange={(e) => setWlForm((f) => ({ ...f, calendarName: e.target.value }))}
          disabled={!!calendarRow}
        />
        <TextField
          label='Work Location'
          size='small'
          fullWidth
          required
          value={wlForm.workLocation}
          onChange={(e) => setWlForm((f) => ({ ...f, workLocation: e.target.value }))}
          placeholder='e.g. London Office'
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Effective From'
              value={wlForm.effectiveFrom ? dayjs(wlForm.effectiveFrom) : null}
              onChange={(d) =>
                setWlForm((f) => ({
                  ...f,
                  effectiveFrom: d?.isValid() ? d.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Effective To'
              value={wlForm.effectiveTo ? dayjs(wlForm.effectiveTo) : null}
              onChange={(d) =>
                setWlForm((f) => ({
                  ...f,
                  effectiveTo: d?.isValid() ? d.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
            />
          </LocalizationProvider>
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Work Location Association'
        itemName={selectedRow?.workLocation}
      />
    </Box>
  );
};

// ── Consultants Panel ─────────────────────────────────────────────────────────

const ConsultantsPanel = ({
  calendarRow,
  allConsultants,
  onSave,
  onBack,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allConsultants: IConfigCalendarConsultant[];
  onSave: (next: IConfigCalendarConsultant[]) => void;
  onBack?: () => void;
}) => {
  const rows = calendarRow
    ? allConsultants.filter((c) => c.calendarName === calendarRow.name)
    : allConsultants;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigCalendarConsultant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coForm, setCoForm] = useState({ ...EMPTY_CO_FORM });

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.consultantName.toLowerCase().includes(search.toLowerCase()) ||
          r.role.toLowerCase().includes(search.toLowerCase()) ||
          r.application.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    setCoForm(
      editingRow
        ? {
            calendarName: editingRow.calendarName,
            consultantName: editingRow.consultantName,
            role: editingRow.role,
            application: editingRow.application,
            effectiveFrom: editingRow.effectiveFrom,
            effectiveTo: editingRow.effectiveTo,
          }
        : { ...EMPTY_CO_FORM, calendarName: calendarRow?.name ?? '' },
    );
  }, [dialogOpen, editingRow, calendarRow]);

  const handleSubmit = () => {
    if (!coForm.calendarName.trim() || !coForm.consultantName.trim()) return;
    let next: IConfigCalendarConsultant[];
    if (editingRow) {
      next = allConsultants.map((c) => (c.id === editingRow.id ? { ...editingRow, ...coForm } : c));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigCalendarConsultant = { id: `co_${Date.now()}`, ...coForm };
      next = [...allConsultants, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(allConsultants.filter((c) => c.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const coCols: Column<IConfigCalendarConsultant>[] = [
    {
      id: 'consultantName',
      label: 'Consultant Name',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      minWidth: 140,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 160,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'effectiveFrom',
      label: 'Effective From',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'effectiveTo',
      label: 'Effective To',
      minWidth: 130,
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
        accent={ACCENT_CC}
        icon={<GroupIcon fontSize='small' />}
        title={
          calendarRow
            ? `Associated Consultants — ${calendarRow.name}`
            : 'Associated Consultants (All Calendars)'
        }
      />
      <PanelToolbar
        accent={ACCENT_CC}
        selectedLabel={selectedRow?.consultantName ?? null}
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
      <PanelTable accent={ACCENT_CC}>
        <DataTable
          columns={coCols}
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
        icon={<GroupIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_CC}
        title='Consultant Association'
        submitDisabled={!coForm.calendarName.trim() || !coForm.consultantName.trim()}
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          value={coForm.calendarName}
          onChange={(e) => setCoForm((f) => ({ ...f, calendarName: e.target.value }))}
          disabled={!!calendarRow}
        />
        <TextField
          label='Consultant Name'
          size='small'
          fullWidth
          required
          value={coForm.consultantName}
          onChange={(e) => setCoForm((f) => ({ ...f, consultantName: e.target.value }))}
          placeholder='e.g. John Smith'
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Role'
            size='small'
            sx={{ flex: 1 }}
            value={coForm.role}
            onChange={(e) => setCoForm((f) => ({ ...f, role: e.target.value }))}
            placeholder='e.g. Senior Consultant'
          />
          <TextField
            label='Application'
            size='small'
            sx={{ flex: 1 }}
            value={coForm.application}
            onChange={(e) => setCoForm((f) => ({ ...f, application: e.target.value }))}
            placeholder='e.g. SAP ERP'
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Effective From'
              value={coForm.effectiveFrom ? dayjs(coForm.effectiveFrom) : null}
              onChange={(d) =>
                setCoForm((f) => ({
                  ...f,
                  effectiveFrom: d?.isValid() ? d.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Effective To'
              value={coForm.effectiveTo ? dayjs(coForm.effectiveTo) : null}
              onChange={(d) =>
                setCoForm((f) => ({
                  ...f,
                  effectiveTo: d?.isValid() ? d.format('YYYY-MM-DD') : '',
                }))
              }
              slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
            />
          </LocalizationProvider>
        </Box>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Consultant Association'
        itemName={selectedRow?.consultantName}
      />
    </Box>
  );
};

// ── Working Calendars Section ─────────────────────────────────────────────────

interface WorkingCalendarsSectionProps {
  data?: IConfigWorkingCalendar[];
  onDataChange?: (data: IConfigWorkingCalendar[]) => void;
}

const WorkingCalendarsSection = ({ data, onDataChange }: WorkingCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkingCalendar[]>([]);
  const [wcTimes, setWcTimes] = useState<IConfigWorkingCalendarTime[]>([]);
  const [composedTimes, setComposedTimes] = useState<IConfigComposedWorkingTime[]>([]);
  const [workLocations, setWorkLocations] = useState<IConfigCalendarWorkLocation[]>([]);
  const [consultants, setConsultants] = useState<IConfigCalendarConsultant[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkingCalendar | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wcForm, setWcForm] = useState({ ...EMPTY_WC_FORM });
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyName, setCopyName] = useState('');
  const [activeView, setActiveView] = useState<WCActiveView>('calendar');

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCAL?.workingCalendars) {
      setRows(apiCAL.workingCalendars);
    }
  }, [data, apiCAL]);

  useEffect(() => {
    if (apiCAL?.workingCalendarTimes) setWcTimes(apiCAL.workingCalendarTimes);
    if (apiCAL?.composedWorkingTimes) setComposedTimes(apiCAL.composedWorkingTimes);
    if (apiCAL?.calendarWorkLocations) setWorkLocations(apiCAL.calendarWorkLocations);
    if (apiCAL?.calendarConsultants) setConsultants(apiCAL.calendarConsultants);
  }, [apiCAL]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.holidayCalendar.toLowerCase().includes(search.toLowerCase()) ||
          r.workingDayTemplate.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (
    updates: Partial<{
      workingCalendars: IConfigWorkingCalendar[];
      workingCalendarTimes: IConfigWorkingCalendarTime[];
      composedWorkingTimes: IConfigComposedWorkingTime[];
      calendarWorkLocations: IConfigCalendarWorkLocation[];
      calendarConsultants: IConfigCalendarConsultant[];
    }>,
  ) => {
    if (updates.workingCalendars) {
      setRows(updates.workingCalendars);
      if (onDataChange) onDataChange(updates.workingCalendars);
    }
    if (updates.workingCalendarTimes) setWcTimes(updates.workingCalendarTimes);
    if (updates.composedWorkingTimes) setComposedTimes(updates.composedWorkingTimes);
    if (updates.calendarWorkLocations) setWorkLocations(updates.calendarWorkLocations);
    if (updates.calendarConsultants) setConsultants(updates.calendarConsultants);
    if (!onDataChange) {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: apiCAL?.holidayCalendars ?? [],
        bankHolidays: apiCAL?.bankHolidays ?? [],
        workingCalendars: updates.workingCalendars ?? rows,
        workingCalendarTimes: updates.workingCalendarTimes ?? wcTimes,
        composedWorkingTimes: updates.composedWorkingTimes ?? composedTimes,
        calendarWorkLocations: updates.calendarWorkLocations ?? workLocations,
        calendarConsultants: updates.calendarConsultants ?? consultants,
      });
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    setWcForm(
      editingRow
        ? {
            name: editingRow.name,
            holidayCalendar: editingRow.holidayCalendar,
            workingDayTemplate: editingRow.workingDayTemplate,
          }
        : { ...EMPTY_WC_FORM },
    );
  }, [dialogOpen, editingRow]);

  const handleSubmit = () => {
    if (!wcForm.name.trim()) return;
    if (editingRow) {
      save({
        workingCalendars: rows.map((r) =>
          r.id === editingRow.id ? { ...editingRow, ...wcForm } : r,
        ),
      });
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkingCalendar = { id: `wc_${Date.now()}`, ...wcForm };
      save({ workingCalendars: [...rows, n] });
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const { name } = selectedRow;
    save({
      workingCalendars: rows.filter((r) => r.id !== selectedRow.id),
      workingCalendarTimes: wcTimes.filter((t) => t.calendarName !== name),
      composedWorkingTimes: composedTimes.filter((c) => c.calendarName !== name),
      calendarWorkLocations: workLocations.filter((l) => l.calendarName !== name),
      calendarConsultants: consultants.filter((c) => c.calendarName !== name),
    });
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const handleCopy = () => {
    if (!selectedRow || !copyName.trim()) return;
    const newId = `wc_${Date.now()}`;
    const ts = Date.now();
    save({
      workingCalendars: [...rows, { ...selectedRow, id: newId, name: copyName.trim() }],
      workingCalendarTimes: [
        ...wcTimes,
        ...wcTimes
          .filter((t) => t.calendarName === selectedRow.name)
          .map((t) => ({ ...t, id: `wt_${ts}_${t.id}`, calendarName: copyName.trim() })),
      ],
      composedWorkingTimes: [
        ...composedTimes,
        ...composedTimes
          .filter((c) => c.calendarName === selectedRow.name)
          .map((c) => ({ ...c, id: `ct_${ts}_${c.id}`, calendarName: copyName.trim() })),
      ],
      calendarWorkLocations: [
        ...workLocations,
        ...workLocations
          .filter((l) => l.calendarName === selectedRow.name)
          .map((l) => ({ ...l, id: `wl_${ts}_${l.id}`, calendarName: copyName.trim() })),
      ],
      calendarConsultants: [
        ...consultants,
        ...consultants
          .filter((c) => c.calendarName === selectedRow.name)
          .map((c) => ({ ...c, id: `co_${ts}_${c.id}`, calendarName: copyName.trim() })),
      ],
    });
    setCopyDialogOpen(false);
    setCopyName('');
  };

  const holidayCalendarNames = (apiCAL?.holidayCalendars ?? []).map((h) => h.name);
  const workingDayTemplateNames = (apiCAL?.workingDayTemplates ?? []).map((w) => w.name);

  const wcCols: Column<IConfigWorkingCalendar>[] = [
    {
      id: 'name',
      label: 'Calendar Name',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'holidayCalendar',
      label: 'Holiday Calendar',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            bgcolor: v ? alpha(ACCENT_BH, 0.1) : 'grey.100',
            color: v ? ACCENT_BH : 'text.disabled',
          }}
        />
      ),
    },
    {
      id: 'workingDayTemplate',
      label: 'Working Day Template',
      minWidth: 180,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
          size='small'
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            bgcolor: v ? alpha(ACCENT_WC, 0.1) : 'grey.100',
            color: v ? ACCENT_WC : 'text.disabled',
          }}
        />
      ),
    },
  ];

  const togglePanel = (panel: Exclude<WCActiveView, 'calendar'>) =>
    setActiveView((p) => (p === panel ? 'calendar' : panel));

  const panelBtn = (
    panel: Exclude<WCActiveView, 'calendar'>,
    label: string,
    _accent: string,
    Icon: React.ElementType,
  ) => (
    <Button
      size='small'
      variant={activeView === panel ? 'contained' : 'outlined'}
      onClick={() => togglePanel(panel)}
      startIcon={<Icon />}
      sx={{
        textTransform: 'none',
        bgcolor: activeView === panel ? '#2d5ebb' : undefined,
        color: activeView === panel ? '#fff' : '#2d5ebb',
      }}
    >
      {label}
    </Button>
  );

  return (
    <Accordion className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2d5ebb' }} />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: ACCENT_WC,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <EventAvailableIcon sx={{ color: '#fff', fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography className={classes.sectionTitle}>Working Calendars</Typography>
            <Typography className={classes.sectionSubtitle}>
              Define working calendars with associated working times and consultants
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
              variant={activeView === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('calendar')}
              startIcon={<CalendarTodayIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: activeView === 'calendar' ? '#2d5ebb' : undefined,
                color: activeView === 'calendar' ? '#fff' : '#2d5ebb',
              }}
            >
              Working Calendars
            </Button>
            {panelBtn('workingTimes', 'Working Times', ACCENT_WT, AccessTimeIcon)}
            {panelBtn('composedTimes', 'Composed Times', ACCENT_CT, EventNoteIcon)}
            {panelBtn('workLocations', 'Work Locations', ACCENT_WL, BusinessIcon)}
            {panelBtn('consultants', 'Consultants', ACCENT_CC, GroupIcon)}
          </Box>
        </Paper>

        {activeView === 'calendar' && (
          <Box sx={{ mt: 1.5 }}>
            <PanelHeader
              accent={ACCENT_WC}
              icon={<CalendarTodayIcon fontSize='small' />}
              title='Working Calendars'
            />
            <PanelToolbar
              accent={ACCENT_WC}
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
            <PanelTable accent={ACCENT_WC}>
              <DataTable
                columns={wcCols}
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
              icon={<CalendarTodayIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
              accent={ACCENT_WC}
              title='Working Calendar'
              subtitle='Define a working calendar with holiday calendar and working day template'
              submitDisabled={!wcForm.name.trim()}
              maxWidth='sm'
            >
              <TextField
                label='Calendar Name'
                size='small'
                fullWidth
                required
                value={wcForm.name}
                onChange={(e) => setWcForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='e.g. UK Standard 2025'
              />
              <FormControl size='small' fullWidth>
                <InputLabel>Holiday Calendar</InputLabel>
                <Select
                  value={wcForm.holidayCalendar}
                  label='Holiday Calendar'
                  onChange={(e) => setWcForm((f) => ({ ...f, holidayCalendar: e.target.value }))}
                >
                  <MenuItem value=''>— None —</MenuItem>
                  {holidayCalendarNames.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size='small' fullWidth>
                <InputLabel>Working Day Template</InputLabel>
                <Select
                  value={wcForm.workingDayTemplate}
                  label='Working Day Template'
                  onChange={(e) => setWcForm((f) => ({ ...f, workingDayTemplate: e.target.value }))}
                >
                  <MenuItem value=''>— None —</MenuItem>
                  {workingDayTemplateNames.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ConfigFormDialog>

            <ConfigDeleteDialog
              open={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              onConfirm={handleDelete}
              entityName='Working Calendar'
              itemName={selectedRow?.name}
            />

            <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth='xs'>
              <DialogContent>
                <Typography variant='body2' sx={{ mb: 1.5 }}>
                  Copy calendar as:
                </Typography>
                <TextField
                  size='small'
                  fullWidth
                  value={copyName}
                  onChange={(e) => setCopyName(e.target.value)}
                  placeholder='New calendar name'
                  autoFocus
                />
              </DialogContent>
              <DialogActions>
                <Button size='small' onClick={() => setCopyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size='small'
                  variant='contained'
                  onClick={handleCopy}
                  disabled={!copyName.trim()}
                >
                  Copy
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {activeView === 'workingTimes' && (
          <WorkingTimePanel
            calendarRow={selectedRow}
            allTimes={wcTimes}
            onSave={(next) => save({ workingCalendarTimes: next })}
            onBack={() => setActiveView('calendar')}
          />
        )}
        {activeView === 'composedTimes' && (
          <ComposedTimesPanel
            calendarRow={selectedRow}
            allComposed={composedTimes}
            onSave={(next) => save({ composedWorkingTimes: next })}
            onBack={() => setActiveView('calendar')}
          />
        )}
        {activeView === 'workLocations' && (
          <WorkLocationsPanel
            calendarRow={selectedRow}
            allLocations={workLocations}
            onSave={(next) => save({ calendarWorkLocations: next })}
            onBack={() => setActiveView('calendar')}
          />
        )}
        {activeView === 'consultants' && (
          <ConsultantsPanel
            calendarRow={selectedRow}
            allConsultants={consultants}
            onSave={(next) => save({ calendarConsultants: next })}
            onBack={() => setActiveView('calendar')}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { WorkingCalendarsSection };
