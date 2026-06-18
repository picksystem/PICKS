import AvTimerIcon from '@mui/icons-material/AvTimer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Column, Typography, Switch } from '@serviceops/component';
import { TableConfig } from '@serviceops/genericpanel';
import { mkActiveChip } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import { stripRichText } from './textUtils';
import type { IConfigResponseAckSLARow } from '@serviceops/interfaces';

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
    {
      name: 'shortDescription',
      label: 'Short Description',
      type: 'richText' as const,
    },
    {
      name: 'internalNote',
      label: 'Internal note',
      type: 'richText' as const,
    },
    {
      name: 'activation',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'Time logging is enabled for this ticket type',
      activationDescriptionInactive: 'Time logging is disabled for this ticket type',
      activationAccent: SLA_ACCENT,
    },
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
    {
      name: 'shortDescription',
      label: 'Short Description',
      type: 'richText' as const,
    },
    {
      name: 'internalNote',
      label: 'Internal note',
      type: 'richText' as const,
    },
    {
      name: 'activation',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'ETA is enabled for this ticket type',
      activationDescriptionInactive: 'ETA is disabled for this ticket type',
      activationAccent: SLA_ACCENT,
    },
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
    {
      name: 'shortDescription',
      label: 'Short Description',
      type: 'richText' as const,
    },
    {
      name: 'internalNote',
      label: 'Internal note',
      type: 'richText' as const,
    },
    { name: 'p1', label: 'P1', required: true, type: 'duration' as const },
    { name: 'p2', label: 'P2', required: true, type: 'duration' as const },
    { name: 'p3', label: 'P3', required: true, type: 'duration' as const },
    { name: 'p4', label: 'P4', required: true, type: 'duration' as const },
    { name: 'p5', label: 'P5', required: true, type: 'duration' as const },
    {
      name: 'activation',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'Due-date tracking is enabled for this ticket type',
      activationDescriptionInactive: 'Due-date tracking is disabled for this ticket type',
      activationAccent: SLA_ACCENT,
    },
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
    {
      name: 'shortDescription',
      label: 'Short Description',
      type: 'richText' as const,
    },
    {
      name: 'internalNote',
      label: 'Internal note',
      type: 'richText' as const,
    },
    { name: 'p1', label: 'P1', required: true, type: 'duration' as const },
    { name: 'p2', label: 'P2', required: true, type: 'duration' as const },
    { name: 'p3', label: 'P3', required: true, type: 'duration' as const },
    { name: 'p4', label: 'P4', required: true, type: 'duration' as const },
    { name: 'p5', label: 'P5', required: true, type: 'duration' as const },
    {
      name: 'activation',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This SLA is enabled and tracked for tickets',
      activationDescriptionInactive: 'This SLA is disabled and not tracked for tickets',
      activationAccent: SLA_ACCENT,
    },
  ],
};

// Response/Acknowledgement SLA Config
export const RESPONSE_ACK_SLA_CONFIG: TableConfig = {
  title: 'Response / Acknowledgement SLA (in hours)',
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
    {
      name: 'shortDescription',
      label: 'Short Description',
      type: 'richText' as const,
    },
    {
      name: 'internalNote',
      label: 'Internal note',
      type: 'richText' as const,
    },
    {
      name: 'p1',
      label: 'P1',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'p2',
      label: 'P2',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'p3',
      label: 'P3',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'p4',
      label: 'P4',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'p5',
      label: 'P5',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'isActive',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This SLA is enabled and tracked for tickets',
      activationDescriptionInactive: 'This SLA is disabled and not tracked for tickets',
      activationAccent: SLA_ACCENT,
    },
  ],
};

// ── Column Definitions ─────────────────────────────────────────────────────────

const formatHours = (v: unknown): { value: string; minutes: number | null } => {
  if (v === undefined || v === null || v === '') return { value: '—', minutes: null };

  const toValueAndMinutes = (n: number): { value: string; minutes: number | null } => {
    if (Number.isNaN(n)) return { value: '—', minutes: null };
    const value = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
    const minutes = Math.round(n * 60);
    return { value, minutes };
  };

  if (typeof v === 'number') {
    return toValueAndMinutes(v);
  }

  const raw = String(v).trim();
  if (!raw) return { value: '—', minutes: null };

  if (/^\d+:\d{1,2}$/.test(raw)) {
    const [hStr, mStr] = raw.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return { value: raw, minutes: null };
    const value = m === 0 ? String(h) : `${h}:${String(m).padStart(2, '0')}`;
    return { value, minutes: h * 60 + m };
  }

  const asNumber = Number(raw);
  if (!Number.isNaN(asNumber)) {
    return toValueAndMinutes(asNumber);
  }

  return { value: raw, minutes: null };
};

const durationCell = (v: unknown): React.ReactNode => {
  const { value } = formatHours(v);
  return (
    <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
      {value}
    </Typography>
  );
};

export const responseAckSLAColumns = (): Column<IConfigResponseAckSLARow>[] => [
  {
    id: 'ticketTypeName',
    label: 'SLAs',
    minWidth: 140,
    format: (_v, row) => (
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'text.primary' }}>
        {row.ticketTypeName || '—'}
      </Typography>
    ),
  },
  {
    id: 'isActive',
    label: 'Activation',
    minWidth: 110,
    align: 'center' as const,
    format: (v) => mkActiveChip(v),
  },
  {
    id: 'shortDescription',
    label: 'Short Description',
    minWidth: 180,
    format: (_v, row) => (
      <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
        {row.shortDescription ? stripRichText(row.shortDescription) : '—'}
      </Typography>
    ),
  },
  {
    id: 'internalNote',
    label: 'Internal note',
    minWidth: 180,
    format: (_v, row) => (
      <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
        {row.internalNote ? stripRichText(row.internalNote) : '—'}
      </Typography>
    ),
  },
  { id: 'p1', label: 'P1', minWidth: 70, format: durationCell },
  { id: 'p2', label: 'P2', minWidth: 70, format: durationCell },
  { id: 'p3', label: 'P3', minWidth: 70, format: durationCell },
  { id: 'p4', label: 'P4', minWidth: 70, format: durationCell },
  { id: 'p5', label: 'P5', minWidth: 70, format: durationCell },
];
