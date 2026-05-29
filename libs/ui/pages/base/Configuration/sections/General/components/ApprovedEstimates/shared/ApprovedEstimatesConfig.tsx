import { Column, Typography } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { TableConfig } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';
import type { IConfigApprovedEstimateRow } from '@serviceops/interfaces';

export const APPROVED_ESTIMATES_ACCENT = '#0369a1';

// ── Column Definitions ─────────────────────────────────────────────────────────

export const approvedEstimateColumns = (): Column<IConfigApprovedEstimateRow>[] => [
  {
    id: 'ticketTypeId',
    label: 'Ticket Type',
    minWidth: 140,
    format: (_v, row) => (
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
        {row.ticketTypeName || '—'}
      </Typography>
    ),
  },
  {
    id: 'serviceLine',
    label: 'Service Line',
    minWidth: 130,
    format: (v) => {
      const val = v as string | undefined;
      return <Typography sx={{ fontSize: '0.82rem' }}>{val || '—'}</Typography>;
    },
  },
  {
    id: 'application',
    label: 'Application',
    minWidth: 130,
    format: (v) => {
      const val = v as string | undefined;
      return <Typography sx={{ fontSize: '0.82rem' }}>{val || '—'}</Typography>;
    },
  },
  {
    id: 'queue',
    label: 'Queue',
    minWidth: 130,
    format: (v) => {
      const val = v as string | undefined;
      return <Typography sx={{ fontSize: '0.82rem' }}>{val || '—'}</Typography>;
    },
  },
  {
    id: 'hours',
    label: 'Default Hours',
    minWidth: 120,
    align: 'right',
    format: (v) => (
      <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
        {String(v)}
      </Typography>
    ),
  },
];

// ── Table Config ───────────────────────────────────────────────────────────────

export const APPROVED_ESTIMATES_CONFIG: TableConfig = {
  title: 'Default Approved Estimates (hours)',
  subtitle: 'Set default approved estimate hours per ticket type',
  accent: APPROVED_ESTIMATES_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Approved Estimate',
  fields: [
    {
      name: 'ticketTypeId',
      label: 'Ticket Type',
      required: true,
      type: 'ticketTypeSearch' as const,
    },
    { name: 'serviceLine', label: 'Service Line' },
    { name: 'application', label: 'Application' },
    { name: 'queue', label: 'Queue' },
    { name: 'hours', label: 'Default Hours', type: 'duration' as const },
  ],
};
