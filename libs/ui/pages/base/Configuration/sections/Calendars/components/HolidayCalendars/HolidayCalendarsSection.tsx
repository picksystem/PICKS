import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@serviceops/component';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IConfigHolidayCalendar, IConfigBankHoliday } from '@serviceops/interfaces';
import { useStyles } from '../../styles';
import { useConfiguration } from '@serviceops/pages/base/Configuration/hooks/useConfiguration';
import {
  GenericCRUDPanel,
  RowData,
} from '@serviceops/pages/base/Configuration/shared/GenericTablePanel';
import {
  CAL_COLORS,
  CAL_FORM_LABELS,
  holidayCalendarColumns,
  bankHolidayColumns,
} from '../shared/calendars.config';

// ── Types ─────────────────────────────────────────────────────────────────────

type HCActiveView = 'holiday' | 'bankHolidays';

// ── Holiday Calendar Panel ─────────────────────────────────────────────────────

const HolidayCalendarPanel = ({
  holidayRows,
  bankHolidays,
  onSave,
}: {
  holidayRows: IConfigHolidayCalendar[];
  bankHolidays: IConfigBankHoliday[];
  onSave: (next: IConfigHolidayCalendar[]) => void;
}) => {
  const config = {
    title: 'Holiday Calendars',
    accent: CAL_COLORS.calendar,
    icon: <CalendarMonthIcon fontSize='small' />,
    panelTitle: 'Holiday Calendars',
    columns: holidayCalendarColumns,
    formConfig: CAL_FORM_LABELS.holiday,
    searchFields: ['name', 'description'],
    getSelectedLabel: (row: RowData) => String(row.name ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'hc',
  };

  return <GenericCRUDPanel config={config} data={holidayRows} onSave={onSave} />;
};

// ── Bank Holidays Panel ────────────────────────────────────────────────────────

const BankHolidaysPanel = ({
  allBankHolidays,
  onSave,
}: {
  allBankHolidays: IConfigBankHoliday[];
  onSave: (next: IConfigBankHoliday[]) => void;
}) => {
  const config = {
    title: 'Bank Holidays',
    accent: CAL_COLORS.calendar,
    icon: <BeachAccessIcon fontSize='small' />,
    panelTitle: 'Bank Holidays/Public Holidays (All Calendars)',
    columns: bankHolidayColumns,
    formConfig: CAL_FORM_LABELS.bankHoliday,
    searchFields: ['calendarName', 'holidayDescription', 'date', 'day'],
    getSelectedLabel: (row: RowData) => String(row.holidayDescription ?? ''),
    getId: (row: RowData) => String(row.id ?? ''),
    idPrefix: 'bh',
  };

  return <GenericCRUDPanel config={config} data={allBankHolidays} onSave={onSave} />;
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

  const handleSave = (nextRows: IConfigHolidayCalendar[]) => {
    if (holidayRows !== undefined) {
      setHolidayRows(nextRows);
    }
    if (onDataChange) {
      onDataChange(nextRows, bankHolidaysFinal);
    } else {
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: nextRows,
        bankHolidays: bankHolidaysFinal,
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
      saveSection('calendars', {
        workingDayTemplates: apiCAL?.workingDayTemplates ?? [],
        holidayCalendars: holidayRowsFinal,
        bankHolidays: next,
        workingCalendars: apiCAL?.workingCalendars ?? [],
        workingCalendarTimes: apiCAL?.workingCalendarTimes ?? [],
        composedWorkingTimes: apiCAL?.composedWorkingTimes ?? [],
        calendarWorkLocations: apiCAL?.calendarWorkLocations ?? [],
        calendarConsultants: apiCAL?.calendarConsultants ?? [],
      });
    }
  };

  return (
    <Accordion defaultExpanded className={classes.sectionAccordion} elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: CAL_COLORS.calendar,
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
                bgcolor: activeView === 'holiday' ? '#2d5ebb' : undefined,
                color: activeView === 'holiday' ? '#fff' : '#2d5ebb',
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
                bgcolor: activeView === 'bankHolidays' ? '#2d5ebb' : undefined,
                color: activeView === 'bankHolidays' ? '#fff' : '#2d5ebb',
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
          <BankHolidaysPanel allBankHolidays={bankHolidaysFinal} onSave={handleSaveBankHolidays} />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export { HolidayCalendarsSection };
