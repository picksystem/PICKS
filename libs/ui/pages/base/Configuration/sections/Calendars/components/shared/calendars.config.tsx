import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
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
  IConfigPeriodType,
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
      { name: 'name', label: 'Holiday Calendar', required: true, bold: true },
      { name: 'shortDescription', label: 'Short Description' },
      { name: 'description', label: 'Description' },
      { name: 'internalNote', label: 'Internal Note' },
    ],
  },
  bankHoliday: {
    title: 'Bank Holidays (Public Holidays)',
    subtitle: 'Add a bank holiday to the selected calendar',
    accent: ACCENT,
    icon: <BeachAccessIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Bank Holiday',
    newTitle: 'Add Bank Holidays (Public Holidays)',
    fields: [
      {
        name: 'calendarName',
        label: 'Holiday Calendar',
        required: true,
        bold: true,
        type: 'holidayCalendarSearch',
      },
      { name: 'date', label: 'Date', required: true, type: 'date' },
      {
        name: 'calendarYear',
        label: 'Calendar Year',
        required: true,
        type: 'year',
        readOnly: true,
        deriveFromDate: 'year',
      },
      {
        name: 'day',
        label: 'Day',
        required: true,
        type: 'optionsSearch',
        readOnly: true,
        deriveFromDate: 'weekday',
        staticOptions: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
      },
      { name: 'holidayDescription', label: 'Holiday Detail', required: true },
    ],
  },
  workingCalendar: {
    title: 'Working Calendars',
    subtitle: 'Define a working calendar with holiday calendar and working time template',
    accent: ACCENT,
    icon: <EventAvailableIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Working Calendar',
    fields: [
      { name: 'name', label: 'Working Calendar', required: true, bold: true },
      { name: 'holidayCalendar', label: 'Holiday Calendar' },
      { name: 'workingDayTemplate', label: 'Working Day Template' },
      { name: 'shortDescription', label: 'Short Description' },
      { name: 'internalNote', label: 'Internal Note' },
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
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'day', label: 'Day' },
    { name: 'week', label: 'Week' },
    { name: 'calendarMonth', label: 'Calendar Month' },
    { name: 'control', label: 'Control' },
    { name: 'timesheetPeriod', label: 'Timesheet Period' },
    { name: 'timesheetPeriodStatus', label: 'Timesheet Period Status' },
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
    { name: 'note', label: 'Note' },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'workingCalendar', label: 'Working Calendar' },
    { name: 'holidayCalendar', label: 'Holiday Calendar' },
    { name: 'workingTimeTemplate', label: 'Working Time Template' },
    { name: 'timesheetPeriod', label: 'Timesheet Period' },
    {
      name: 'isWorkingDay',
      label: 'Is Working Day',
      type: 'activationToggle',
      activationDescriptionActive: 'This period will Is Working Day across day boundaries',
      activationDescriptionInactive: 'This period will Is Working Day across day boundaries',
      activationAccent: ACCENT,
      defaultValue: false,
    },
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
  { id: 'name', label: 'Holiday Calendar', minWidth: 180, format: mkCell(true) },
  { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkDescCell },
];

export const bankHolidayColumns: Column<IConfigBankHoliday>[] = [
  { id: 'calendarName', label: 'Holiday Calendar', minWidth: 160, format: mkCell(true) },
  { id: 'calendarYear', label: 'Calendar Year', minWidth: 130, format: mkCell() },
  { id: 'date', label: 'Date', minWidth: 120, format: mkCell() },
  { id: 'day', label: 'Day', minWidth: 110, format: mkCell() },
  { id: 'holidayDescription', label: 'Holiday Detail', minWidth: 200, format: mkCell() },
];

export const workingCalendarColumns: Column<IConfigWorkingCalendar>[] = [
  { id: 'name', label: 'Working Calendar', minWidth: 180, format: mkCell(true) },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 180, format: mkCell() },
  { id: 'workingDayTemplate', label: 'Working Day Template', minWidth: 180, format: mkCell() },
  { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkDescCell },
];

export const workingTimesColumns: Column<IConfigWorkingCalendarTime>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'date', label: 'Date', minWidth: 120, format: mkCell() },
  { id: 'day', label: 'Day', minWidth: 110, format: mkCell() },
  { id: 'week', label: 'Week', minWidth: 110, format: mkCell() },
  { id: 'calendarMonth', label: 'Calendar Month', minWidth: 140, format: mkCell() },
  { id: 'control', label: 'Control', minWidth: 130, format: mkCell() },
  { id: 'timesheetPeriod', label: 'Timesheet Period', minWidth: 160, format: mkCell() },
  {
    id: 'timesheetPeriodStatus',
    label: 'Timesheet Period Status',
    minWidth: 170,
    format: mkCell(),
  },
];

export const composedTimesColumns: Column<IConfigComposedWorkingTime>[] = [
  { id: 'calendarName', label: 'Calendar Name', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 120, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 120, format: mkCell() },
  { id: 'workingCalendar', label: 'Working Calendar', minWidth: 160, format: mkCell() },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 160, format: mkCell() },
  { id: 'workingTimeTemplate', label: 'Working Time Template', minWidth: 180, format: mkCell() },
  { id: 'timesheetPeriod', label: 'Timesheet Period', minWidth: 160, format: mkCell() },
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

// ── Timesheet Periods Table Config ─────────────────────────────────────────────

export const TIMESHEET_PERIOD_CONFIG: TableConfig = {
  title: 'Timesheet Periods',
  subtitle: 'Define timesheet period types and their frequency',
  accent: ACCENT,
  icon: <EventRepeatIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Period',
  fields: [
    { name: 'name', label: 'Timesheet Period', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description', type: 'richText', required: true },
    { name: 'description', label: 'Description', type: 'richText', required: true },
    {
      name: 'timesheetFrequency',
      label: 'Timesheet Frequency',
      type: 'optionsSearch',
      staticOptions: ['Weekly', 'Biweekly', 'Monthly'],
      required: true,
    },
    {
      name: 'weekStartsOn',
      label: 'Day Week Starts On',
      type: 'optionsSearch',
      optionsSourceField: 'name',
    },
    { name: 'internalNote', label: 'Internal Note', type: 'richText', required: true },
    {
      name: 'autoSplitWeek',
      label: 'AutoSplit Week',
      type: 'activationToggle',
      activationDescriptionActive: 'This period will auto-split across week boundaries',
      activationDescriptionInactive: 'This period will not auto-split across week boundaries',
      activationAccent: ACCENT,
      defaultValue: false,
    },
  ],
};

export const timesheetPeriodColumns: Column<IConfigPeriodType>[] = [
  { id: 'name', label: 'Timesheet Period', minWidth: 180, format: mkCell(true) },
  { id: 'shortDescription', label: 'Short Description', minWidth: 180, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'timesheetFrequency', label: 'Timesheet Frequency', minWidth: 160, format: mkCell() },
  { id: 'autoSplitWeek', label: 'AutoSplit Week', minWidth: 140, format: mkCell() },
  { id: 'weekStartsOn', label: 'Day Week Starts On', minWidth: 160, format: mkCell() },
  { id: 'internalNote', label: 'Internal Note', minWidth: 200, format: mkDescCell },
];
