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
  DialogContent,
  DialogActions,
  alpha,
  IconButton,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  IConfigWorkingDayTemplate,
  IConfigHolidayCalendar,
  IConfigBankHoliday,
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
} from '@serviceops/interfaces';
import { DataTable, Column } from '@serviceops/component';
import { useStyles } from './styles';
import { useConfiguration } from '../../hooks/useConfiguration';
import { ConfigFormDialog, ConfigDeleteDialog } from '../../dialogs/ConfigDialogs/ConfigDialogs';
import { PanelHeader, PanelToolbar, PanelTable, ActiveChip } from '../../shared/assocPanel';

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCENT = '#7e09b4';

type DayKey =
  | 'mondayHours'
  | 'tuesdayHours'
  | 'wednesdayHours'
  | 'thursdayHours'
  | 'fridayHours'
  | 'saturdayHours'
  | 'sundayHours';

const DAY_META: {
  key: DayKey;
  label: string;
  short: string;
  letter: string;
  color: string;
  weekend: boolean;
}[] = [
  {
    key: 'mondayHours',
    label: 'Monday',
    short: 'MON',
    letter: 'M',
    color: '#2563eb',
    weekend: false,
  },
  {
    key: 'tuesdayHours',
    label: 'Tuesday',
    short: 'TUE',
    letter: 'T',
    color: '#0891b2',
    weekend: false,
  },
  {
    key: 'wednesdayHours',
    label: 'Wednesday',
    short: 'WED',
    letter: 'W',
    color: '#059669',
    weekend: false,
  },
  {
    key: 'thursdayHours',
    label: 'Thursday',
    short: 'THU',
    letter: 'T',
    color: '#7c3aed',
    weekend: false,
  },
  {
    key: 'fridayHours',
    label: 'Friday',
    short: 'FRI',
    letter: 'F',
    color: '#4f46e5',
    weekend: false,
  },
  {
    key: 'saturdayHours',
    label: 'Saturday',
    short: 'SAT',
    letter: 'S',
    color: '#ea580c',
    weekend: true,
  },
  {
    key: 'sundayHours',
    label: 'Sunday',
    short: 'SUN',
    letter: 'S',
    color: '#dc2626',
    weekend: true,
  },
];

const EMPTY_FORM: Omit<IConfigWorkingDayTemplate, 'id'> = {
  name: '',
  description: '',
  mondayHours: 8,
  tuesdayHours: 8,
  wednesdayHours: 8,
  thursdayHours: 8,
  fridayHours: 8,
  saturdayHours: 0,
  sundayHours: 0,
};

// ── Hour stepper card for the dialog ─────────────────────────────────────────

