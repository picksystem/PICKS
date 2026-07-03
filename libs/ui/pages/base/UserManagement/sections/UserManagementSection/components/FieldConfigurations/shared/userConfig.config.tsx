import { Column } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import UpdateIcon from '@mui/icons-material/Update';
import type {
  IConfigWorkLocationWorkingTime,
  IConfigComposedWorkingTime,
  IConfigWorkingCalendar,
  IConfigHolidayCalendar,
  IConfigWorkingDayTemplate,
  IConfigTimesheetPeriodEntry,
  IConfigUpdateTimesheetPeriodEntry,
} from '@serviceops/interfaces';
import { mkCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const workingTimeColumns: Column<IConfigWorkLocationWorkingTime>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'dayOfWeek', label: 'Day of Week', minWidth: 120, format: mkCell() },
  { id: 'startTime', label: 'Start Time', minWidth: 100, format: mkCell() },
  { id: 'endTime', label: 'End Time', minWidth: 100, format: mkCell() },
];

export const composedWorkingTimeColumns: Column<IConfigComposedWorkingTime>[] = [
  { id: 'fromDate', label: 'From Date', minWidth: 130, format: mkCell(true) },
  { id: 'toDate', label: 'To Date', minWidth: 130, format: mkCell() },
  { id: 'workingCalendar', label: 'Working Calendar', minWidth: 180, format: mkCell() },
  { id: 'holidayCalendar', label: 'Holiday Calendar', minWidth: 180, format: mkCell() },
  { id: 'workingTimeTemplate', label: 'Working Time Template', minWidth: 200, format: mkCell() },
];

export const COMPOSED_WORKING_TIME_CONFIG: TableConfig = {
  title: 'Compose Working Times',
  subtitle: 'Define working time compositions with date ranges and calendar assignments',
  accent: '#0369a1',
  icon: <EditIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Composed Working Time',
  fields: [
    { name: 'fromDate', label: 'From Date', required: true, type: 'date' },
    { name: 'toDate', label: 'To Date', required: true, type: 'date' },
    {
      name: 'workingCalendar',
      label: 'Working Calendar',
      required: true,
    },
    {
      name: 'holidayCalendar',
      label: 'Holiday Calendar',
      required: true,
    },
    {
      name: 'workingTimeTemplate',
      label: 'Working Time Template',
      required: true,
    },
  ],
};

export const timesheetPeriodEntryColumns: Column<IConfigTimesheetPeriodEntry>[] = [
  { id: 'fromDate', label: 'From Date', minWidth: 130, format: mkCell(true) },
  { id: 'toDate', label: 'To Date', minWidth: 130, format: mkCell() },
  { id: 'timesheetPeriodId', label: 'Timesheet Period ID', minWidth: 180, format: mkCell() },
  {
    id: 'timesheetPeriodStatus',
    label: 'Timesheet Period Status',
    minWidth: 180,
    format: mkCell(),
  },
];

export const TIMESHEET_PERIOD_ENTRY_CONFIG: TableConfig = {
  title: 'Timesheet Periods',
  subtitle: 'Define timesheet periods with date ranges and status',
  accent: '#0369a1',
  icon: <EventNoteIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Period',
  fields: [
    { name: 'fromDate', label: 'From Date', required: true, type: 'date' },
    { name: 'toDate', label: 'To Date', required: true, type: 'date' },
    {
      name: 'timesheetPeriodId',
      label: 'Timesheet Period ID',
      required: true,
    },
    {
      name: 'timesheetPeriodStatus',
      label: 'Timesheet Period Status',
      required: true,
    },
  ],
};

export const updateTimesheetPeriodEntryColumns: Column<IConfigUpdateTimesheetPeriodEntry>[] = [
  { id: 'fromDate', label: 'From Date', minWidth: 130, format: mkCell(true) },
  { id: 'toDate', label: 'To Date', minWidth: 130, format: mkCell() },
  { id: 'timesheetPeriodType', label: 'Timesheet Period Type', minWidth: 180, format: mkCell() },
  { id: 'workingCalendar', label: 'Working Calendar', minWidth: 180, format: mkCell() },
];

export const UPDATE_TIMESHEET_PERIOD_ENTRY_CONFIG: TableConfig = {
  title: 'Update Timesheet Periods',
  subtitle: 'Update timesheet periods with date ranges, period type and calendar assignment',
  accent: '#0369a1',
  icon: <UpdateIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Period',
  fields: [
    { name: 'fromDate', label: 'From Date', required: true, type: 'date' },
    { name: 'toDate', label: 'To Date', required: true, type: 'date' },
    {
      name: 'timesheetPeriodType',
      label: 'Timesheet Period Type',
      required: true,
    },
    {
      name: 'workingCalendar',
      label: 'Working Calendar',
      required: true,
    },
  ],
};
