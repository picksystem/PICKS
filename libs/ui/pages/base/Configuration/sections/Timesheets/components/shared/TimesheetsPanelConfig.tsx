import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import AppsIcon from '@mui/icons-material/Apps';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonIcon from '@mui/icons-material/Person';
import type { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import type {
  IConfigTimesheetProjectEntry,
  IConfigTimesheetConversionCode,
  IConfigTimesheetCancellationCode,
  IConfigTimesheetProjectCategory,
  IConfigTimesheetServiceLineEntry,
  IConfigTimesheetApplicationEntry,
  IConfigTimesheetQueueEntry,
  IConfigTimesheetResourceEntry,
} from '@serviceops/interfaces';
import { TableConfig, TS_ACCENT } from './types';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const TS_COLORS = {
  timesheet: '#0369a1',
} as const;

// ── View Toggle Buttons ────────────────────────────────────────────────────────

export const TS_PROJECT_VIEWS = [
  { key: 'project', label: 'Timesheet Projects', icon: <AccessTimeIcon /> },
  { key: 'serviceLine', label: 'Add to Service Line', icon: <AccessTimeIcon /> },
  { key: 'application', label: 'Add to Application', icon: <AccessTimeIcon /> },
  { key: 'queue', label: 'Add to Queue', icon: <AccessTimeIcon /> },
  { key: 'resource', label: 'Add to Resource', icon: <AccessTimeIcon /> },
] as const;

// ── Table Configs ───────────────────────────────────────────────────────────────

export const TIMESHEET_PROJECT_MAIN_CONFIG: TableConfig = {
  title: 'Timesheet Projects',
  subtitle: 'Define timesheet project entries with their types and transition details',
  accent: TS_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'name', label: 'Project Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'projectType', label: 'Project Type' },
    { name: 'transitionType', label: 'Transition Type' },
  ],
};

export const SERVICE_LINE_CONFIG: TableConfig = {
  title: 'Add to Service Line',
  subtitle: 'Add timesheet projects to service lines',
  accent: TS_ACCENT,
  icon: <LayersIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Service Line Entry',
  fields: [
    { name: 'serviceLine', label: 'Service Line', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const APPLICATION_CONFIG: TableConfig = {
  title: 'Add to Application',
  subtitle: 'Add timesheet projects to applications',
  accent: TS_ACCENT,
  icon: <AppsIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Application Entry',
  fields: [
    { name: 'application', label: 'Application', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const QUEUE_CONFIG: TableConfig = {
  title: 'Add to Queue',
  subtitle: 'Add timesheet projects to queues',
  accent: TS_ACCENT,
  icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Queue Entry',
  fields: [
    { name: 'queue', label: 'Queue', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const RESOURCE_CONFIG: TableConfig = {
  title: 'Add to Resource',
  subtitle: 'Add timesheet projects to resources',
  accent: TS_ACCENT,
  icon: <PersonIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Resource Entry',
  fields: [
    { name: 'resource', label: 'Resource', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};

export const CONVERSION_CODE_CONFIG: TableConfig = {
  title: 'Conversion Reason Codes',
  subtitle: 'Define codes for timesheet conversions',
  accent: TS_ACCENT,
  icon: <PlaylistAddIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Conversion Code',
  fields: [
    { name: 'name', label: 'Reason Code Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'projectType', label: 'Project Type' },
    { name: 'transitionType', label: 'Transition Type' },
  ],
};

export const CANCELLATION_CODE_CONFIG: TableConfig = {
  title: 'Cancellation Reason Codes',
  subtitle: 'Define codes for timesheet cancellations',
  accent: TS_ACCENT,
  icon: <PlaylistRemoveIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Cancellation Code',
  fields: [
    { name: 'name', label: 'Reason Code Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'projectType', label: 'Project Type' },
    { name: 'transitionType', label: 'Transition Type' },
  ],
};

export const PROJECT_CATEGORY_CONFIG: TableConfig = {
  title: 'Project Categories',
  subtitle: 'Define project categories with transition type and billability',
  accent: TS_ACCENT,
  icon: <CategoryIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Project Category',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'name', label: 'Category Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'transitionType', label: 'Transition Type' },
    { name: 'billability', label: 'Billability' },
  ],
};

// ── Column Definitions ─────────────────────────────────────────────────────────

export const timesheetProjectColumns: Column<IConfigTimesheetProjectEntry>[] = [
  { id: 'name', label: 'Project Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'projectType', label: 'Project Type', minWidth: 140, format: mkCell() },
  { id: 'transitionType', label: 'Transition Type', minWidth: 140, format: mkCell() },
];

export const serviceLineColumns: Column<IConfigTimesheetServiceLineEntry>[] = [
  { id: 'serviceLine', label: 'Service Line', minWidth: 160, format: mkCell(true) },
  { id: 'project', label: 'Project', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 120, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 120, format: mkCell() },
  { id: 'activate', label: 'Activate', minWidth: 100, format: mkCell() },
  { id: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', minWidth: 120, format: mkCell() },
];

export const applicationColumns: Column<IConfigTimesheetApplicationEntry>[] = [
  { id: 'application', label: 'Application', minWidth: 160, format: mkCell(true) },
  { id: 'project', label: 'Project', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 120, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 120, format: mkCell() },
  { id: 'activate', label: 'Activate', minWidth: 100, format: mkCell() },
  { id: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', minWidth: 120, format: mkCell() },
];

export const queueColumns: Column<IConfigTimesheetQueueEntry>[] = [
  { id: 'queue', label: 'Queue', minWidth: 160, format: mkCell(true) },
  { id: 'project', label: 'Project', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 120, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 120, format: mkCell() },
  { id: 'activate', label: 'Activate', minWidth: 100, format: mkCell() },
  { id: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', minWidth: 120, format: mkCell() },
];

export const resourceColumns: Column<IConfigTimesheetResourceEntry>[] = [
  { id: 'resource', label: 'Resource', minWidth: 160, format: mkCell(true) },
  { id: 'project', label: 'Project', minWidth: 160, format: mkCell(true) },
  { id: 'fromDate', label: 'From Date', minWidth: 120, format: mkCell() },
  { id: 'toDate', label: 'To Date', minWidth: 120, format: mkCell() },
  { id: 'activate', label: 'Activate', minWidth: 100, format: mkCell() },
  { id: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', minWidth: 120, format: mkCell() },
];

export const conversionCodeColumns: Column<IConfigTimesheetConversionCode>[] = [
  { id: 'name', label: 'Reason Code Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'projectType', label: 'Project Type', minWidth: 140, format: mkCell() },
  { id: 'transitionType', label: 'Transition Type', minWidth: 140, format: mkCell() },
];

export const cancellationCodeColumns: Column<IConfigTimesheetCancellationCode>[] = [
  { id: 'name', label: 'Reason Code Name', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'projectType', label: 'Project Type', minWidth: 140, format: mkCell() },
  { id: 'transitionType', label: 'Transition Type', minWidth: 140, format: mkCell() },
];

export const projectCategoryColumns: Column<IConfigTimesheetProjectCategory>[] = [
  { id: 'project', label: 'Project', minWidth: 160, format: mkCell(true) },
  { id: 'name', label: 'Category Name', minWidth: 160, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 200, format: mkDescCell },
  { id: 'transitionType', label: 'Transition Type', minWidth: 140, format: mkCell() },
  { id: 'billability', label: 'Billability', minWidth: 120, format: mkCell() },
];
