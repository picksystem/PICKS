import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { Box, Typography, Switch, Column } from '@serviceops/component';
import { TableConfig } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import type { IConfigStatusLevel } from '@serviceops/interfaces';

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

// Status name cell renderer (bold text, no colors)
const StatusNameCell = ({ row }: { row: IConfigStatusLevel }): React.ReactNode => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'text.primary' }}>
      {row.displayName}
    </Typography>
    {row.isFinal && (
      <Typography
        component='span'
        sx={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'text.secondary',
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        Final
      </Typography>
    )}
  </Box>
);

// Toggle switch cell for activation columns
const toggleCell =
  (fieldName: 'isActive' | 'slaActive', color: string) =>
  (v: unknown): React.ReactNode => (
    <Switch
      size='small'
      checked={Boolean(v)}
      onChange={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      color={color as 'success' | 'primary'}
    />
  );

// Description cell renderer
const descCell = (v: unknown): React.ReactNode => (
  <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
    {String(v || '—')}
  </Typography>
);

// Build ticket status columns
export const ticketStatusColumns = (
  activeTicketTypeColumns: Array<{ key: string; label: string }>,
): Column<IConfigStatusLevel>[] => [
  {
    id: 'displayName',
    label: 'Ticket Statuses',
    minWidth: 140,
    format: (_v, row): React.ReactNode => <StatusNameCell row={row} />,
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 220,
    format: descCell,
  },
  {
    id: 'isActive',
    label: 'Status Activation',
    minWidth: 110,
    align: 'center',
    format: (v) => toggleCell('isActive', 'success')(v),
  },
  {
    id: 'slaActive',
    label: 'SLA Activation',
    minWidth: 110,
    align: 'center',
    format: (v) => toggleCell('slaActive', 'primary')(v),
  },
  ...activeTicketTypeColumns.map(
    (t): Column<IConfigStatusLevel> => ({
      id: 'enabledFor' as keyof IConfigStatusLevel,
      label: t.label,
      minWidth: 90,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.enabledFor?.[t.key] ?? true}
          onChange={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    }),
  ),
];

// Build release status columns
export const releaseStatusColumns = (
  activeTicketTypeColumns: Array<{ key: string; label: string }>,
): Column<IConfigStatusLevel>[] => [
  {
    id: 'displayName',
    label: 'Release Cycle Statuses',
    minWidth: 180,
    format: (_v, row): React.ReactNode => <StatusNameCell row={row} />,
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 260,
    format: descCell,
  },
  {
    id: 'isActive',
    label: 'Status Activation',
    minWidth: 110,
    align: 'center',
    format: (v) => toggleCell('isActive', 'success')(v),
  },
  {
    id: 'slaActive',
    label: 'SLA Activation',
    minWidth: 110,
    align: 'center',
    format: (v) => toggleCell('slaActive', 'primary')(v),
  },
  ...activeTicketTypeColumns.map(
    (t): Column<IConfigStatusLevel> => ({
      id: 'enabledFor' as keyof IConfigStatusLevel,
      label: t.label,
      minWidth: 90,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <Switch
          size='small'
          checked={row.enabledFor?.[t.key] ?? true}
          onChange={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          color='success'
        />
      ),
    }),
  ),
];

export * from './components/TicketStatuses/defaults';
export * from './components/ReleaseTicketStatuses/defaults';
