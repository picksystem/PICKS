import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { Box, Typography, Column } from '@serviceops/component';
import { TableConfig } from '@serviceops/genericpanel';
import type { IConfigStatusLevel } from '@serviceops/interfaces';
import {
  parseRichText,
  segmentsToHtml,
} from '@serviceops/pages/base/Configuration/shared/RichTextEditor';

export const STATUS_ACCENT = '#0369a1';

const renderRichTextCell = (v: unknown, maxWidth: number): React.ReactNode => {
  const raw = String(v || '');
  if (!raw) {
    return (
      <Typography
        variant='body2'
        color='text.secondary'
        fontSize='0.78rem'
        sx={{ fontStyle: 'italic' }}
      >
        —
      </Typography>
    );
  }
  const html = segmentsToHtml(parseRichText(raw).segments);
  const plainText = parseRichText(raw)
    .segments.map((s) => s.text)
    .join(' • ');
  return (
    <Box
      title={plainText}
      sx={{
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        color: 'text.secondary',
        lineHeight: 1.5,
        '& b': { fontWeight: 700, color: 'text.primary' },
        '& i': { fontStyle: 'italic' },
        '& u': { textDecoration: 'underline' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Active / Inactive pill chip (matches priority page style)
const ActivationChip = ({ isActive }: { isActive: boolean }): React.ReactNode => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.75,
      px: 1.25,
      py: 0.4,
      borderRadius: 999,
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      minWidth: 96,
      border: '1px solid',
      borderColor: isActive ? '#16a34a' : '#cbd5e1',
      bgcolor: isActive ? '#dcfce7' : '#f1f5f9',
      color: isActive ? '#15803d' : '#64748b',
    }}
  >
    <Box
      component='span'
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        bgcolor: isActive ? '#16a34a' : '#94a3b8',
        boxShadow: isActive ? '0 0 0 3px rgba(22, 163, 74, 0.18)' : 'none',
      }}
    />
    {isActive ? 'Active' : 'Inactive'}
  </Box>
);

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

// Status name cell renderer (bold text with color dot and Final chip)
const StatusNameCell = ({ row }: { row: IConfigStatusLevel }): React.ReactNode => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: row.bgColor || 'grey.500',
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
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

// Description cell renderer
const descCell = (v: unknown): React.ReactNode => (
  <Typography variant='body2' color='text.secondary' fontSize='0.78rem'>
    {String(v || '—')}
  </Typography>
);

// Build ticket status columns
export const ticketStatusColumns = (
  activeTicketTypeColumns: Array<{ key: string; label: string }>,
  onUpdateRow: (id: string, patch: Partial<IConfigStatusLevel>) => void,
): Column<IConfigStatusLevel>[] => [
  {
    id: 'displayName',
    label: 'Ticket Status',
    minWidth: 160,
    format: (_v, row): React.ReactNode => <StatusNameCell row={row} />,
  },
  {
    id: 'shortDescription',
    label: 'Short Description',
    minWidth: 200,
    format: (v): React.ReactNode => renderRichTextCell(v, 240),
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 240,
    format: (v): React.ReactNode => renderRichTextCell(v, 300),
  },
  {
    id: 'isActive',
    label: 'Status Activation',
    minWidth: 120,
    align: 'center',
    format: (_v, row): React.ReactNode => <ActivationChip isActive={Boolean(row.isActive)} />,
  },
  {
    id: 'slaActive',
    label: 'SLA Activation',
    minWidth: 120,
    align: 'center',
    format: (_v, row): React.ReactNode => <ActivationChip isActive={Boolean(row.slaActive)} />,
  },
  {
    id: 'internalNote',
    label: 'Internal note',
    minWidth: 200,
    format: (v): React.ReactNode => renderRichTextCell(v, 260),
  },
  ...activeTicketTypeColumns.map(
    (t): Column<IConfigStatusLevel> => ({
      id: `enabledFor_${t.key}` as keyof IConfigStatusLevel,
      label: t.label,
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <ActivationChip isActive={row.enabledFor?.[t.key] ?? true} />
      ),
    }),
  ),
];

// Build release status columns
export const releaseStatusColumns = (
  activeTicketTypeColumns: Array<{ key: string; label: string }>,
  onUpdateRow: (id: string, patch: Partial<IConfigStatusLevel>) => void,
): Column<IConfigStatusLevel>[] => [
  {
    id: 'displayName',
    label: 'Release Cycle Status',
    minWidth: 180,
    format: (_v, row): React.ReactNode => <StatusNameCell row={row} />,
  },
  {
    id: 'shortDescription',
    label: 'Short Description',
    minWidth: 200,
    format: (v): React.ReactNode => renderRichTextCell(v, 260),
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 240,
    format: (v): React.ReactNode => renderRichTextCell(v, 300),
  },
  {
    id: 'isActive',
    label: 'Status Activation',
    minWidth: 120,
    align: 'center',
    format: (_v, row): React.ReactNode => <ActivationChip isActive={Boolean(row.isActive)} />,
  },
  {
    id: 'slaActive',
    label: 'SLA Activation',
    minWidth: 120,
    align: 'center',
    format: (_v, row): React.ReactNode => <ActivationChip isActive={Boolean(row.slaActive)} />,
  },
  {
    id: 'internalNote',
    label: 'Internal note',
    minWidth: 200,
    format: (v): React.ReactNode => renderRichTextCell(v, 260),
  },
  ...activeTicketTypeColumns.map(
    (t): Column<IConfigStatusLevel> => ({
      id: `enabledFor_${t.key}` as keyof IConfigStatusLevel,
      label: t.label,
      minWidth: 110,
      align: 'center',
      format: (_v, row): React.ReactNode => (
        <ActivationChip isActive={row.enabledFor?.[t.key] ?? true} />
      ),
    }),
  ),
];

export * from './components/TicketStatuses/defaults';
export * from './components/ReleaseTicketStatuses/defaults';
