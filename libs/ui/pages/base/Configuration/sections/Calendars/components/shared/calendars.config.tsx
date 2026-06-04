import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/configutils';
import type {
  IConfigHolidayCalendar,
  IConfigBankHoliday,
  IConfigWorkingCalendar,
  IConfigWorkingCalendarTime,
  IConfigComposedWorkingTime,
  IConfigCalendarWorkLocation,
  IConfigCalendarConsultant,
} from '@serviceops/interfaces';
import type { TableField, TableConfig } from '@serviceops/genericpanel';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const ACCENT = '#0369a1';

export type CalendarActiveView = 'holidayCalendar' | 'bankHoliday' | 'workingCalendar';

export type { TableField, TableConfig };

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
    title: 'Bank Holidays (Public Holidays)',
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
    { name: 'startTime', label: 'Start Time', type: 'time' },
    { name: 'endTime', label: 'End Time', type: 'time' },
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
    { name: 'workLocation', label: 'Work Location', required: true, type: 'workLocationSearch' },
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

// ── Period Types Table Configs ─────────────────────────────────────────────────

import { ToolbarButton } from '@serviceops/generictoolbar';

interface SectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  toolbarButtons: ToolbarButton[];
}

export const SECTION_TOOLBAR_CONFIG: Record<string, SectionConfig> = {
  periodTypes: {
    title: 'Period Types',
    subtitle: 'Define timesheet period types and manage timesheet periods',
    accent: ACCENT,
    icon: <EventRepeatIcon sx={{ fontSize: '1rem' }} />,
    toolbarButtons: [
      {
        key: 'periodTypes',
        label: 'Period Types',
        icon: <EventRepeatIcon />,
        isActive: false,
        onClick: () => {},
      },
      {
        key: 'timesheetPeriods',
        label: 'Timesheet Periods',
        icon: <PlaylistAddIcon />,
        isActive: false,
        onClick: () => {},
      },
    ],
  },
  workingShiftManagement: {
    title: 'Working Shift Management',
    subtitle: 'Define working shifts and associate consultants',
    accent: ACCENT,
    icon: <WorkIcon sx={{ fontSize: '1rem' }} />,
    toolbarButtons: [
      {
        key: 'workingShifts',
        label: 'Working Shifts',
        icon: <WorkIcon />,
        isActive: false,
        onClick: () => {},
      },
      {
        key: 'consultants',
        label: 'Associated Consultants',
        icon: <PeopleAltIcon />,
        isActive: false,
        onClick: () => {},
      },
    ],
  },
};

export const PERIOD_TYPES_TABLE_CONFIG: TableConfig = {
  title: 'Period Types',
  subtitle: 'Define timesheet period types and their frequency',
  accent: ACCENT,
  icon: <EventRepeatIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Period Type',
  fields: [
    { name: 'name', label: 'Period Type', required: true, bold: true },
    { name: 'description', label: 'Description' },
    {
      name: 'timesheetFrequency',
      label: 'Timesheet Frequency',
      type: 'text',
    },
    {
      name: 'autoSplitWeek',
      label: 'Auto Split Week',
      type: 'toggle',
      defaultValue: false,
    },
    { name: 'weekStartsOn', label: 'Day Week Starts On' },
  ],
};

export const TIMESHEET_PERIODS_TABLE_CONFIG: TableConfig = {
  title: 'Timesheet Periods',
  subtitle: 'View generated timesheet periods',
  accent: ACCENT,
  icon: <EventNoteIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Period',
  fields: [
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'name', label: 'Name' },
    { name: 'endDate', label: 'End Date', type: 'date' },
  ],
};

export const periodTypesColumns: Column<Record<string, unknown>>[] = [
  { id: 'name', label: 'Period Type', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'timesheetFrequency', label: 'Timesheet Frequency', minWidth: 160, format: mkCell() },
  { id: 'autoSplitWeek', label: 'Auto Split Week', minWidth: 130, format: mkCell() },
  { id: 'weekStartsOn', label: 'Day Week Starts On', minWidth: 150, format: mkCell() },
];

export const timesheetPeriodsColumns: Column<Record<string, unknown>>[] = [
  { id: 'startDate', label: 'Start Date', minWidth: 130, format: mkCell() },
  { id: 'name', label: 'Name', minWidth: 180, format: mkCell(true) },
  { id: 'endDate', label: 'End Date', minWidth: 130, format: mkCell() },
];

// ── Working Shift Management Table Configs ────────────────────────────────────

import WorkIcon from '@mui/icons-material/Work';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export const WORKING_SHIFTS_TABLE_CONFIG: TableConfig = {
  title: 'Working Shifts',
  subtitle: 'Define and manage working shift definitions',
  accent: ACCENT,
  icon: <WorkIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Shift',
  fields: [
    { name: 'shiftName', label: 'Shift Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'workingTimeTemplate', label: 'Working Time Template' },
  ],
};

export const SHIFT_CONSULTANTS_TABLE_CONFIG: TableConfig = {
  title: 'Associated Consultants',
  subtitle: 'Configure consultants per shift',
  accent: ACCENT,
  icon: <PeopleAltIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Shift Consultant',
  fields: [
    { name: 'shiftName', label: 'Shift Name', required: true, bold: true },
    { name: 'consultantName', label: 'Consultant Name', required: true },
    { name: 'role', label: 'Role' },
    { name: 'application', label: 'Application' },
  ],
};

export const workingShiftsColumns: Column<Record<string, unknown>>[] = [
  { id: 'shiftName', label: 'Shift Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 260, format: mkDescCell },
  { id: 'workingTimeTemplate', label: 'Working Time Template', minWidth: 200, format: mkCell() },
];

export const shiftConsultantsColumns: Column<Record<string, unknown>>[] = [
  { id: 'shiftName', label: 'Shift Name', minWidth: 180, format: mkCell(true) },
  { id: 'consultantName', label: 'Consultant Name', minWidth: 180, format: mkCell() },
  { id: 'role', label: 'Role', minWidth: 130, format: mkCell() },
  { id: 'application', label: 'Application', minWidth: 150, format: mkCell() },
];
