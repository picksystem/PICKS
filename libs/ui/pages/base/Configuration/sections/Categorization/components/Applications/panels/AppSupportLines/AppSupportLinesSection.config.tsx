import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import type { TableConfig } from '@serviceops/genericpanel';

export const APP_SUPPORT_LINES_CONFIG: TableConfig = {
  title: 'Support Lines / Queues',
  subtitle: 'Configure support lines and queues for applications',
  accent: '#0369a1',
  icon: <HeadsetMicIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Support Line',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'queueName', label: 'Queue', required: true, bold: true },
    { name: 'isActive', label: 'Active', type: 'toggle' as const, defaultValue: true },
  ],
};
