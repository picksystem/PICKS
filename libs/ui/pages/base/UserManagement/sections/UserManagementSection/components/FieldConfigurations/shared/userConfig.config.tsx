import { Column } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import type {
  IConfigWorkLocationWorkingTime,
  IConfigComposedWorkingTime,
  IConfigWorkingCalendar,
  IConfigHolidayCalendar,
  IConfigWorkingDayTemplate,
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