const DayCard = ({
  day,
  hours,
  onChange,
}: {
  day: (typeof DAY_META)[number];
  hours: number;
  onChange: (v: number) => void;
}) => {
  const fillPct = Math.min(100, (hours / 12) * 100);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 1.5,
        borderRadius: 2.5,
        border: '1.5px solid',
        borderColor: hours > 0 ? alpha(day.color, 0.35) : alpha('#000', 0.08),
        bgcolor: hours > 0 ? alpha(day.color, 0.04) : 'grey.50',
        transition: 'all 0.2s ease',
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* Day badge */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: hours > 0 ? day.color : alpha('#000', 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          boxShadow: hours > 0 ? `0 4px 12px ${alpha(day.color, 0.4)}` : 'none',
        }}
      >
        <Typography
          sx={{
            color: hours > 0 ? '#fff' : 'text.disabled',
            fontWeight: 800,
            fontSize: '0.85rem',
            lineHeight: 1,
          }}
        >
          {day.letter}
        </Typography>
      </Box>

      {/* Day label */}
      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: hours > 0 ? day.color : 'text.disabled',
        }}
      >
        {day.short}
      </Typography>

      {/* Stepper */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <IconButton
          size='small'
          onClick={() => onChange(Math.max(0, hours - 1))}
          sx={{
            p: 0.25,
            color: hours > 0 ? day.color : 'text.disabled',
            '&:hover': { bgcolor: alpha(day.color, 0.1) },
          }}
        >
          <RemoveCircleOutlineIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <Typography
          sx={{
            width: 28,
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: hours > 0 ? day.color : 'text.disabled',
            lineHeight: 1,
          }}
        >
          {hours}
        </Typography>
        <IconButton
          size='small'
          onClick={() => onChange(Math.min(24, hours + 1))}
          sx={{
            p: 0.25,
            color: day.color,
            '&:hover': { bgcolor: alpha(day.color, 0.1) },
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      {/* hrs label */}
      <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600 }}>
        hrs
      </Typography>

      {/* Fill bar */}
      <Box
        sx={{
          width: '100%',
          height: 3,
          bgcolor: alpha('#000', 0.06),
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${fillPct}%`,
            bgcolor: hours > 0 ? day.color : 'transparent',
            borderRadius: 2,
            transition: 'width 0.25s ease',
          }}
        />
      </Box>
    </Box>
  );
};

// ── Working Day Template dialog ────────────────────────────────────────────────

const WorkingDayTemplateDialog = ({
  open,
  onClose,
  onSubmit,
  editingRow,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IConfigWorkingDayTemplate, 'id'>) => void;
  editingRow: IConfigWorkingDayTemplate | null;
}) => {
  const [form, setForm] = useState<Omit<IConfigWorkingDayTemplate, 'id'>>({ ...EMPTY_FORM });

  useEffect(() => {
    if (!open) return;
    setForm(
      editingRow
        ? {
            name: editingRow.name,
            description: editingRow.description,
            mondayHours: editingRow.mondayHours,
            tuesdayHours: editingRow.tuesdayHours,
            wednesdayHours: editingRow.wednesdayHours,
            thursdayHours: editingRow.thursdayHours,
            fridayHours: editingRow.fridayHours,
            saturdayHours: editingRow.saturdayHours,
            sundayHours: editingRow.sundayHours,
          }
        : { ...EMPTY_FORM },
    );
  }, [open, editingRow]);

  const setDay = (key: DayKey, v: number) => setForm((f) => ({ ...f, [key]: v }));

  const totalHours = DAY_META.reduce((s, d) => s + (form[d.key] ?? 0), 0);
  const workingDays = DAY_META.filter((d) => (form[d.key] ?? 0) > 0).length;
  const avgHours = workingDays > 0 ? (totalHours / workingDays).toFixed(1) : '—';

  const healthColor =
    totalHours === 0
      ? 'text.disabled'
      : totalHours <= 40
        ? '#16a34a'
        : totalHours <= 50
          ? '#d97706'
          : '#dc2626';
  const healthLabel =
    totalHours === 0
      ? 'No hours set'
      : totalHours <= 40
        ? 'Standard'
        : totalHours <= 50
          ? 'Extended'
          : 'Overloaded';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* ── Hero header ── */}
      <Box
        sx={{
          position: 'relative',
          px: 3.5,
          py: 3,
          background: `linear-gradient(135deg, #5b21b6 0%, ${ACCENT} 50%, #be185d 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: 120,
            width: 140,
            height: 140,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <ViewWeekIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.2 }}
            >
              {editingRow ? 'Edit Working Day Template' : 'New Working Day Template'}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', mt: 0.4 }}>
              {editingRow
                ? `Editing "${editingRow.name}"`
                : 'Define a reusable weekly working hours schedule'}
            </Typography>
          </Box>

          {/* Live total badge */}
          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              {totalHours}
            </Typography>
            <Typography
              sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}
            >
              hrs / week
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* ── Name + Description ── */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='Template Name'
              size='small'
              required
              sx={{ flex: 1 }}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='e.g. Standard 5-Day Week'
            />
            <TextField
              label='Description'
              size='small'
              sx={{ flex: 2 }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder='Optional — brief note about this schedule'
            />
          </Box>

          {/* ── Section divider ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 1,
                bgcolor: alpha(ACCENT, 0.07),
                border: `1px solid ${alpha(ACCENT, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <ViewWeekIcon sx={{ fontSize: '0.75rem', color: ACCENT }} />
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: ACCENT,
                  textTransform: 'uppercase',
                }}
              >
                Weekly Schedule
              </Typography>
            </Box>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          {/* ── Day cards grid ── */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
            {DAY_META.map((day) => (
              <DayCard
                key={day.key}
                day={day}
                hours={form[day.key] ?? 0}
                onChange={(v) => setDay(day.key, v)}
              />
            ))}
          </Box>

          {/* ── Summary strip ── */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(ACCENT, 0.04),
              border: `1px solid ${alpha(ACCENT, 0.12)}`,
            }}
          >
            {[
              {
                icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                label: 'Total Hours',
                value: `${totalHours}h`,
                color: healthColor,
              },
              {
                icon: <ViewWeekIcon sx={{ fontSize: '1rem' }} />,
                label: 'Working Days',
                value: workingDays.toString(),
                color: workingDays > 0 ? '#2563eb' : 'text.disabled',
              },
              {
                icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                label: 'Avg Daily Hours',
                value: avgHours === '—' ? '—' : `${avgHours}h`,
                color: 'text.primary',
              },
              {
                icon: <CalendarMonthIcon sx={{ fontSize: '1rem' }} />,
                label: 'Schedule Type',
                value: healthLabel,
                color: healthColor,
              },
            ].map(({ icon, label, value, color }) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    color,
                    mb: 0.25,
                  }}
                >
                  {icon}
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color }}>{value}</Typography>
                </Box>
                <Typography variant='caption' color='text.disabled' fontSize='0.68rem'>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={() => onSubmit(form)}
          disabled={!form.name.trim()}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 140,
            background: `linear-gradient(135deg, #5b21b6, ${ACCENT})`,
            boxShadow: `0 4px 14px ${alpha(ACCENT, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, #4c1d95, #6b21a8)`,
              boxShadow: `0 6px 20px ${alpha(ACCENT, 0.5)}`,
            },
            '&:disabled': { background: 'action.disabledBackground' },
          }}
        >
          {editingRow ? 'Save Changes' : 'Add Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Working Day Templates section ─────────────────────────────────────────────

const fmtHours = (h: number) => (h > 0 ? `${h}h` : '—');

const HoursCell =
  (color: string) =>
  (v: unknown): React.ReactNode => {
    const h = Number(v ?? 0);
    return (
      <Typography
        variant='body2'
        fontSize='0.82rem'
        fontWeight={h > 0 ? 700 : 400}
        color={h > 0 ? color : 'text.disabled'}
      >
        {fmtHours(h)}
      </Typography>
    );
  };

const TotalCell = (v: unknown, row: IConfigWorkingDayTemplate): React.ReactNode => {
  const total = DAY_META.reduce((s, d) => s + (row[d.key] ?? 0), 0);
  return (
    <Chip
      label={`${total}h`}
      size='small'
      sx={{
        fontWeight: 800,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: '6px',
        bgcolor:
          total === 0 ? 'grey.100' : total <= 40 ? alpha('#16a34a', 0.12) : alpha('#d97706', 0.12),
        color: total === 0 ? 'text.disabled' : total <= 40 ? '#16a34a' : '#d97706',
      }}
    />
  );
};

const WorkingDayTemplates = () => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkingDayTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkingDayTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (apiCAL?.workingDayTemplates) setRows(apiCAL.workingDayTemplates);
  }, [apiCAL]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const save = (next: IConfigWorkingDayTemplate[]) => {
    setRows(next);
    saveSection('calendars', {
      workingDayTemplates: next,
      holidayCalendars: apiCAL?.holidayCalendars ?? [],
      bankHolidays: apiCAL?.bankHolidays ?? [],
      workingCalendars: apiCAL?.workingCalendars ?? [],
      workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
      composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
      calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
      calendarConsultants: apiCAL?.calendarConsultants ?? [],
    });
  };

  const handleSubmit = (data: Omit<IConfigWorkingDayTemplate, 'id'>) => {
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...data } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkingDayTemplate = { id: `wdt_${Date.now()}`, ...data };
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

  const mkHours = HoursCell(ACCENT);

  const columns: Column<IConfigWorkingDayTemplate>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 160,
      format: (v) => (
        <Typography variant='body2' fontWeight={700} fontSize='0.82rem'>
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (v) => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 220 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
    { id: 'mondayHours', label: 'Monday', minWidth: 80, format: mkHours },
    { id: 'tuesdayHours', label: 'Tuesday', minWidth: 80, format: mkHours },
    { id: 'wednesdayHours', label: 'Wednesday', minWidth: 90, format: mkHours },
    { id: 'thursdayHours', label: 'Thursday', minWidth: 85, format: mkHours },
    { id: 'fridayHours', label: 'Friday', minWidth: 75, format: mkHours },
    { id: 'saturdayHours', label: 'Saturday', minWidth: 85, format: HoursCell('#ea580c') },
    { id: 'sundayHours', label: 'Sunday', minWidth: 80, format: HoursCell('#dc2626') },
    { id: 'total', label: 'Total Working Hours', minWidth: 140, format: TotalCell },
  ];

  return (
    <>
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
              <ViewWeekIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Working Day Templates</Typography>
              <Typography className={classes.sectionSubtitle}>
                Define reusable weekly working hour schedules for SLA and calendar calculations
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* Toolbar */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!selectedRow ? (
                <Tooltip title='Add new working day template'>
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
                      bgcolor: ACCENT,
                      '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
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
                      bgcolor: ACCENT,
                      '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
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
                  <Divider
                    orientation='vertical'
                    flexItem
                    className={classes.toolbarDivider}
                    sx={{ mx: 0.5 }}
                  />
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

            {selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {/* Table */}
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
      </Accordion>

      <WorkingDayTemplateDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        editingRow={editingRow}
      />

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Day Template'
        itemName={selectedRow?.name}
      />
    </>
  );
};

// ── Holiday Calendar section ──────────────────────────────────────────────────

const ACCENT_HC = '#0369a1';
const ACCENT_BH = '#7c3aed';

type HCActivePanel = 'none' | 'bankHolidays';

const EMPTY_HC_FORM = { name: '', description: '' };
const EMPTY_BH_FORM = {
  calendarName: '',
  calendarYear: new Date().getFullYear(),
  date: '',
  day: '',
  holidayDescription: '',
};

const dayFromDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

// ── Bank Holidays sub-panel (Timesheets AssocPanel pattern) ───────────────────

const BankHolidaysPanel = ({
  calendarRow,
  allBankHolidays,
  onSave,
  onBack,
}: {
  calendarRow: IConfigHolidayCalendar | null;
  allBankHolidays: IConfigBankHoliday[];
  onSave: (next: IConfigBankHoliday[]) => void;
  onBack: () => void;
}) => {
  const rows = calendarRow
    ? allBankHolidays.filter((b) => b.calendarName === calendarRow.name)
    : allBankHolidays;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigBankHoliday | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bhForm, setBhForm] = useState({ ...EMPTY_BH_FORM });

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.holidayDescription.toLowerCase().includes(search.toLowerCase()) ||
          r.date.toLowerCase().includes(search.toLowerCase()) ||
          r.day.toLowerCase().includes(search.toLowerCase()) ||
          String(r.calendarYear).includes(search),
      )
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRow) {
      setBhForm({
        calendarName: editingRow.calendarName,
        calendarYear: editingRow.calendarYear,
        date: editingRow.date,
        day: editingRow.day,
        holidayDescription: editingRow.holidayDescription,
      });
    } else {
      setBhForm({ ...EMPTY_BH_FORM, calendarName: calendarRow?.name ?? '' });
    }
  }, [dialogOpen, editingRow, calendarRow]);

  const handleDateChange = (d: Dayjs | null) => {
    const iso = d && d.isValid() ? d.format('YYYY-MM-DD') : '';
    setBhForm((f) => ({
      ...f,
      date: iso,
      day: iso ? dayFromDate(iso) : '',
      calendarYear: iso ? d!.year() : f.calendarYear,
    }));
  };

  const handleSubmit = () => {
    if (!bhForm.date.trim() || !bhForm.holidayDescription.trim()) return;
    let next: IConfigBankHoliday[];
    if (editingRow) {
      next = allBankHolidays.map((b) =>
        b.id === editingRow.id ? { ...editingRow, ...bhForm } : b,
      );
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigBankHoliday = { id: `bh_${Date.now()}`, ...bhForm };
      next = [...allBankHolidays, n];
      setSelectedId(n.id);
    }
    onSave(next);
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    onSave(allBankHolidays.filter((b) => b.id !== selectedRow.id));
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const panelTitle = calendarRow
    ? `Bank Holidays — ${calendarRow.name}`
    : 'Bank Holidays (All Calendars)';

  const bhColumns: Column<IConfigBankHoliday>[] = [
    {
      id: 'calendarYear',
      label: 'Calendar Year',
      minWidth: 130,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v)}
          size='small'
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            bgcolor: alpha(ACCENT_BH, 0.1),
            color: ACCENT_BH,
          }}
        />
      ),
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.82rem' fontWeight={600}>
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
      id: 'holidayDescription',
      label: 'Holiday Description',
      minWidth: 220,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontSize='0.8rem' noWrap sx={{ maxWidth: 300 }}>
          {String(v || '—')}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_BH}
        icon={<BeachAccessIcon fontSize='small' />}
        title={panelTitle}
        onBack={onBack}
      />
      <PanelToolbar
        accent={ACCENT_BH}
        selectedLabel={
          selectedRow ? `${selectedRow.date} — ${selectedRow.holidayDescription}` : null
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
      <PanelTable accent={ACCENT_BH}>
        <DataTable
          columns={bhColumns}
          data={filtered}
          rowKey='id'
          searchable={false}
          initialRowsPerPage={10}
          onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
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
        icon={<BeachAccessIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_BH}
        title='Bank Holiday'
        submitDisabled={!bhForm.date.trim() || !bhForm.holidayDescription.trim()}
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          value={bhForm.calendarName}
          onChange={(e) => setBhForm((f) => ({ ...f, calendarName: e.target.value }))}
          disabled={!!calendarRow}
          placeholder='Calendar this holiday belongs to'
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Date *'
            value={bhForm.date ? dayjs(bhForm.date) : null}
            onChange={handleDateChange}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Day'
            size='small'
            sx={{ flex: 1 }}
            value={bhForm.day}
            disabled
            placeholder='Auto-derived from date'
          />
          <TextField
            label='Calendar Year'
            size='small'
            sx={{ flex: 1 }}
            value={bhForm.calendarYear}
            disabled
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        <TextField
          label='Holiday Description'
          size='small'
          fullWidth
          required
          value={bhForm.holidayDescription}
          onChange={(e) => setBhForm((f) => ({ ...f, holidayDescription: e.target.value }))}
          placeholder='e.g. Christmas Day'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Bank Holiday'
        itemName={
          selectedRow ? `${selectedRow.date} — ${selectedRow.holidayDescription}` : undefined
        }
      />
    </Box>
  );
};

