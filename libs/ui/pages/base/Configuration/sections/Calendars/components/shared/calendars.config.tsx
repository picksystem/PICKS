import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type { IConfigHolidayCalendar, IConfigBankHoliday } from '@serviceops/interfaces';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const CAL_COLORS = {
  calendar: '#0369a1',
} as const;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const holidayCalendarColumns: Column<IConfigHolidayCalendar>[] = [
  { id: 'name', label: 'Name', minWidth: 200, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 260, format: mkDescCell },
];

export const bankHolidayColumns: Column<IConfigBankHoliday>[] = [
  { id: 'calendarYear', label: 'Calendar Year', minWidth: 130, format: mkCell() },
  { id: 'date', label: 'Date', minWidth: 120, format: mkCell() },
  { id: 'day', label: 'Day', minWidth: 110, format: mkCell() },
  { id: 'holidayDescription', label: 'Holiday', minWidth: 200, format: mkCell() },
];

// ── Form Config ────────────────────────────────────────────────────────────────

export const CAL_FORM_LABELS = {
  holiday: {
    title: 'Holiday Calendar',
    subtitle: 'Define a holiday calendar with its name and description',
    entity: 'Holiday Calendar',
    fields: [
      {
        name: 'name',
        label: 'Calendar Name',
        required: true,
        placeholder: 'e.g. UK Public Holidays 2025',
      },
      {
        name: 'description',
        label: 'Description',
        multiline: true,
        minRows: 2,
        placeholder: 'Optional — brief note about this calendar',
      },
    ],
  },
  bankHoliday: {
    title: 'Bank Holiday',
    subtitle: 'Add a bank holiday to the selected calendar',
    entity: 'Bank Holiday',
    fields: [
      {
        name: 'calendarName',
        label: 'Calendar Name',
        required: true,
        placeholder: 'e.g. UK Public Holidays 2025',
      },
      {
        name: 'holidayDescription',
        label: 'Holiday Description',
        required: true,
        placeholder: 'e.g. New Years Day',
      },
      { name: 'date', label: 'Date', placeholder: 'e.g. 2025-01-01' },
      { name: 'day', label: 'Day', placeholder: 'e.g. Monday' },
      { name: 'calendarYear', label: 'Calendar Year', placeholder: 'e.g. 2025' },
    ],
  },
} as const;
