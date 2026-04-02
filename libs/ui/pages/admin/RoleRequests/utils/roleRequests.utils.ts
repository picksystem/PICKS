import { IAuthUser } from '@serviceops/interfaces';
import { RoleRequestRow } from '../types/roleRequests.types';

export const getTableData = (list: IAuthUser[]): RoleRequestRow[] =>
  list.map((r, i) => ({ ...r, sno: i + 1 }));

export const getFilteredData = (list: IAuthUser[], search: string): RoleRequestRow[] => {
  const rows = getTableData(list);
  if (!search) return rows;
  return rows.filter((row) =>
    Object.values(row).some(
      (val) =>
        val !== null &&
        val !== undefined &&
        String(val).toLowerCase().includes(search.toLowerCase()),
    ),
  );
};

export const getTabLists = (requests: IAuthUser[]) => ({
  all: requests,
  pending: requests.filter((r) => r.status === 'pending_approval'),
  approved: requests.filter((r) => r.status === 'active' || r.status === 'invited'),
  rejected: requests.filter((r) => r.status === 'rejected'),
});
