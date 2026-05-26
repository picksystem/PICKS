import { ReactNode } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type {
  IConfigHolidayCalendar,
  IConfigBankHoliday,
  IConfigWorkingCalendar,
} from '@serviceops/interfaces';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const ACCENT = '#0369a1';

// ── Table Config Types ─────────────────────────────────────────────────────────

export interface TableField {
  name: string;
  label: string;
  required?: boolean;
  bold?: boolean;
  minWidth?: number;
  defaultValue?: string;
}

export interface TableConfig {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  entity: string;
  fields: TableField[];
}

export type CalendarActiveView = 'holidayCalendar' | 'bankHoliday' | 'workingCalendar';

// ── Table Config Mappings ───────────────────────────────────────────────────────

export const TABLE_CONFIG: Record<CalendarActiveView, TableConfig> = {
  holidayCalendar: {
    title: 'Holiday Calendars',
    subtitle: 'Define a holiday calendar with its name and description',
    accent: ACCENT,
    icon: <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Holiday Calendar',
    fields: [
      { name: 'name', label: 'Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
    ],
  },
  bankHoliday: {
    title: 'Bank Holidays',
    subtitle: 'Add a bank holiday to the selected calendar',
    accent: ACCENT,
    icon: <BeachAccessIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Bank Holiday',
    fields: [
      { name: 'calendarName', label: 'Calendar Name', required: true, bold: true },
      { name: 'holidayDescription', label: 'Holiday Description', required: true },
      { name: 'date', label: 'Date' },
      { name: 'day', label: 'Day' },
      { name: 'calendarYear', label: 'Calendar Year' },
    ],
  },
  workingCalendar: {
    title: 'Working Calendars',
    subtitle: 'Define a working calendar with holiday calendar and working day template',
    accent: ACCENT,
    icon: <EventAvailableIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Working Calendar',
    fields: [
      { name: 'name', label: 'Calendar Name', required: true, bold: true },
      { name: 'holidayCalendar', label: 'Holiday Calendar' },
      { name: 'workingDayTemplate', label: 'Working Day Template' },
    ],
  },
};

// ── Column Definitions (for custom rendering) ─────────────────────────────────

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

export const workingCalendarColumns: Column<IConfigWorkingCalendar>[] = [
  { id: 'name', label: 'Calendar Name', minWidth: 180, format: mkCell(true) },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 180, format: mkCell() },
  { id: 'workingDayTemplate', label: 'Working Day Template', minWidth: 180, format: mkCell() },
];
