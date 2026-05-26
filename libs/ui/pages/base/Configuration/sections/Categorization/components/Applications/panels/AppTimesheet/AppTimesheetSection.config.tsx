import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { TableConfig } from '@serviceops/pages/base/Configuration/shared/GenericPanel/GenericPanel';

export const APP_TIMESHEET_CONFIG: TableConfig = {
  title: 'Add Timesheet Projects',
  subtitle: 'Configure timesheet projects per application',
  accent: '#0369a1',
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'fromDate', label: 'From Date', type: 'date' as const },
    { name: 'toDate', label: 'To Date', type: 'date' as const },
    { name: 'activate', label: 'Activate', type: 'toggle' as const, defaultValue: true },
    {
      name: 'maxHoursPerDayPerResource',
      label: 'Max Hours/Day',
      type: 'number' as const,
      defaultValue: 8,
    },
  ],
};
