import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const SERVICE_LINE_TIMESHEET_CONFIG = {
  title: 'Add Timesheet Projects',
  subtitle: 'Configure timesheet projects for service lines',
  accent: '#0369a1',
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'application', label: 'Application' },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
  ],
};
