import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { TableConfig } from '@serviceops/genericpanel';

export const STATUS_ACCENT = '#0369a1';

export const TICKET_STATUSES_CONFIG: TableConfig = {
  title: 'Ticket Statuses',
  subtitle: 'Configure lifecycle statuses, SLA tracking, and per-ticket-type availability',
  accent: STATUS_ACCENT,
  icon: <RadioButtonCheckedIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Status',
  fields: [
    { name: 'displayName', label: 'Status Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
    { name: 'slaActive', label: 'SLA Active', type: 'toggle' as const, defaultValue: true },
    { name: 'isFinal', label: 'Final Status', type: 'toggle' as const, defaultValue: false },
  ],
};

export const RELEASE_CYCLE_STATUSES_CONFIG: TableConfig = {
  title: 'Release Cycle Statuses',
  subtitle: 'Configure statuses for the release lifecycle from design approval through production',
  accent: STATUS_ACCENT,
  icon: <ChangeCircleIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Release Status',
  fields: [
    { name: 'displayName', label: 'Status Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
    { name: 'slaActive', label: 'SLA Active', type: 'toggle' as const, defaultValue: true },
    { name: 'isFinal', label: 'Final Status', type: 'toggle' as const, defaultValue: false },
  ],
};

export * from './TicketStatuses/defaults';
export * from './ReleaseTicketStatuses/defaults';
