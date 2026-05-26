import ChecklistIcon from '@mui/icons-material/Checklist';

export const SERVICE_LINE_APPROVALS_CONFIG = {
  title: 'Service Line Approvals',
  subtitle: 'Configure approvers for service lines',
  accent: '#0369a1',
  icon: <ChecklistIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Approver',
  fields: [
    { name: 'serviceLineName', label: 'Service Line', required: true, bold: true },
    { name: 'approverName', label: 'Approver Name', required: true, bold: true },
    { name: 'approverRole', label: 'Approver Role' },
    { name: 'approvalOrder', label: 'Approval Order', type: 'number', defaultValue: 1 },
    { name: 'isRequired', label: 'Required', type: 'toggle', defaultValue: true },
  ],
};
