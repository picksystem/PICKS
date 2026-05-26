import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AccentColor, ActiveView, TableConfig } from '../ApprovalsSection.types';

export const TABLE_CONFIG: Record<ActiveView, TableConfig> = {
  records: {
    title: 'Approval Records',
    subtitle: 'Configure consultant, application, and SLA settings',
    accent: AccentColor,
    icon: <HowToRegIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Approval Record',
    fields: [
      { name: 'consultant', label: 'Consultant', required: true, bold: true },
      { name: 'application', label: 'Application' },
      { name: 'consultantRole', label: 'Consultant Role' },
      { name: 'slaWorkingTimeCalendar', label: 'SLA Working Time Calendar' },
      { name: 'slaExceptionGroup', label: 'SLA Exception Group' },
      { name: 'leadConsultant', label: 'Lead Consultant' },
      { name: 'manager', label: 'Manager' },
    ],
  },
  userProfile: {
    title: 'Associated User Profiles',
    subtitle: 'Configure user profile settings',
    accent: AccentColor,
    icon: <PersonIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'User Profile',
    fields: [
      { name: 'userId', label: 'User ID' },
      { name: 'userName', label: 'User Name', bold: true },
      { name: 'email', label: 'Email' },
      { name: 'department', label: 'Department' },
    ],
  },
  consultantRoles: {
    title: 'Consultant Roles',
    subtitle: 'Configure consultant role settings',
    accent: AccentColor,
    icon: <ManageAccountsIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Consultant Role',
    fields: [
      { name: 'roleName', label: 'Role Name', required: true, bold: true },
      { name: 'description', label: 'Description' },
      { name: 'level', label: 'Level' },
    ],
  },
  workingTimes: {
    title: 'Working Times',
    subtitle: 'Configure working time settings',
    accent: AccentColor,
    icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Working Time',
    fields: [
      { name: 'startTime', label: 'Start Time', defaultValue: '09:00', bold: true },
      { name: 'endTime', label: 'End Time', defaultValue: '17:00' },
      { name: 'timezone', label: 'Timezone' },
    ],
  },
};
