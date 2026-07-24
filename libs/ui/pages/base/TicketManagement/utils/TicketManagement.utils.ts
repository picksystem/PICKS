import { TicketManagementRow } from '../types/TicketManagement.types';

export const getTableData = (list: TicketManagementRow[]): TicketManagementRow[] =>
  list.map((row, i) => ({ ...row, sno: i + 1 }));

export const getFilteredData = (
  list: TicketManagementRow[],
  search: string,
): TicketManagementRow[] => {
  const rows = getTableData(list);
  if (!search) return rows;
  const query = search.toLowerCase();
  return rows.filter((row) =>
    [
      row.number,
      row.caller,
      row.shortDescription,
      row.priority,
      row.status,
      row.assignmentGroup,
      row.ticketTypeName,
    ].some((v) => v && String(v).toLowerCase().includes(query)),
  );
};
