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
import { constants } from '@serviceops/utils';

interface MenuItemConfig {
  label: string;
  icon: React.ReactNode;
  pathKey: string;
}

const adminMenuItems: MenuItemConfig[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, pathKey: 'DASHBOARD' },
  { label: 'My Favourites Tickets', icon: <BookmarksIcon />, pathKey: 'FAVOURITES' },
  { label: 'Recent Items', icon: <QueryBuilderIcon />, pathKey: 'RECENT_ITEMS' },
  { label: 'Incident Management', icon: <AssignmentIcon />, pathKey: 'INCIDENT_MANAGEMENT' },
  { label: 'Change Management', icon: <ChangeCircleIcon />, pathKey: 'CHANGE_MANAGEMENT' },
  { label: 'Problem Management', icon: <ReportProblemIcon />, pathKey: 'PROBLEM_MANAGEMENT' },
  { label: 'Ticket Templates', icon: <LocalActivityIcon />, pathKey: 'TICKET_TEMPLATES' },
  { label: 'Knowledge Base', icon: <LibraryBooksIcon />, pathKey: 'KNOWLEDGE_BASE' },
  { label: 'Cab Request', icon: <HowToRegIcon />, pathKey: 'CAB_REQUEST' },
  { label: 'Test Scripts', icon: <ListIcon />, pathKey: 'TEST_SCRIPTS' },
  { label: 'Time Management', icon: <MoreTimeIcon />, pathKey: 'TIME_MANAGEMENT' },
  { label: 'Reports', icon: <AssessmentIcon />, pathKey: 'REPORTS' },
  { label: 'User Management', icon: <PeopleIcon />, pathKey: 'USER_MANAGEMENT' },
  { label: 'Access Requests', icon: <AdminPanelSettingsIcon />, pathKey: 'ROLE_REQUESTS' },
  { label: 'Consultant Profiles', icon: <BusinessCenterIcon />, pathKey: 'CONSULTANT_PROFILE' },
  { label: 'Configuration', icon: <TuneIcon />, pathKey: 'CONFIGURATION' },
];

const userMenuItems: MenuItemConfig[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, pathKey: 'DASHBOARD' },
  { label: 'My Favourites Tickets', icon: <BookmarksIcon />, pathKey: 'FAVOURITES' },
  { label: 'Recent Items', icon: <QueryBuilderIcon />, pathKey: 'RECENT_ITEMS' },
  { label: 'Incident Management', icon: <AssignmentIcon />, pathKey: 'INCIDENT_MANAGEMENT' },
  { label: 'Change Management', icon: <ChangeCircleIcon />, pathKey: 'CHANGE_MANAGEMENT' },
  { label: 'Problem Management', icon: <ReportProblemIcon />, pathKey: 'PROBLEM_MANAGEMENT' },
];

const consultantMenuItems: MenuItemConfig[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, pathKey: 'DASHBOARD' },
  { label: 'Change Management', icon: <ChangeCircleIcon />, pathKey: 'CHANGE_MANAGEMENT' },
  { label: 'Problem Management', icon: <ReportProblemIcon />, pathKey: 'PROBLEM_MANAGEMENT' },
];

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const useMenuItems = (role: 'admin' | 'user' | 'consultant' = 'admin'): MenuItem[] => {
  const { BasePath, UserPath, ConsultantPath } = constants;

  const pathMap = {
    admin: BasePath,
    user: UserPath,
    consultant: ConsultantPath,
  };

  const menuConfig = {
    admin: adminMenuItems,
    user: userMenuItems,
    consultant: consultantMenuItems,
  };

  const activePath = pathMap[role];
  const items = menuConfig[role];

  return items.map((item) => ({
    label: item.label,
    icon: item.icon,
    path: (activePath as any)[item.pathKey] as string,
  }));
};
