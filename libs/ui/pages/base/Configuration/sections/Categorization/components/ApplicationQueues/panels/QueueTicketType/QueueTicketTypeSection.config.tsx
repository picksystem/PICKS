import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import type { TableConfig } from '@serviceops/genericpanel';

export const QUEUE_TICKET_TYPE_CONFIG: TableConfig = {
  title: 'Enable / Disable Ticket Types',
  subtitle: 'Configure ticket type activations per queue',
  accent: '#0369a1',
  icon: <ToggleOnIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Ticket Type',
  fields: [],
};
