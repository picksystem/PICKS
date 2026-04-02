import BookmarksIcon from '@mui/icons-material/Bookmarks';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TaskIcon from '@mui/icons-material/Task';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { IIncident } from '../../../../../entities/interfaces';
import { IncidentRow } from '../types/Favourites.types';

export const FAVORITES_KEY = 'serivceops_favorite_incidents';

export const TICKET_TABS = [
  { label: 'All', icon: <BookmarksIcon /> },
  { label: 'Incidents', icon: <AssignmentIcon /> },
  { label: 'Service Requests', icon: <BuildIcon /> },
  { label: 'Change Requests', icon: <ChangeCircleIcon /> },
  { label: 'Problem Requests', icon: <ReportProblemIcon /> },
  { label: 'Tasks', icon: <TaskIcon /> },
  { label: 'Ticket Templates', icon: <LibraryBooksIcon /> },
];

export const EMPTY_MESSAGES = [
  'No favourite tickets yet',
  'No favourite incidents yet',
  'No favourite service requests yet',
  'No favourite change requests yet',
  'No favourite problem requests yet',
  'No favourite tasks yet',
  'No favourite ticket templates yet',
];

export const getTableData = (list: IIncident[]): IncidentRow[] =>
  list.map((inc, i) => ({ ...inc, sno: i + 1 }));

export const getFilteredData = (list: IIncident[], search: string): IncidentRow[] => {
  const rows = getTableData(list);
  if (!search) return rows;
  return rows.filter((row) =>
    [row.number, row.caller, row.callerEmail, row.shortDescription, row.priority, row.status].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase()),
    ),
  );
};
