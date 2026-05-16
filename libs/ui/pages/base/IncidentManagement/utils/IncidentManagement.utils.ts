import { IIncident, IncidentStatus } from '../../../../../entities/interfaces';
import { IncidentRow } from '../types/IncidentManagement.types';

export const FAVORITES_KEY = 'serivceops_favorite_incidents';

export const buildTabLists = (allIncidents: IIncident[]): IIncident[][] => [
  allIncidents,
  allIncidents.filter((i) => i.status === IncidentStatus.NEW),
  allIncidents.filter(
    (i) => i.status === IncidentStatus.IN_PROGRESS || i.status === IncidentStatus.ASSIGNED,
  ),
  allIncidents.filter((i) => i.status === IncidentStatus.ON_HOLD),
  allIncidents.filter(
    (i) => i.status === IncidentStatus.RESOLVED || i.status === IncidentStatus.CLOSED,
  ),
  allIncidents.filter((i) => i.status === IncidentStatus.DRAFT),
];

export const getTableData = (list: IIncident[]): IncidentRow[] =>
  list.map((inc, i) => ({ ...inc, sno: i + 1 }));

export const getFilteredData = (list: IIncident[], search: string): IncidentRow[] => {
  const rows = getTableData(list);
  if (!search) return rows;
  return rows.filter((row) =>
    [
      row.number,
      row.caller,
      row.callerEmail,
      row.shortDescription,
      row.priority,
      row.status,
      row.assignmentGroup,
    ].some((v) => v && String(v).toLowerCase().includes(search.toLowerCase())),
  );
};
