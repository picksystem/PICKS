import { ReactNode } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type {
  IConfigHolidayCalendar,
  IConfigBankHoliday,
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
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
  defaultValue?: string | number | boolean;
  type?: 'text' | 'date' | 'number' | 'toggle';
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

// ── Working Calendar Table Configs ────────────────────────────────────────────

export const WORKING_TIMES_TABLE_CONFIG: TableConfig = {
  title: 'Working Times',
  subtitle: 'Configure working times per calendar and day of week',
  accent: ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Time',
  fields: [
    { name: 'calendarName', label: 'Calendar Name', required: true, bold: true },
    { name: 'dayOfWeek', label: 'Day of Week', required: true },
    { name: 'timeBlocks', label: 'Time Blocks' },
    { name: 'isWorkingDay', label: 'Is Working Day', type: 'toggle', defaultValue: true },
  ],
};

export const COMPOSED_TIMES_TABLE_CONFIG: TableConfig = {
  title: 'Composed Working Times',
  subtitle: 'View composed working times across all calendars',
  accent: ACCENT,
  icon: <EventNoteIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Composed Time',
  fields: [
    { name: 'calendarName', label: 'Calendar Name', required: true, bold: true },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'day', label: 'Day' },
    { name: 'startTime', label: 'Start Time' },
    { name: 'endTime', label: 'End Time' },
    { name: 'isWorkingDay', label: 'Is Working Day', type: 'toggle', defaultValue: false },
    { name: 'note', label: 'Note' },
  ],
};

export const WORK_LOCATIONS_TABLE_CONFIG: TableConfig = {
  title: 'Work Locations',
  subtitle: 'Configure work locations per calendar',
  accent: ACCENT,
  icon: <LocationOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Work Location',
  fields: [
    { name: 'calendarName', label: 'Calendar Name', required: true, bold: true },
    { name: 'workLocation', label: 'Work Location', required: true },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
    { name: 'effectiveTo', label: 'Effective To', type: 'date' },
  ],
};

export const CONSULTANTS_TABLE_CONFIG: TableConfig = {
  title: 'Associated Consultants',
  subtitle: 'Configure consultants per calendar',
  accent: ACCENT,
  icon: <PeopleIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant',
  fields: [
    { name: 'calendarName', label: 'Calendar Name', required: true, bold: true },
    { name: 'consultantName', label: 'Consultant Name', required: true },
    { name: 'role', label: 'Role' },
    { name: 'application', label: 'Application' },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
    { name: 'effectiveTo', label: 'Effective To', type: 'date' },
  ],
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

export const workingTimesColumns: Column<IConfigWorkingCalendarTime>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'dayOfWeek', label: 'Day of Week', minWidth: 130, format: mkCell() },
  { id: 'timeBlocks', label: 'Time Blocks', minWidth: 200, format: mkCell() },
  { id: 'isWorkingDay', label: 'Is Working Day', minWidth: 130, format: mkCell() },
];

export const composedTimesColumns: Column<IConfigComposedWorkingTime>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'date', label: 'Date', minWidth: 120, format: mkCell() },
  { id: 'day', label: 'Day', minWidth: 100, format: mkCell() },
  { id: 'startTime', label: 'Start Time', minWidth: 100, format: mkCell() },
  { id: 'endTime', label: 'End Time', minWidth: 100, format: mkCell() },
  { id: 'isWorkingDay', label: 'Is Working Day', minWidth: 130, format: mkCell() },
  { id: 'note', label: 'Note', minWidth: 150, format: mkDescCell },
];

export const workLocationsColumns: Column<IConfigCalendarWorkLocation>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'workLocation', label: 'Work Location', minWidth: 180, format: mkCell() },
  { id: 'effectiveFrom', label: 'Effective From', minWidth: 130, format: mkCell() },
  { id: 'effectiveTo', label: 'Effective To', minWidth: 130, format: mkCell() },
];

export const consultantsColumns: Column<IConfigCalendarConsultant>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'consultantName', label: 'Consultant Name', minWidth: 160, format: mkCell() },
  { id: 'role', label: 'Role', minWidth: 130, format: mkCell() },
  { id: 'application', label: 'Application', minWidth: 150, format: mkCell() },
  { id: 'effectiveFrom', label: 'Effective From', minWidth: 130, format: mkCell() },
  { id: 'effectiveTo', label: 'Effective To', minWidth: 130, format: mkCell() },
];
