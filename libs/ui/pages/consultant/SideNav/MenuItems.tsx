import DashboardIcon from '@mui/icons-material/Dashboard';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { constants } from '@serviceops/utils';

export const useMenuItems = () => {
  const { ConsultantPath } = constants;
  return [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: ConsultantPath.DASHBOARD,
    },
    {
      label: 'Change Management',
      icon: <ChangeCircleIcon />,
      path: ConsultantPath.CHANGE_MANAGEMENT,
    },
    {
      label: 'Problem Management',
      icon: <ReportProblemIcon />,
      path: ConsultantPath.PROBLEM_MANAGEMENT,
    },
    {
      label: 'Create Ticket',
      icon: <AssignmentIcon />,
      path: ConsultantPath.CREATE_TICKET,
    },
  ];
};
