import HowToRegIcon from '@mui/icons-material/HowToReg';
import { TableConfig } from '../../../shared';

export const APP_APPROVALS_CONFIG: TableConfig = {
  title: 'Application Approvals',
  subtitle: 'Configure approvers for applications',
  accent: '#0369a1',
  icon: <HowToRegIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Approver',
  fields: [
    { name: 'applicationName', label: 'Application', required: true, bold: true },
    { name: 'approverName', label: 'Approver Name', required: true, bold: true },
    { name: 'approverRole', label: 'Approver Role' },
    { name: 'approvalOrder', label: 'Approval Order', type: 'number' as const, defaultValue: 1 },
    { name: 'isRequired', label: 'Required', type: 'toggle' as const, defaultValue: true },
  ],
};