// ── Holiday Calendar accordion ────────────────────────────────────────────────

const HolidayCalendar = () => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigHolidayCalendar[]>([]);
  const [bankHolidays, setBankHolidays] = useState<IConfigBankHoliday[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigHolidayCalendar | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hcForm, setHcForm] = useState({ ...EMPTY_HC_FORM });
  const [activePanel, setActivePanel] = useState<HCActivePanel>('none');

  const panelActive = activePanel !== 'none';

  useEffect(() => {
    if (apiCAL?.holidayCalendars) setRows(apiCAL.holidayCalendars);
    if (apiCAL?.bankHolidays) setBankHolidays(apiCAL.bankHolidays);
  }, [apiCAL]);

  useEffect(() => {
    if (!dialogOpen) return;
    setHcForm(
      editingRow
        ? { name: editingRow.name, description: editingRow.description }
        : { ...EMPTY_HC_FORM },
    );
  }, [dialogOpen, editingRow]);

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const calBase = () => ({
    workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
    holidayCalendars: rows,
    bankHolidays,
  });

  const save = (nextRows: IConfigHolidayCalendar[], nextBH?: IConfigBankHoliday[]) => {
    const bh = nextBH ?? bankHolidays;
    setRows(nextRows);
    if (nextBH) setBankHolidays(nextBH);
    saveSection('calendars', {
      workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
      holidayCalendars: nextRows,
      bankHolidays: bh,
      workingCalendars: apiCAL?.workingCalendars ?? [],
      workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
      composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
      calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
      calendarConsultants: apiCAL?.calendarConsultants ?? [],
    });
  };

  const handleSubmit = () => {
    if (!hcForm.name.trim()) return;
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...hcForm } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigHolidayCalendar = { id: `hc_${Date.now()}`, ...hcForm };
      save([...rows, n]);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    // Also remove associated bank holidays
    const nextBH = bankHolidays.filter((b) => b.calendarName !== selectedRow.name);
    save(
      rows.filter((r) => r.id !== selectedRow.id),
      nextBH,
    );
    setSelectedId(null);
    setDeleteOpen(false);
  };

  const hcColumns: Column<IConfigHolidayCalendar>[] = [
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
      minWidth: 260,
      format: (v): React.ReactNode => (
        <Typography
          variant='body2'
          color='text.secondary'
          fontSize='0.8rem'
          noWrap
          sx={{ maxWidth: 300 }}
        >
          {String(v || '—')}
        </Typography>
      ),
    },
    {
      id: 'id',
      label: 'Holidays',
      minWidth: 90,
      format: (_v, row): React.ReactNode => {
        const count = bankHolidays.filter(
          (b) => b.calendarName === (row as IConfigHolidayCalendar).name,
        ).length;
        return (
          <Chip
            label={count}
            size='small'
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '6px',
              bgcolor: count > 0 ? alpha(ACCENT_BH, 0.1) : 'grey.100',
              color: count > 0 ? ACCENT_BH : 'text.disabled',
            }}
          />
        );
      },
    },
  ];

  return (
    <>
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: ACCENT_HC,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CalendarMonthIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Holiday Calendar</Typography>
              <Typography className={classes.sectionSubtitle}>
                Manage holiday calendars and their public bank holidays
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          {/* Toolbar */}
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!panelActive &&
                (!selectedRow ? (
                  <Tooltip title='Add new holiday calendar'>
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
                        bgcolor: ACCENT_HC,
                        '&:hover': { bgcolor: alpha(ACCENT_HC, 0.85) },
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
                        bgcolor: ACCENT_HC,
                        '&:hover': { bgcolor: alpha(ACCENT_HC, 0.85) },
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
                  </>
                ))}

              <Divider
                orientation='vertical'
                flexItem
                className={classes.toolbarDivider}
                sx={{ mx: 0.5 }}
              />

              <Button
                size='small'
                startIcon={<BeachAccessIcon />}
                variant={activePanel === 'bankHolidays' ? 'contained' : 'outlined'}
                disabled={false}
                onClick={() =>
                  setActivePanel((p) => (p === 'bankHolidays' ? 'none' : 'bankHolidays'))
                }
                sx={{
                  textTransform: 'none',
                  borderColor: ACCENT_BH,
                  color: activePanel === 'bankHolidays' ? '#fff' : ACCENT_BH,
                  bgcolor: activePanel === 'bankHolidays' ? ACCENT_BH : undefined,
                  '&:hover': {
                    bgcolor:
                      activePanel === 'bankHolidays'
                        ? alpha(ACCENT_BH, 0.85)
                        : alpha(ACCENT_BH, 0.07),
                    borderColor: ACCENT_BH,
                  },
                }}
              >
                View Bank Holidays
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
                          <SearchIcon fontSize='small' />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            </Box>

            {!panelActive && selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {!panelActive && (
            <Paper elevation={1} className={classes.tablePaper}>
              <DataTable
                columns={hcColumns}
                data={filtered}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                activeRowKey={selectedId ?? undefined}
              />
            </Paper>
          )}

          {activePanel === 'bankHolidays' && (
            <BankHolidaysPanel
              calendarRow={selectedRow}
              allBankHolidays={bankHolidays}
              onSave={(nextBH) => save(rows, nextBH)}
              onBack={() => setActivePanel('none')}
            />
          )}
        </AccordionDetails>
      </Accordion>

      {/* Add/Edit dialog */}
      <ConfigFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingRow}
        icon={<CalendarMonthIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_HC}
        title='Holiday Calendar'
        submitDisabled={!hcForm.name.trim()}
      >
        <TextField
          label='Calendar Name'
          size='small'
          fullWidth
          required
          value={hcForm.name}
          onChange={(e) => setHcForm((f) => ({ ...f, name: e.target.value }))}
          placeholder='e.g. UK Public Holidays 2025'
        />
        <TextField
          label='Description'
          size='small'
          fullWidth
          value={hcForm.description}
          onChange={(e) => setHcForm((f) => ({ ...f, description: e.target.value }))}
          placeholder='Optional — brief note about this calendar'
        />
      </ConfigFormDialog>

      {/* Delete confirmation */}
      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Holiday Calendar'
        itemName={selectedRow?.name}
      />
    </>
  );
};

