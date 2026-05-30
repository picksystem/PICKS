import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import type { TableConfig } from '@serviceops/genericpanel';

export const TICKET_TYPE_TOGGLE_CONFIG: TableConfig = {
  title: 'Enable / Disable Application Specific Ticket Types',
  subtitle: 'Configure ticket type activations',
  accent: '#0369a1',
  icon: <ToggleOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Ticket Type',
  fields: [
    { name: 'ticketTypeName', label: 'Ticket Type', required: true, bold: true },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
  ],
};
