import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Column } from '@serviceops/component';
import { mkCell, mkDescCell } from '@serviceops/pages/base/Configuration/utils/cellRenderers';

// ── Colors ─────────────────────────────────────────────────────────────────────

export const TS_COLORS = {
  timesheet: '#0369a1',
} as const;

// ── View Toggle Buttons ────────────────────────────────────────────────────────

export const TS_PROJECT_VIEWS = [
  { key: 'project', label: 'Timesheet Project', icon: <AccessTimeIcon /> },
  { key: 'serviceLine', label: 'Add to Service Line', icon: <AccessTimeIcon /> },
  { key: 'application', label: 'Add to Application', icon: <AccessTimeIcon /> },
  { key: 'queue', label: 'Add to Queue', icon: <AccessTimeIcon /> },
  { key: 'resource', label: 'Add to Resource', icon: <AccessTimeIcon /> },
] as const;

// ── Column Definitions ─────────────────────────────────────────────────────────

export const timesheetProjectColumns: Column<any>[] = [
  { id: 'name', label: 'Name', minWidth: 200, format: mkCell(true) },
  { id: 'description', label: 'Description', minWidth: 220, format: mkDescCell },
  { id: 'projectType', label: 'Project Type', minWidth: 140, format: mkCell() },
  { id: 'transitionType', label: 'Transition Type', minWidth: 140, format: mkCell() },
];

// ── Form Config ────────────────────────────────────────────────────────────────

export const TS_FORM_LABELS = {
  project: {
    title: 'Timesheet Project',
    subtitle: 'Define a timesheet project with its type and transition details',
    entity: 'Timesheet Project',
    fields: [
      {
        name: 'name',
        label: 'Name',
        required: true,
        placeholder: 'e.g. Q2 Infrastructure, Client Portal Upgrade',
      },
      {
        name: 'description',
        label: 'Description',
        multiline: true,
        minRows: 2,
        placeholder: 'Brief description of this timesheet project',
      },
      {
        name: 'projectType',
        label: 'Project Type',
        placeholder: 'e.g. Internal, Billable, Non-Billable',
      },
      {
        name: 'transitionType',
        label: 'Transition Type',
        placeholder: 'e.g. Standard, Emergency, Planned',
      },
    ],
  },
} as const;
