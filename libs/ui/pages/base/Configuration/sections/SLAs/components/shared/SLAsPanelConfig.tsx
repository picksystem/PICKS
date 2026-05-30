import AvTimerIcon from '@mui/icons-material/AvTimer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Typography, Switch } from '@serviceops/component';
import { TableConfig } from '@serviceops/genericpanel';

export const SLA_ACCENT = '#0369a1';

// Ticket type text cell renderer (bold text instead of colored chip)
export const ticketTypeChipCell = (
  row: { ticketTypeId: number; ticketTypeName: string },
  ticketTypes: Array<{ id: number }>,
): React.ReactNode => {
  return (
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'text.primary' }}>
      {row.ticketTypeName}
    </Typography>
  );
};

// Priority cell renderer (for P1-P5 columns)
export const priorityCell = (v: unknown): React.ReactNode => (
  <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
    {String(v)}
  </Typography>
);

// Activation toggle cell
export const activationCell = (
  row: { ticketTypeId: number; activation: boolean },
  onToggle: (ticketTypeId: number, value: boolean) => void,
): React.ReactNode => (
  <Switch
    size='small'
    checked={row.activation}
    color='success'
    onChange={(e) => {
      e.stopPropagation();
      onToggle(row.ticketTypeId, e.target.checked);
    }}
    onClick={(e) => e.stopPropagation()}
  />
);

// Time Logs Activation Config
export const TIME_LOGS_ACTIVATION_CONFIG: TableConfig = {
  title: 'Time Logs Activation',
  subtitle: 'Activate time logging on tickets and control caller visibility',
  accent: SLA_ACCENT,
  icon: <AvTimerIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Time Log Activation',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      bold: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'activation', label: 'Activation', type: 'toggle' as const, defaultValue: true },
  ],
};

// ETA Activation Config
export const ETA_ACTIVATION_CONFIG: TableConfig = {
  title: 'ETA Activation',
  subtitle: 'Control ETA visibility and notification behaviour on tickets',
  accent: SLA_ACCENT,
  icon: <ScheduleIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'ETA Activation',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      bold: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'activation', label: 'Activation', type: 'toggle' as const, defaultValue: true },
  ],
};

// Due Dates Config
export const DUE_DATES_CONFIG: TableConfig = {
  title: 'Due Dates',
  subtitle: 'Control due date visibility and alerting on tickets',
  accent: SLA_ACCENT,
  icon: <DateRangeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Due Date',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      bold: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'activation', label: 'Activation', type: 'toggle' as const, defaultValue: true },
    { name: 'p1', label: 'P1' },
    { name: 'p2', label: 'P2' },
    { name: 'p3', label: 'P3' },
    { name: 'p4', label: 'P4' },
    { name: 'p5', label: 'P5' },
  ],
};

// Resolution SLA Config
export const RESOLUTION_SLA_CONFIG: TableConfig = {
  title: 'Resolution SLA (in hours)',
  subtitle: 'Track resolution time targets per ticket type and priority level',
  accent: SLA_ACCENT,
  icon: <AssignmentTurnedInIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Resolution SLA',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      bold: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'activation', label: 'Activation', type: 'toggle' as const, defaultValue: true },
    { name: 'p1', label: 'P1' },
    { name: 'p2', label: 'P2' },
    { name: 'p3', label: 'P3' },
    { name: 'p4', label: 'P4' },
    { name: 'p5', label: 'P5' },
  ],
};

// Response/Acknowledgement SLA Config
export const RESPONSE_ACK_SLA_CONFIG: TableConfig = {
  title: 'Response / Acknowledgement SLA (in minutes)',
  subtitle: 'Configure response time targets and breach alerting for initial acknowledgement',
  accent: SLA_ACCENT,
  icon: <MarkEmailReadIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Response / Ack SLA',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      bold: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'activation', label: 'Activation', type: 'toggle' as const, defaultValue: true },
    { name: 'p1', label: 'P1' },
    { name: 'p2', label: 'P2' },
    { name: 'p3', label: 'P3' },
    { name: 'p4', label: 'P4' },
    { name: 'p5', label: 'P5' },
  ],
};
