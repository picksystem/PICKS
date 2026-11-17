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
  /** In a `fixedLayout` table this column absorbs ALL the leftover
   *  horizontal space (it gets no explicit width), so every other
   *  column keeps its declared minWidth exactly and the panel's free
   *  width is never spread into gaps between the headers. Use on
   *  exactly one column — typically the last one. */
  grow?: boolean;
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
  /** Use `table-layout: fixed`: every column keeps its declared minWidth
   *  exactly (the leftover width is NEVER spread into gaps between the
   *  headers, which is what auto table layout does to full-width tables),
   *  and one `grow` column absorbs ALL the leftover space so the table
   *  still fills the panel edge-to-edge. The table only scrolls
   *  horizontally when the declared widths genuinely don't fit.
   *  Pair with a single `grow: true` column — typically the last one. */
  fixedLayout?: boolean;
}

export type Order = 'asc' | 'desc';
