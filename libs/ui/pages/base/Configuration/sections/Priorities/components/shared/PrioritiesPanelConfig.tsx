import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SpeedIcon from '@mui/icons-material/Speed';
import type { Column } from '@serviceops/component';
import { ImpactLevel, PriorityLevel, UrgencyLevel } from '../../util';

const PRIORITY_ACCENT = '#0369a1';

// Priority Table Config
export const PRIORITY_TABLE_CONFIG = {
  title: 'Priorities',
  subtitle: 'Define priority levels and control which ticket types each priority applies to',
  accent: PRIORITY_ACCENT,
  icon: <PriorityHighIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Priority',
  fields: [
    { name: 'name', label: 'Priority', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description' },
    { name: 'description', label: 'Description' },
    { name: 'internalNote', label: 'Internal note' },
  ],
};

// Impact Table Config
export const IMPACT_TABLE_CONFIG = {
  title: 'Impact',
  subtitle: 'Define impact levels — how broadly a ticket affects the business',
  accent: PRIORITY_ACCENT,
  icon: <WhatshotIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Impact Level',
  fields: [
    { name: 'displayName', label: 'Display Name', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description' },
    { name: 'description', label: 'Description' },
    { name: 'internalNote', label: 'Internal note' },
    { name: 'bgColor', label: 'Color' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const },
  ],
};

// Urgency Table Config
export const URGENCY_TABLE_CONFIG = {
  title: 'Urgency',
  subtitle: 'Define urgency levels — how time-sensitive a ticket is',
  accent: PRIORITY_ACCENT,
  icon: <SpeedIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />,
  entity: 'Urgency Level',
  fields: [
    { name: 'displayName', label: 'Display Name', required: true, bold: true },
    { name: 'shortDescription', label: 'Short Description' },
    { name: 'description', label: 'Description' },
    { name: 'internalNote', label: 'Internal note' },
    { name: 'bgColor', label: 'Color' },
    { name: 'isActive', label: 'Active', type: 'toggle' as const },
  ],
};

// Column definitions for priorities table
export const priorityColumns: Column<PriorityLevel>[] = [
  {
    id: 'name',
    label: 'Priority Name',
    minWidth: 130,
    format: (_v, row): React.ReactNode => (
      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{row.name}</span>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 220,
    format: (v): React.ReactNode => (
      <span style={{ color: 'text.secondary', fontSize: '0.78rem' }}>{String(v || '—')}</span>
    ),
  },
];

// Column definitions for impact/urgency tables
export const levelColumns: Column<ImpactLevel | UrgencyLevel>[] = [
  {
    id: 'displayName',
    label: 'Display Name',
    minWidth: 120,
    format: (_v, row): React.ReactNode => (
      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{row.displayName}</span>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 220,
    format: (v): React.ReactNode => (
      <span style={{ color: 'text.secondary', fontSize: '0.78rem' }}>{String(v || '—')}</span>
    ),
  },
  {
    id: 'isActive',
    label: 'Active',
    minWidth: 80,
    align: 'center' as const,
  },
];

export type PrioritySubView = 'priority' | 'impact' | 'urgency';
