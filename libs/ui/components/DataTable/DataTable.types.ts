export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  /** Custom header node (e.g. a select-all checkbox) that replaces the
   *  plain label / sort label. Renders unsorted when present. */
  header?: React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  title?: string;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onDelete?: (selectedRows: T[]) => void;
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  searchable?: boolean;
  initialRowsPerPage?: number;
  elevation?: number;
  activeRowKey?: T[keyof T];
  /** Size the table to its content instead of stretching to the container
   *  width: columns keep their declared minWidth and the table scrolls
   *  horizontally only if it genuinely overflows. Removes the big gaps
   *  that a full-width stretch leaves between tight columns. */
  fitContent?: boolean;
}

export type Order = 'asc' | 'desc';
