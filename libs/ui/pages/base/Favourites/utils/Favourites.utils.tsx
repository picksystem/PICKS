import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TaskIcon from '@mui/icons-material/Task';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { FavouriteRow } from '../types/Favourites.types';

export const FAVORITES_KEY = 'serivceops_favorite_incidents';

export const TICKET_TYPE_ICONS: Record<string, React.ReactElement> = {
  incident: <AssignmentIcon />,
  service_request: <BuildIcon />,
  advisory_request: <AssignmentIcon />,
  change_request: <ChangeCircleIcon />,
  problem_request: <ReportProblemIcon />,
  task: <TaskIcon />,
  ticket_template: <LibraryBooksIcon />,
};

export const EMPTY_MESSAGE = 'No favourite tickets yet';

export const getTableData = (list: FavouriteRow[]): FavouriteRow[] =>
  list.map((row, i) => ({ ...row, sno: i + 1 }));

export const getFilteredData = (list: FavouriteRow[], search: string): FavouriteRow[] => {
  const rows = getTableData(list);
  if (!search) return rows;
  return rows.filter((row) =>
    [row.number, row.caller, row.shortDescription, row.priority, row.status].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase()),
    ),
  );
};
