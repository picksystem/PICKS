import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
} from '@mui/material';
import { useStyles } from './styles';

export interface DSTableColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right' | 'justify';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
  width?: number | string;
}

export interface DSTableProps {
  columns: DSTableColumn[];
  rows: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  className?: string;
  size?: 'small' | 'medium';
  padding?: 'none' | 'normal' | 'checkbox';
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const Table: React.FC<DSTableProps> = ({
  columns,
  rows,
  onRowClick,
  stickyHeader = false,
  maxHeight,
  className,
  size = 'medium',
  padding = 'normal',
  variant = 'elevation',
  elevation = 1,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortBy,
  sortDirection = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  ...rest
}) => {
  const { cx, classes } = useStyles();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(rows.map((_, index) => index.toString()));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowIndex: number, checked: boolean) => {
    const newSelected = checked
      ? [...selectedRows, rowIndex.toString()]
      : selectedRows.filter((id) => id !== rowIndex.toString());
    onSelectionChange?.(newSelected);
  };

  const handleSort = (columnId: string) => {
    onSort?.(columnId);
  };

  if (loading) {
    return (
      <TableContainer component={Paper} className={cx(classes.root, className)}>
        <div className={classes.loading}>Loading...</div>
      </TableContainer>
    );
  }

  if (rows.length === 0) {
    return (
      <TableContainer component={Paper} className={cx(classes.root, className)}>
        <div className={classes.empty}>{emptyMessage}</div>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      component={Paper}
      className={cx(classes.root, className)}
      variant={variant}
      elevation={elevation}
      sx={{ maxHeight: maxHeight || 440 }}
    >
      <MUITable stickyHeader={stickyHeader} className={classes.table} size={size} {...rest}>
        <TableHead className={classes.header}>
          <TableRow>
            {selectable && (
              <TableCell padding='checkbox' className={classes.cell}>
                <Checkbox
                  checked={selectedRows.length === rows.length && rows.length > 0}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth, width: column.width }}
                className={classes.cell}
                padding={padding}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortBy === column.id}
                    direction={sortBy === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              className={classes.row}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {selectable && (
                <TableCell padding='checkbox' className={classes.cell}>
                  <Checkbox
                    checked={selectedRows.includes(index.toString())}
                    onChange={(e) => handleSelectRow(index, e.target.checked)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  className={classes.cell}
                  padding={padding}
                >
                  {column.format ? column.format(row[column.id]) : String(row[column.id] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};

export default Table;
