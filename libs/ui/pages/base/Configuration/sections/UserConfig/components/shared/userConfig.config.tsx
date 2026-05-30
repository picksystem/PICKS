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

export const workLocationColumns: Column<IConfigWorkLocation>[] = [
  { id: 'workLocation', label: 'Work Location', minWidth: 180, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'city', label: 'City', minWidth: 120, format: mkCell() },
  { id: 'state', label: 'State', minWidth: 120, format: mkCell() },
  { id: 'country', label: 'Country', minWidth: 120, format: mkCell() },
  { id: 'timezone', label: 'Timezone', minWidth: 150, format: mkCell() },
];

export const workingTimeColumns: Column<IConfigWorkLocationWorkingTime>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'dayOfWeek', label: 'Day of Week', minWidth: 120, format: mkCell() },
  { id: 'startTime', label: 'Start Time', minWidth: 100, format: mkCell() },
  { id: 'endTime', label: 'End Time', minWidth: 100, format: mkCell() },
];

export const associatedProfileColumns: Column<IConfigWorkLocationAssociatedProfile>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'consultantName', label: 'Consultant Profile', minWidth: 180, format: mkCell() },
  { id: 'consultantProfileId', label: 'Profile ID', minWidth: 120, format: mkCell() },
];

export const shiftColumns: Column<IConfigWorkLocationShift>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'shiftName', label: 'Shift Name', minWidth: 140, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
  { id: 'startTime', label: 'Start Time', minWidth: 100, format: mkCell() },
  { id: 'endTime', label: 'End Time', minWidth: 100, format: mkCell() },
];

export const associationColumns: Column<IConfigWorkLocationAssociation>[] = [
  { id: 'workLocationName', label: 'Work Location', minWidth: 150, format: mkCell(true) },
  { id: 'associatedLocationName', label: 'Associated Location', minWidth: 160, format: mkCell() },
  { id: 'description', label: 'Description', minWidth: 180, format: mkDescCell },
];

// ── Table Configs ───────────────────────────────────────────────────────────────

export const WORK_LOCATION_CONFIG: TableConfig = {
  title: 'Work Locations',
  subtitle: 'Define work locations and configure their regional and time settings',
  accent: '#0369a1',
  icon: <LocationOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Work Location',
  fields: [
    {
      name: 'workLocation',
      label: 'Work Location',
      required: true,
      type: 'workLocationSearch',
      autoFillFields: {
        city: 'city',
        state: 'state',
        country: 'country',
        timezone: 'timezone',
      },
    },
    { name: 'description', label: 'Description' },
    { name: 'city', label: 'City' },
    { name: 'state', label: 'State' },
    { name: 'country', label: 'Country' },
    { name: 'timezone', label: 'Timezone' },
  ],
};

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

export const ASSOCIATED_PROFILE_CONFIG: TableConfig = {
  title: 'Associated Consultant Profiles',
  subtitle: 'Link consultant profiles to work locations',
  accent: '#0369a1',
  icon: <GroupIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Associated Consultant Profile',
  fields: [
    {
      name: 'workLocationName',
      label: 'Work Location',
      required: true,
      bold: true,
      type: 'workLocationSearch',
    },
    { name: 'consultantName', label: 'Consultant Name', required: true },
    { name: 'consultantProfileId', label: 'Consultant Profile ID' },
  ],
};

export const SHIFT_CONFIG: TableConfig = {
  title: 'Shift Management',
  subtitle: 'Define shift hours and assign to work locations',
  accent: '#0369a1',
  icon: <WatchLaterIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Shift',
  fields: [
    {
      name: 'workLocationName',
      label: 'Work Location',
      required: true,
      bold: true,
      type: 'workLocationSearch',
    },
    { name: 'shiftName', label: 'Shift Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'startTime', label: 'Start Time', required: true, type: 'time' },
    { name: 'endTime', label: 'End Time', required: true, type: 'time' },
  ],
};

export const ASSOCIATION_CONFIG: TableConfig = {
  title: 'Work Location Associations',
  subtitle: 'Link work locations to other locations',
  accent: '#0369a1',
  icon: <LinkIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Work Location Association',
  fields: [
    {
      name: 'workLocationName',
      label: 'Work Location',
      required: true,
      bold: true,
      type: 'workLocationSearch',
    },
    {
      name: 'associatedLocationName',
      label: 'Associated Location',
      required: true,
      bold: true,
      type: 'workLocationSearch',
    },
    { name: 'description', label: 'Description' },
  ],
};
