import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  DataTable,
  Column,
} from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails, alpha } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { IConfigHolidayCalendar, IConfigBankHoliday } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import {
  ConfigFormDialog,
  ConfigDeleteDialog,
} from '@serviceops/pages/base/Configuration/dialogs/ConfigDialogs/ConfigDialogs';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import { ACCENT_HC, ACCENT_BH } from '../shared';
import { PanelHeader, PanelTable, PanelToolbar } from '../../../Categorization/components/shared';

const EMPTY_HC_FORM = { name: '', description: '' };
const EMPTY_BH_FORM = {
  calendarName: '',
  calendarYear: new Date().getFullYear(),
  date: '',
  day: '',
  holidayDescription: '',
};

type HCActiveView = 'holiday' | 'bankHolidays';

const dayFromDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

// ── Holiday Calendar Panel ─────────────────────────────────────────────────────

interface HolidayCalendarPanelProps {
  holidayRows: IConfigHolidayCalendar[];
  bankHolidays: IConfigBankHoliday[];
  onSave: (nextRows: IConfigHolidayCalendar[], nextBH?: IConfigBankHoliday[]) => void;
}

const HolidayCalendarPanel = ({
  holidayRows: initialRows,
  bankHolidays: initialBH,
  onSave,
}: HolidayCalendarPanelProps) => {
  const [rows, setRows] = useState<IConfigHolidayCalendar[]>([]);
  const [bankHolidays, setBankHolidays] = useState<IConfigBankHoliday[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IConfigHolidayCalendar | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hcForm, setHcForm] = useState({ ...EMPTY_HC_FORM });

  useEffect(() => {
    setRows(initialRows);
    setBankHolidays(initialBH);
  }, [initialRows, initialBH]);

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

  const handleSubmit = () => {
    if (!hcForm.name.trim()) return;
    if (editingRow) {
      const next = rows.map((r) => (r.id === editingRow.id ? { ...editingRow, ...hcForm } : r));
      setRows(next);
      onSave(next);
      setSelectedId(editingRow.id);
    } else {
      const n: IConfigHolidayCalendar = { id: `hc_${Date.now()}`, ...hcForm };
      const next = [...rows, n];
      setRows(next);
      onSave(next);
      setSelectedId(n.id);
    }
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const nextBH = bankHolidays.filter((b) => b.calendarName !== selectedRow.name);
    const next = rows.filter((r) => r.id !== selectedRow.id);
    setRows(next);
    setBankHolidays(nextBH);
    onSave(next, nextBH);
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
    <Box sx={{ mt: 1.5 }}>
      <PanelHeader
        accent={ACCENT_HC}
        icon={<CalendarMonthIcon fontSize='small' />}
        title='Holiday Calendars'
      />
      <PanelToolbar
        accent={ACCENT_HC}
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
      <PanelTable accent={ACCENT_HC}>
        <DataTable
          columns={hcColumns}
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

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Holiday Calendar'
        itemName={selectedRow?.name}
      />
    </Box>
  );
};

// ── Bank Holidays Panel ────────────────────────────────────────────────────────

interface BankHolidaysPanelProps {
  calendarRow: IConfigHolidayCalendar | null;
  allBankHolidays: IConfigBankHoliday[];
  onSave: (next: IConfigBankHoliday[]) => void;
}

const BankHolidaysPanel = ({ calendarRow, allBankHolidays, onSave }: BankHolidaysPanelProps) => {
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
    ? `Bank Holidays/Public Holidays — ${calendarRow.name}`
    : 'Bank Holidays/Public Holidays (All Calendars)';

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
      label: 'Holiday',
      minWidth: 200,
      format: (v): React.ReactNode => (
        <Typography variant='body2' fontWeight={600} fontSize='0.82rem'>
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
      />
      <PanelToolbar
        accent={ACCENT_BH}
        selectedLabel={selectedRow?.holidayDescription ?? null}
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
        icon={<BeachAccessIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />}
        accent={ACCENT_BH}
        title='Bank Holiday'
        submitDisabled={!bhForm.date.trim() || !bhForm.holidayDescription.trim()}
      >
        {editingRow ? (
          <TextField
            label='Calendar Name'
            size='small'
            fullWidth
            value={editingRow.calendarName}
            disabled
          />
        ) : (
          <TextField
            label='Calendar Name'
            size='small'
            fullWidth
            value={calendarRow?.name ?? ''}
            disabled
          />
        )}
        <TextField
          label='Holiday Description'
          size='small'
          fullWidth
          required
          value={bhForm.holidayDescription}
          onChange={(e) => setBhForm((f) => ({ ...f, holidayDescription: e.target.value }))}
          placeholder='e.g. New Years Day'
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Date'
            value={bhForm.date ? dayjs(bhForm.date) : null}
            onChange={handleDateChange}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
      </ConfigFormDialog>

      <ConfigDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        entityName='Bank Holiday'
        itemName={selectedRow?.holidayDescription}
      />
    </Box>
  );
};

