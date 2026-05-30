import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import type { TableConfig } from '@serviceops/genericpanel';

export type CPActiveView =
  | 'profiles'
  | 'userProfiles'
  | 'workingTimes'
  | 'workingShifts'
  | 'timesheetProjects'
  | 'expenseProjects'
  | 'consultantRoles';

export const CP_ACCENT = '#0369a1';

export const CONSULTANT_PROFILES_CONFIG: TableConfig = {
  title: 'Consultant Profiles',
  subtitle: 'Manage consultant profiles and their calendar assignments',
  accent: CP_ACCENT,
  icon: <BusinessCenterIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant Profile',
  fields: [
    { name: 'consultantName', label: 'Consultant Name', required: true, bold: true },
    { name: 'applicationName', label: 'Application' },
    { name: 'consultantRole', label: 'Consultant Role' },
    { name: 'workingCalendar', label: 'Working Calendar' },
    { name: 'holidayCalendar', label: 'Holiday Calendar' },
    { name: 'leadConsultant', label: 'Lead Consultant' },
    { name: 'manager', label: 'Manager' },
  ],
};

export const USER_PROFILES_CONFIG: TableConfig = {
  title: 'Associated User Profiles',
  subtitle: 'Manage user profile associations',
  accent: CP_ACCENT,
  icon: <PersonIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'User Profile',
  fields: [
    { name: 'userId', label: 'User ID' },
    { name: 'userName', label: 'User Name', required: true, bold: true },
    { name: 'email', label: 'Email' },
    { name: 'role', label: 'Role' },
  ],
};

export const WORKING_TIMES_CONFIG: TableConfig = {
  title: 'Working Times',
  subtitle: 'Configure consultant working times and timezone',
  accent: CP_ACCENT,
  icon: <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Time',
  fields: [
    { name: 'consultantName', label: 'Consultant Name' },
    { name: 'startTime', label: 'Start Time', defaultValue: '09:00', type: 'time', bold: true },
    { name: 'endTime', label: 'End Time', defaultValue: '17:00', type: 'time' },
    { name: 'timezone', label: 'Timezone' },
  ],
};

export const WORKING_SHIFTS_CONFIG: TableConfig = {
  title: 'Working Shifts',
  subtitle: 'Configure consultant working shifts',
  accent: CP_ACCENT,
  icon: <UpdateIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Working Shift',
  fields: [
    { name: 'consultantName', label: 'Consultant Name' },
    { name: 'shiftName', label: 'Shift Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
  ],
};

export const TIMESHEET_PROJECTS_CONFIG: TableConfig = {
  title: 'Timesheet Projects',
  subtitle: 'Configure timesheet projects per consultant',
  accent: CP_ACCENT,
  icon: <ReceiptLongIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Timesheet Project',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'application', label: 'Application' },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'maxHoursPerDayPerResource', label: 'Max Hours/Day', type: 'number', defaultValue: 8 },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
  ],
};

export const EXPENSE_PROJECTS_CONFIG: TableConfig = {
  title: 'Expense Projects',
  subtitle: 'Configure expense projects per consultant',
  accent: CP_ACCENT,
  icon: <AttachMoneyIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Expense Project',
  fields: [
    { name: 'project', label: 'Project', required: true, bold: true },
    { name: 'application', label: 'Application' },
    { name: 'fromDate', label: 'From Date', type: 'date' },
    { name: 'toDate', label: 'To Date', type: 'date' },
    { name: 'maxAmountPerDay', label: 'Max Amount/Day', type: 'number', defaultValue: 0 },
    { name: 'activate', label: 'Activate', type: 'toggle', defaultValue: true },
  ],
};

export const CONSULTANT_ROLES_CONFIG: TableConfig = {
  title: 'Consultant Roles',
  subtitle: 'Define roles available for consultant assignments',
  accent: CP_ACCENT,
  icon: <GroupAddIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant Role',
  fields: [
    { name: 'roleName', label: 'Role Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
  ],
};

export const ASSOC_CONSULTANT_PROFILES_CONFIG: TableConfig = {
  title: 'Associated Consultant Profiles',
  subtitle: 'Configure consultant profile associations',
  accent: CP_ACCENT,
  icon: <GroupAddIcon sx={{ fontSize: '1.1rem' }} />,
  entity: 'Consultant Profile Association',
  fields: [
    { name: 'application', label: 'Application', required: true, bold: true },
    { name: 'roleName', label: 'Role Name', required: true, bold: true },
    { name: 'description', label: 'Description' },
  ],
};

export const CP_TABLE_CONFIG: Record<CPActiveView, TableConfig> = {
  profiles: CONSULTANT_PROFILES_CONFIG,
  userProfiles: USER_PROFILES_CONFIG,
  workingTimes: WORKING_TIMES_CONFIG,
  workingShifts: WORKING_SHIFTS_CONFIG,
  timesheetProjects: TIMESHEET_PROJECTS_CONFIG,
  expenseProjects: EXPENSE_PROJECTS_CONFIG,
  consultantRoles: CONSULTANT_ROLES_CONFIG,
};