// ── Working Calendars section ─────────────────────────────────────────────────

const ACCENT_WC = '#0f766e';
const ACCENT_WT = '#2563eb';
const ACCENT_CT = '#7c3aed';
const ACCENT_WL = '#0891b2';
const ACCENT_CO = '#be185d';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type WCActivePanel = 'none' | 'workingTime' | 'composedTimes' | 'workLocations' | 'consultants';

const EMPTY_WC_FORM = { name: '', holidayCalendar: '', workingDayTemplate: '' };
const EMPTY_WT_FORM = {
  calendarName: '',
  dayOfWeek: 'Monday',
  startTime: '09:00',
  endTime: '17:00',
  isWorkingDay: true,
};
const EMPTY_CT_FORM = {
  calendarName: '',
  date: '',
  day: '',
  startTime: '09:00',
  endTime: '17:00',
  isWorkingDay: true,
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

// ── View Working Time sub-panel ───────────────────────────────────────────────

const WorkingTimePanel = ({
  calendarRow,
  allTimes,
  onSave,
  onBack,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allTimes: IConfigWorkingCalendarTime[];
  onSave: (next: IConfigWorkingCalendarTime[]) => void;
  onBack: () => void;
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
          r.startTime.includes(search) ||
          r.endTime.includes(search),
      )
    : rows;

  useEffect(() => {
    if (!dialogOpen) return;
    setWtForm(
      editingRow
        ? {
            calendarName: editingRow.calendarName,
            dayOfWeek: editingRow.dayOfWeek,
            startTime: editingRow.startTime,
            endTime: editingRow.endTime,
            isWorkingDay: editingRow.isWorkingDay,
          }
        : { ...EMPTY_WT_FORM, calendarName: calendarRow?.name ?? '' },
    );
  }, [dialogOpen, editingRow, calendarRow]);

  const handleSubmit = () => {
    if (!wtForm.calendarName.trim()) return;
    let next: IConfigWorkingCalendarTime[];
    if (editingRow) {
      next = allTimes.map((t) => (t.id === editingRow.id ? { ...editingRow, ...wtForm } : t));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkingCalendarTime = { id: `wt_${Date.now()}`, ...wtForm };
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
      id: 'startTime',
      label: 'Start Time',
      minWidth: 110,
      format: (v): React.ReactNode => (
        <Chip
          label={String(v || '—')}
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
      ),
    },
    {
      id: 'endTime',
      label: 'End Time',
      minWidth: 110,
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
  ];

  return (
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_WT}
        icon={<AccessTimeIcon fontSize='small' />}
        title={
          calendarRow ? `Working Times — ${calendarRow.name}` : 'Working Times (All Calendars)'
        }
        onBack={onBack}
      />
      <PanelToolbar
        accent={ACCENT_WT}
        selectedLabel={
          selectedRow
            ? `${selectedRow.dayOfWeek}  ${selectedRow.startTime}–${selectedRow.endTime}`
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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label='Start Time'
            type='time'
            size='small'
            sx={{ flex: 1 }}
            value={wtForm.startTime}
            onChange={(e) => setWtForm((f) => ({ ...f, startTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='End Time'
            type='time'
            size='small'
            sx={{ flex: 1 }}
            value={wtForm.endTime}
            onChange={(e) => setWtForm((f) => ({ ...f, endTime: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
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
            ? `${selectedRow.dayOfWeek} (${selectedRow.startTime}–${selectedRow.endTime})`
            : undefined
        }
      />
    </Box>
  );
};

// ── Compose Working Times sub-panel ──────────────────────────────────────────

const ComposedTimesPanel = ({
  calendarRow,
  allComposed,
  onSave,
  onBack,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allComposed: IConfigComposedWorkingTime[];
  onSave: (next: IConfigComposedWorkingTime[]) => void;
  onBack: () => void;
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
        onBack={onBack}
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
            label='Date *'
            value={ctForm.date ? dayjs(ctForm.date) : null}
            onChange={handleCtDateChange}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label='Day' size='small' sx={{ flex: 1 }} value={ctForm.day} disabled />
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
          placeholder='e.g. Reduced hours due to company event'
        />
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Composed Working Time'
        itemName={
          selectedRow
            ? `${selectedRow.date} (${selectedRow.startTime}–${selectedRow.endTime})`
            : undefined
        }
      />
    </Box>
  );
};

// ── Associated Work Locations sub-panel ───────────────────────────────────────

const WorkLocationsPanel = ({
  calendarRow,
  allLocations,
  onSave,
  onBack,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allLocations: IConfigCalendarWorkLocation[];
  onSave: (next: IConfigCalendarWorkLocation[]) => void;
  onBack: () => void;
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
        onBack={onBack}
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

// ── Associated Consultants sub-panel ─────────────────────────────────────────

const ConsultantsPanel = ({
  calendarRow,
  allConsultants,
  onSave,
  onBack,
}: {
  calendarRow: IConfigWorkingCalendar | null;
  allConsultants: IConfigCalendarConsultant[];
  onSave: (next: IConfigCalendarConsultant[]) => void;
  onBack: () => void;
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
        accent={ACCENT_CO}
        icon={<GroupIcon fontSize='small' />}
        title={
          calendarRow
            ? `Associated Consultants — ${calendarRow.name}`
            : 'Associated Consultants (All Calendars)'
        }
        onBack={onBack}
      />
      <PanelToolbar
        accent={ACCENT_CO}
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
      <PanelTable accent={ACCENT_CO}>
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
        accent={ACCENT_CO}
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

// ── Working Calendars accordion ───────────────────────────────────────────────

const WorkingCalendars = () => {
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
  const [activePanel, setActivePanel] = useState<WCActivePanel>('none');
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyName, setCopyName] = useState('');

  const panelActive = activePanel !== 'none';

  useEffect(() => {
    if (apiCAL?.workingCalendars) setRows(apiCAL.workingCalendars);
    if (apiCAL?.workingCalendarTimes) setWcTimes(apiCAL.workingCalendarTimes);
    if (apiCAL?.composedWorkingTimes) setComposedTimes(apiCAL.composedWorkingTimes);
    if (apiCAL?.calendarWorkLocations) setWorkLocations(apiCAL.calendarWorkLocations);
    if (apiCAL?.calendarConsultants) setConsultants(apiCAL.calendarConsultants);
  }, [apiCAL]);

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

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;
  const filtered = search
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.holidayCalendar.toLowerCase().includes(search.toLowerCase()) ||
          r.workingDayTemplate.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const calBase = () => ({
    workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
    holidayCalendars: apiCAL?.holidayCalendars ?? [],
    bankHolidays: apiCAL?.bankHolidays ?? [],
    workingCalendars: rows,
    workingCalendarTimes: wcTimes,
    composedWorkingTimes: composedTimes,
    calendarWorkLocations: workLocations,
    calendarConsultants: consultants,
  });

  const save = (
    updates: Partial<{
      workingCalendars: IConfigWorkingCalendar[];
      workingCalendarTimes: IConfigWorkingCalendarTime[];
      composedWorkingTimes: IConfigComposedWorkingTime[];
      calendarWorkLocations: IConfigCalendarWorkLocation[];
      calendarConsultants: IConfigCalendarConsultant[];
    }>,
  ) => {
    if (updates.workingCalendars) setRows(updates.workingCalendars);
    if (updates.workingCalendarTimes) setWcTimes(updates.workingCalendarTimes);
    if (updates.composedWorkingTimes) setComposedTimes(updates.composedWorkingTimes);
    if (updates.calendarWorkLocations) setWorkLocations(updates.calendarWorkLocations);
    if (updates.calendarConsultants) setConsultants(updates.calendarConsultants);
    saveSection('calendars', { ...calBase(), ...updates });
  };

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
            bgcolor: v ? alpha(ACCENT, 0.1) : 'grey.100',
            color: v ? ACCENT : 'text.disabled',
          }}
        />
      ),
    },
  ];

  const togglePanel = (panel: Exclude<WCActivePanel, 'none'>) =>
    setActivePanel((p) => (p === panel ? 'none' : panel));

  const panelBtn = (
    panel: Exclude<WCActivePanel, 'none'>,
    label: string,
    accent: string,
    Icon: React.ElementType,
  ) => (
    <Button
      size='small'
      startIcon={<Icon />}
      variant={activePanel === panel ? 'contained' : 'outlined'}
      onClick={() => togglePanel(panel)}
      sx={{
        textTransform: 'none',
        borderColor: accent,
        color: activePanel === panel ? '#fff' : accent,
        bgcolor: activePanel === panel ? accent : undefined,
        '&:hover': {
          bgcolor: activePanel === panel ? alpha(accent, 0.85) : alpha(accent, 0.07),
          borderColor: accent,
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <>
      <Accordion className={classes.sectionAccordion} elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
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
              <CalendarTodayIcon sx={{ color: '#fff', fontSize: '1rem' }} />
            </Box>
            <Box>
              <Typography className={classes.sectionTitle}>Working Calendars</Typography>
              <Typography className={classes.sectionSubtitle}>
                Define working calendars with schedules, exceptions, and resource associations
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 2 }}>
          <Paper variant='outlined' className={classes.actionToolbar}>
            <Box className={classes.toolbarButtons}>
              {!panelActive &&
                (!selectedRow ? (
                  <Tooltip title='Add new working calendar'>
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
                        bgcolor: ACCENT_WC,
                        '&:hover': { bgcolor: alpha(ACCENT_WC, 0.85) },
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
                        bgcolor: ACCENT_WC,
                        '&:hover': { bgcolor: alpha(ACCENT_WC, 0.85) },
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
                  </>
                ))}

              <Divider
                orientation='vertical'
                flexItem
                className={classes.toolbarDivider}
                sx={{ mx: 0.5 }}
              />

              {panelBtn('workingTime', 'View Working Time', ACCENT_WT, AccessTimeIcon)}
              <Tooltip title={!selectedRow ? 'Select a calendar to copy' : ''}>
                <span>
                  <Button
                    size='small'
                    startIcon={<ContentCopyIcon />}
                    variant='outlined'
                    disabled={!selectedRow}
                    onClick={() => {
                      setCopyName(`${selectedRow!.name} (Copy)`);
                      setCopyDialogOpen(true);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderColor: ACCENT_WC,
                      color: ACCENT_WC,
                      '&:hover': { bgcolor: alpha(ACCENT_WC, 0.07), borderColor: ACCENT_WC },
                    }}
                  >
                    Copy Calendar
                  </Button>
                </span>
              </Tooltip>
              {panelBtn('composedTimes', 'Compose Working Times', ACCENT_CT, EventNoteIcon)}
              {panelBtn('workLocations', 'Associated Work Locations', ACCENT_WL, BusinessIcon)}
              {panelBtn('consultants', 'Associated Consultants', ACCENT_CO, GroupIcon)}

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
                          <SearchIcon fontSize='small' />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            </Box>

            {!panelActive && selectedRow && (
              <Typography
                variant='caption'
                color='text.secondary'
                className={classes.selectionInfo}
              >
                Selected: <strong>{selectedRow.name}</strong>&nbsp;·&nbsp;
                <Link component='button' variant='caption' onClick={() => setSelectedId(null)}>
                  Clear
                </Link>
              </Typography>
            )}
          </Paper>

          {!panelActive && (
            <Paper elevation={1} className={classes.tablePaper}>
              <DataTable
                columns={wcCols}
                data={filtered}
                rowKey='id'
                searchable={false}
                initialRowsPerPage={10}
                onRowClick={(row) => setSelectedId((p) => (p === row.id ? null : row.id))}
                activeRowKey={selectedId ?? undefined}
              />
            </Paper>
          )}

          {activePanel === 'workingTime' && (
            <WorkingTimePanel
              calendarRow={selectedRow}
              allTimes={wcTimes}
              onSave={(next) => save({ workingCalendarTimes: next })}
              onBack={() => setActivePanel('none')}
            />
          )}
          {activePanel === 'composedTimes' && (
            <ComposedTimesPanel
              calendarRow={selectedRow}
              allComposed={composedTimes}
              onSave={(next) => save({ composedWorkingTimes: next })}
              onBack={() => setActivePanel('none')}
            />
          )}
          {activePanel === 'workLocations' && (
            <WorkLocationsPanel
              calendarRow={selectedRow}
              allLocations={workLocations}
              onSave={(next) => save({ calendarWorkLocations: next })}
              onBack={() => setActivePanel('none')}
            />
          )}
          {activePanel === 'consultants' && (
            <ConsultantsPanel
              calendarRow={selectedRow}
              allConsultants={consultants}
              onSave={(next) => save({ calendarConsultants: next })}
              onBack={() => setActivePanel('none')}
            />
          )}
        </AccordionDetails>
      </Accordion>

      {/* Add / Edit working calendar dialog */}
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
        submitDisabled={!wcForm.name.trim()}
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

      {/* Copy calendar dialog */}
      <Dialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${alpha(ACCENT_WC, 0.85)}, ${ACCENT_WC})`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
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
            <ContentCopyIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}
            >
              Copy Calendar
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>
              Duplicates all working times, exceptions, and associations
            </Typography>
          </Box>
        </Box>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Source Calendar'
              size='small'
              fullWidth
              value={selectedRow?.name ?? ''}
              disabled
            />
            <TextField
              label='New Calendar Name'
              size='small'
              fullWidth
              required
              autoFocus
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              placeholder='e.g. UK Standard 2026'
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setCopyDialogOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={!copyName.trim()}
            onClick={handleCopy}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: ACCENT_WC,
              '&:hover': { bgcolor: alpha(ACCENT_WC, 0.85) },
              minWidth: 120,
            }}
          >
            Copy Calendar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Working Calendar'
        itemName={selectedRow?.name}
      />
    </>
  );
};

// ── Page root ─────────────────────────────────────────────────────────────────

const Calendars = () => (
  <Box sx={{ p: 3, width: '100%' }}>
    <WorkingDayTemplates />
    <HolidayCalendar />
    <WorkingCalendars />
  </Box>
);

export default Calendars;