// ── Holiday Calendars Section ─────────────────────────────────────────────────

interface HolidayCalendarsSectionProps {
  holidayRows?: IConfigHolidayCalendar[];
  bankHolidays?: IConfigBankHoliday[];
  onDataChange?: (
    holidayRows: IConfigHolidayCalendar[],
    bankHolidays: IConfigBankHoliday[],
  ) => void;
  onSaveBankHolidays?: (next: IConfigBankHoliday[]) => void;
}

const HolidayCalendarsSection = ({
  holidayRows,
  bankHolidays: initialBH,
  onDataChange,
  onSaveBankHolidays,
}: HolidayCalendarsSectionProps) => {
  const { classes } = useStyles();
  const { calendars: apiCAL, saveSection } = useConfiguration();

  const [holidayRowsState, setHolidayRows] = useState<IConfigHolidayCalendar[]>([]);
  const [bankHolidaysState, setBankHolidays] = useState<IConfigBankHoliday[]>([]);
  const [activeView, setActiveView] = useState<HCActiveView>('holiday');

  const holidayRowsFinal = holidayRows ?? holidayRowsState;
  const bankHolidaysFinal =
    bankHolidaysState.length > 0 ? bankHolidaysState : (initialBH ?? apiCAL?.bankHolidays ?? []);

  useEffect(() => {
    if (holidayRows !== undefined) {
      setHolidayRows(holidayRows);
    } else if (apiCAL?.holidayCalendars) {
      setHolidayRows(apiCAL.holidayCalendars);
    }
  }, [holidayRows, apiCAL]);

  useEffect(() => {
    if (initialBH !== undefined) {
      setBankHolidays(initialBH);
    } else if (apiCAL?.bankHolidays) {
      setBankHolidays(apiCAL.bankHolidays);
    }
  }, [initialBH, apiCAL]);

  const handleSave = (nextRows: IConfigHolidayCalendar[], nextBH?: IConfigBankHoliday[]) => {
    const bh = nextBH ?? bankHolidaysFinal;
    if (holidayRows !== undefined) {
      setHolidayRows(nextRows);
    }
    if (nextBH !== undefined) {
      setBankHolidays(nextBH);
    }
    if (onDataChange) {
      onDataChange(nextRows, bh);
    } else {
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
    }
  };

  const handleSaveBankHolidays = (next: IConfigBankHoliday[]) => {
    setBankHolidays(next);
    if (onSaveBankHolidays) {
      onSaveBankHolidays(next);
    } else {
      handleSave(holidayRowsFinal, next);
    }
  };

  return (
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
              variant={activeView === 'holiday' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('holiday')}
              startIcon={<CalendarMonthIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_HC,
                color: activeView === 'holiday' ? '#fff' : ACCENT_HC,
                bgcolor: activeView === 'holiday' ? ACCENT_HC : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'holiday' ? alpha(ACCENT_HC, 0.85) : alpha(ACCENT_HC, 0.08),
                  borderColor: ACCENT_HC,
                },
              }}
            >
              Holiday Calendar
            </Button>
            <Button
              size='small'
              variant={activeView === 'bankHolidays' ? 'contained' : 'outlined'}
              onClick={() => setActiveView('bankHolidays')}
              startIcon={<BeachAccessIcon />}
              sx={{
                textTransform: 'none',
                border: '1px solid',
                borderColor: ACCENT_BH,
                color: activeView === 'bankHolidays' ? '#fff' : ACCENT_BH,
                bgcolor: activeView === 'bankHolidays' ? ACCENT_BH : undefined,
                '&:hover': {
                  bgcolor:
                    activeView === 'bankHolidays' ? alpha(ACCENT_BH, 0.85) : alpha(ACCENT_BH, 0.08),
                  borderColor: ACCENT_BH,
                },
              }}
            >
              Bank Holidays
            </Button>
          </Box>
        </Paper>

        {activeView === 'holiday' && (
          <HolidayCalendarPanel
            holidayRows={holidayRowsFinal}
            bankHolidays={bankHolidaysFinal}
            onSave={handleSave}
          />
        )}
        {activeView === 'bankHolidays' && (
          <BankHolidaysPanel
            calendarRow={null}
            allBankHolidays={bankHolidaysFinal}
            onSave={handleSaveBankHolidays}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { HolidayCalendarsSection };
