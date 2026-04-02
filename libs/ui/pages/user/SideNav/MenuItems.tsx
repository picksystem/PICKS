import DashboardIcon from '@mui/icons-material/Dashboard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArticleIcon from '@mui/icons-material/Article';
import { constants } from '@serviceops/utils';

export const useMenuItems = () => {
  const { UserPath } = constants;
  return [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: UserPath.DASHBOARD,
    },
    {
      label: 'Favourites',
      icon: <FavoriteBorderIcon />,
      path: UserPath.FAVOURITES,
    },
    {
      label: 'Recent Items',
      icon: <ScheduleIcon />,
      path: UserPath.RECENT_ITEMS,
    },
    {
      label: 'Incident Management',
      icon: <ArticleIcon />,
      path: UserPath.INCIDENT_MANAGEMENT,
    },
    {
      label: 'Change Management',
      icon: <ArticleIcon />,
      path: UserPath.CHANGE_MANAGEMENT,
    },
    {
      label: 'Problem Management',
      icon: <ArticleIcon />,
      path: UserPath.PROBLEM_MANAGEMENT,
    },
  ];
};
