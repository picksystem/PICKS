import DashboardIcon from '@mui/icons-material/Dashboard';
import TuneIcon from '@mui/icons-material/Tune';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ListIcon from '@mui/icons-material/List';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { constants } from '@picks/utils';

export const useMenuItems = () => {
  const { AdminPath } = constants;
  return [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: AdminPath.DASHBOARD,
    },
    {
      label: 'My Favourites Tickets',
      icon: <BookmarksIcon />,
      path: AdminPath.FAVOURITES,
    },
    {
      label: 'Recent Items',
      icon: <QueryBuilderIcon />,
      path: AdminPath.RECENT_ITEMS,
    },
    {
      label: 'Incident Management',
      icon: <AssignmentIcon />,
      path: AdminPath.INCIDENT_MANAGEMENT,
    },
    {
      label: 'Change Management',
      icon: <ChangeCircleIcon />,
      path: AdminPath.CHANGE_MANAGEMENT,
    },
    {
      label: 'Problem Management',
      icon: <ReportProblemIcon />,
      path: AdminPath.PROBLEM_MANAGEMENT,
    },
    {
      label: 'Ticket Templates',
      icon: <LocalActivityIcon />,
      path: AdminPath.TICKET_TEMPLATES,
    },
    {
      label: 'Knowledge Base',
      icon: <LibraryBooksIcon />,
      path: AdminPath.KNOWLEDGE_BASE,
    },
    {
      label: 'Cab Request',
      icon: <HowToRegIcon />,
      path: AdminPath.CAB_REQUEST,
    },
    {
      label: 'Test Scripts',
      icon: <ListIcon />,
      path: AdminPath.TEST_SCRIPTS,
    },
    {
      label: 'Time Management',
      icon: <MoreTimeIcon />,
      path: AdminPath.TIME_MANAGEMENT,
    },
    {
      label: 'Reports',
      icon: <AssessmentIcon />,
      path: AdminPath.REPORTS,
    },
    {
      label: 'User Management',
      icon: <PeopleIcon />,
      path: AdminPath.USER_MANAGEMENT,
    },
    {
      label: 'Access Requests',
      icon: <AdminPanelSettingsIcon />,
      path: AdminPath.ROLE_REQUESTS,
    },
    {
      label: 'Consultant Profiles',
      icon: <BusinessCenterIcon />,
      path: AdminPath.CONSULTANT_PROFILE,
    },
    {
      label: 'Configuration',
      icon: <TuneIcon />,
      path: AdminPath.CONFIGURATION,
    },
  ];
};
