import { Column } from '@serviceops/component';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LinkIcon from '@mui/icons-material/Link';
import type {
  IConfigWorkLocation,
  IConfigWorkLocationWorkingTime,
  IConfigWorkLocationShift,
  IConfigWorkLocationAssociatedProfile,
  IConfigWorkLocationAssociation,
} from '@serviceops/interfaces';
import { mkCell, mkDescCell } from '@serviceops/configutils';
import type { TableConfig } from '@serviceops/genericpanel';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const workingTimeColumns: Column<IConfigWorkLocationWorkingTime>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'dayOfWeek', label: 'Day of Week', minWidth: 120, format: mkCell() },
  { id: 'startTime', label: 'Start Time', minWidth: 100, format: mkCell() },
  { id: 'endTime', label: 'End Time', minWidth: 100, format: mkCell() },
];

// ── Table Configs ───────────────────────────────────────────────────────────────

export const WORKING_TIME_CONFIG: TableConfig = {
  title: 'Working Times',
  subtitle: 'Configure working hours for each day of the week per location',
  accent: '#0369a1',
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Time',
  fields: [
    {
      name: 'workLocationName',
      label: 'Work Location',
      required: true,
      bold: true,
      type: 'workLocationSearch',
    },
    { name: 'dayOfWeek', label: 'Day of Week', required: true, bold: true },
    { name: 'startTime', label: 'Start Time', required: true, type: 'time' },
    { name: 'endTime', label: 'End Time', required: true, type: 'time' },
  ],
};