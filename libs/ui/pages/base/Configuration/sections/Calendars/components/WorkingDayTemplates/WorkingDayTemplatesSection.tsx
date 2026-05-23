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
} from '@serviceops/component';
import {
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigWorkingDayTemplate } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { ConfigDeleteDialog } from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  DayCard,
  DAY_META,
  EMPTY_FORM,
  DayKey,
  WorkingDayTemplateForm,
  ACCENT_WDT,
} from '../shared';

interface WorkingDayTemplatesSectionProps {
  data?: IConfigWorkingDayTemplate[];
  onDataChange?: (data: IConfigWorkingDayTemplate[]) => void;
}

// ── Dialog ─────────────────────────────────────────────────────────────────────

const WorkingDayTemplateDialog = ({
  open,
  onClose,
  onSubmit,
  editingRow,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkingDayTemplateForm) => void;
  editingRow: IConfigWorkingDayTemplate | null;
}) => {
  const [form, setForm] = useState<WorkingDayTemplateForm>({ ...EMPTY_FORM });

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
      <Box
        sx={{
          position: 'relative',
          px: 3.5,
          py: 3,
          background: `linear-gradient(135deg, #5b21b6 0%, ${ACCENT_WDT} 50%, #be185d 100%)`,
          overflow: 'hidden',
        }}
      >
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 1,
                bgcolor: alpha('#2d5ebb', 0.07),
                border: `1px solid ${alpha('#2d5ebb', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <ViewWeekIcon sx={{ fontSize: '0.75rem', color: ACCENT_WDT }} />
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: ACCENT_WDT,
                  textTransform: 'uppercase',
                }}
              >
                Weekly Schedule
              </Typography>
            </Box>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

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

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha('#2d5ebb', 0.04),
              border: `1px solid ${alpha('#2d5ebb', 0.12)}`,
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
            background: `linear-gradient(135deg, #5b21b6, ${ACCENT_WDT})`,
            boxShadow: `0 4px 14px ${alpha('#2d5ebb', 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, #4c1d95, #6b21a8)`,
              boxShadow: `0 6px 20px ${alpha('#2d5ebb', 0.5)}`,
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

// ── Section ───────────────────────────────────────────────────────────────────

const WorkingDayTemplatesSection = ({ data, onDataChange }: WorkingDayTemplatesSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [rows, setRows] = useState<IConfigWorkingDayTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigWorkingDayTemplate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    } else if (apiCAL?.workingDayTemplates) {
      setRows(apiCAL.workingDayTemplates);
    }
  }, [data, apiCAL]);

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
    if (onDataChange) {
      onDataChange(next);
    } else {
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
    }
  };

  const handleSubmit = (formData: WorkingDayTemplateForm) => {
    if (editingRow) {
      save(rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...formData } : r)));
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigWorkingDayTemplate = { id: `wdt_${Date.now()}`, ...formData };
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

  const TotalCell = (_v: unknown, row: IConfigWorkingDayTemplate): React.ReactNode => {
    const total =
      (row.mondayHours ?? 0) +
      (row.tuesdayHours ?? 0) +
      (row.wednesdayHours ?? 0) +
      (row.thursdayHours ?? 0) +
      (row.fridayHours ?? 0) +
      (row.saturdayHours ?? 0) +
      (row.sundayHours ?? 0);
    return (
      <Chip
        label={`${total}h`}
        size='small'
        sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.78rem' }}
      />
    );
  };

  const mkHours = HoursCell(ACCENT_WDT);

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
                      bgcolor: '#2d5ebb',
                      '&:hover': { bgcolor: alpha('#2d5ebb', 0.85) },
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
                      bgcolor: alpha('#2d5ebb', 0.3),
                      mx: 0.75,
                      alignSelf: 'center',
                    }}
                  />
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ClearIcon />}
                    sx={{ textTransform: 'none' }}
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

export { WorkingDayTemplatesSection };
