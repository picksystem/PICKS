import { UserRow, ChangeLogEntry } from '../../types/userManagement.types';

export interface ChangesLogDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  changeLog: ChangeLogEntry[];
  isLoadingLog: boolean;
  logSearch: string;
  onLogSearchChange: (v: string) => void;
  logDateFrom: string;
  onLogDateFromChange: (v: string) => void;
  logDateTo: string;
  onLogDateToChange: (v: string) => void;
  logFilterField: string;
  onLogFilterFieldChange: (v: string) => void;
  logFilterReason: string;
  onLogFilterReasonChange: (v: string) => void;
  logSortBy: string;
  logSortOrder: 'asc' | 'desc';
  onLogSort: (col: string) => void;
  logPage: number;
  onLogPageChange: (p: number) => void;
  logRowsPerPage: number;
  onLogRowsPerPageChange: (rpp: number) => void;
  logMaximized: boolean;
  onLogMaximizedChange: (v: boolean) => void;
  logShowFilters: boolean;
  onLogShowFiltersChange: (v: boolean) => void;
  uniqueLogFields: string[];
  filteredLog: ChangeLogEntry[];
  paginatedLog: ChangeLogEntry[];
  hasLogFilters: boolean;
  onClearLogFilters: () => void;
  onExportCsv: () => void;
}