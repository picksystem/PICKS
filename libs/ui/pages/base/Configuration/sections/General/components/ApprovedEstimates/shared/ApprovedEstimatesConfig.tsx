import { Box, Column, Typography } from '@serviceops/component';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { TableConfig } from '@serviceops/genericpanel';
import type { IConfigApprovedEstimateRow } from '@serviceops/interfaces';
import { mkActiveChip } from '@serviceops/pages/base/Configuration/utils/cellRenderers';
import {
  parseRichText,
  serializeRichText,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export const APPROVED_ESTIMATES_ACCENT = '#0369a1';

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
    label: 'Default Hours (HH:MM)',
    minWidth: 140,
    format: (v) => {
      const { value, minutes } = formatHours(v);
      if (minutes === null) {
        return (
          <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
            {value}
          </Typography>
        );
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      );
    },
  },
  {
    id: 'isActive',
    label: 'Activation',
    minWidth: 130,
    align: 'center' as const,
    format: (v) => mkActiveChip(v),
  },
  {
    id: 'shortDescription',
    label: 'Internal Note',
    minWidth: 180,
    format: (v) => {
      const val = v as string | undefined;
      if (!val)
        return <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>—</Typography>;

      const richTextValue = parseRichText(val);
      return (
        <Box
          sx={{
            fontSize: '0.8rem',
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {richTextValue.segments.map((segment, index) => (
            <Typography
              key={index}
              component='span'
              sx={{
                fontWeight: segment.bold ? 700 : 400,
                fontStyle: segment.italic ? 'italic' : 'normal',
                textDecoration: segment.underline ? 'underline' : 'normal',
                display: 'inline',
              }}
            >
              {segment.text}
            </Typography>
          ))}
        </Box>
      );
    },
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
    { name: 'serviceLine', label: 'Service Line', type: 'serviceLineSearch' as const },
    { name: 'application', label: 'Application', type: 'applicationSearch' as const },
    { name: 'queue', label: 'Queue', type: 'queueSearch' as const },
    {
      name: 'hours',
      label: 'Default Hours',
      required: true,
      type: 'duration' as const,
    },
    {
      name: 'shortDescription',
      label: 'Internal Note',
      type: 'richText',
    },
    {
      name: 'isActive',
      label: 'Activation',
      type: 'activationToggle' as const,
      activationDescriptionActive: 'This default estimate is enabled',
      activationDescriptionInactive: 'This default estimate is disabled',
      activationAccent: APPROVED_ESTIMATES_ACCENT,
    },
  ],
};
