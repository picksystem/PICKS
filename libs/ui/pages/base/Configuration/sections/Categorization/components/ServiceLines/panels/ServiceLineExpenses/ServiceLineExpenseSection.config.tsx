import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export const SERVICE_LINE_EXPENSES_CONFIG = {
  title: 'Add Expenses Projects',
  subtitle: 'Configure expense projects for service lines',
  accent: '#0369a1',
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'application', label: 'Application' },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
  ],
};
