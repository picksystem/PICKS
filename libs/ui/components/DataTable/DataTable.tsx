import React, { useState, useMemo } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useStyles } from './styles';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
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
}

type Order = 'asc' | 'desc';

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  title,
  selectable = false,
  onRowClick,
  onDelete,
  searchable = true,
  initialRowsPerPage = 10,
  elevation = 1,
  activeRowKey,
}: DataTableProps<T>) {
  const { classes, cx } = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [orderBy, setOrderBy] = useState<keyof T | string>('');
  const [order, setOrder] = useState<Order>('asc');
  const [selected, setSelected] = useState<Set<T[keyof T]>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property: keyof T | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(data.map((row) => row[rowKey]));
      setSelected(newSelected);
      return;
    }
    setSelected(new Set());
  };

  const handleClick = (row: T) => {
    if (selectable) {
      const id = row[rowKey];
      const newSelected = new Set(selected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelected(newSelected);
    }
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = () => {
    if (onDelete) {
      const selectedRows = data.filter((row) => selected.has(row[rowKey]));
      onDelete(selectedRows);
      setSelected(new Set());
    }
  };

  const isSelected = (id: T[keyof T]) => selected.has(id);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.id as keyof T];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      }),
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy as keyof T];
      const bValue = b[orderBy as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, order, orderBy]);

  // Paginate data
  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  return (
    <Paper elevation={elevation}>
      {(title || selectable || searchable) && (
        <Toolbar className={cx(selected.size > 0 ? classes.toolbarSelected : classes.toolbar)}>
          {selected.size > 0 ? (
            <Typography
              className={classes.title}
              color='inherit'
              variant='subtitle1'
              component='div'
            >
              {selected.size} selected
            </Typography>
          ) : (
            <Typography className={classes.title} variant='h6' id='tableTitle' component='div'>
              {title}
            </Typography>
          )}

          {searchable && selected.size === 0 && (
            <TextField
              size='small'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              className={classes.searchField}
            />
          )}

          {selected.size > 0 ? (
            <>
              {onDelete && (
                <Tooltip title='Delete'>
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : (
            <Tooltip title='Filter list'>
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      )}

      <TableContainer>
        <MuiTable stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={selected.size > 0 && selected.size < data.length}
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align ?? 'left'}
                  className={classes.tableCell}
                  style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
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
            {paginatedData.map((row) => {
              const isItemSelected = isSelected(row[rowKey]);
              const isActive = activeRowKey !== undefined && row[rowKey] === activeRowKey;

              return (
                <TableRow
                  hover
                  onClick={() => handleClick(row)}
                  role='checkbox'
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={String(row[rowKey])}
                  selected={isItemSelected}
                  className={
                    isActive
                      ? classes.highlightedRow
                      : onRowClick || selectable
                        ? classes.clickableRow
                        : classes.defaultRow
                  }
                  sx={
                    isActive
                      ? {
                          '@keyframes rowFlash': {
                            '0%': { backgroundColor: 'rgba(30,66,159,0.32)' },
                            '60%': { backgroundColor: 'rgba(30,66,159,0.14)' },
                            '100%': { backgroundColor: 'transparent' },
                          },
                          animation: 'rowFlash 0.55s ease-out',
                        }
                      : undefined
                  }
                >
                  {selectable && (
                    <TableCell padding='checkbox'>
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id as keyof T];
                    return (
                      <TableCell key={String(column.id)} align={column.align ?? 'left'}>
                        {column.format ? column.format(value, row) : String(value ?? '')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align='center'
                  className={classes.emptyCell}
                >
                  <Typography variant='body2' color='text.secondary'>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component='div'
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
