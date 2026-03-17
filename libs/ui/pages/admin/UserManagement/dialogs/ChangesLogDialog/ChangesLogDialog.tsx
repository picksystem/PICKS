import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
  Tooltip,
  Grid,
} from '@mui/material';
import { Loader, UserAvatar } from '@picks/component';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useStyles } from './styles';
import { UserRow, ChangeLogEntry } from '../../types/userManagement.types';
import {
  LOG_COLUMNS,
  CHANGE_TYPE_COLORS,
  ROLE_CHANGE_REASON_CODES,
  formatChangeType,
  fmtDateTime,
} from '../../utils/userManagement.utils';

interface ChangesLogDialogProps {
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

const ChangesLogDialog = ({
  open,
  onClose,
  selectedRow,
  changeLog,
  isLoadingLog,
  logSearch,
  onLogSearchChange,
  logDateFrom,
  onLogDateFromChange,
  logDateTo,
  onLogDateToChange,
  logFilterField,
  onLogFilterFieldChange,
  logFilterReason,
  onLogFilterReasonChange,
  logSortBy,
  logSortOrder,
  onLogSort,
  logPage,
  onLogPageChange,
  logRowsPerPage,
  onLogRowsPerPageChange,
  logMaximized,
  onLogMaximizedChange,
  logShowFilters,
  onLogShowFiltersChange,
  uniqueLogFields,
  filteredLog,
  paginatedLog,
  hasLogFilters,
  onClearLogFilters,
  onExportCsv,
}: ChangesLogDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={logMaximized ? false : 'xl'}
      fullWidth
      fullScreen={logMaximized}
      slotProps={{
        paper: {
          sx: {
            borderRadius: logMaximized ? 0 : 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...(logMaximized ? {} : { maxHeight: '90vh' }),
          },
        },
      }}
    >
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.badgeRow}>
          <HistoryIcon className={classes.badgeIcon} />
          <Typography variant='caption' fontWeight={700} className={classes.badgeLabel}>
            Audit Trail
          </Typography>
          <Chip
            label={`${changeLog.length} records`}
            size='small'
            className={classes.recordsChip}
          />
          {hasLogFilters && (
            <Chip
              label={`${filteredLog.length} shown`}
              size='small'
              className={classes.filteredChip}
            />
          )}
        </Box>

        <Box className={classes.userCard}>
          <UserAvatar user={selectedRow ?? {}} size={56} className={classes.headerAvatar} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='h6' fontWeight={700} className={classes.headerTitle}>
              {selectedRow?.name}
            </Typography>
            <Typography variant='body2' className={classes.headerEmail}>
              {selectedRow?.email}
            </Typography>
            <Box className={classes.chipRowInline}>
              <Chip
                label={
                  selectedRow?.role
                    ? selectedRow.role.charAt(0).toUpperCase() + selectedRow.role.slice(1)
                    : '-'
                }
                size='small'
                className={classes.roleChip}
              />
              <Typography variant='caption' className={classes.metaCaption}>
                {changeLog.length > 0
                  ? `Last change: ${fmtDateTime(changeLog[0]?.createdAt)}`
                  : 'No changes recorded yet'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Window controls */}
        <Box className={classes.windowControls}>
          <Tooltip title={logShowFilters ? 'Hide filters' : 'Show filters'}>
            <IconButton
              size='small'
              onClick={() => onLogShowFiltersChange(!logShowFilters)}
              className={logShowFilters ? classes.filterBtnActive : classes.windowCtrlBtn}
            >
              {logShowFilters ? (
                <FilterAltIcon fontSize='small' />
              ) : (
                <FilterAltOffIcon fontSize='small' />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={logMaximized ? 'Restore' : 'Maximize'}>
            <IconButton
              size='small'
              onClick={() => onLogMaximizedChange(!logMaximized)}
              className={classes.windowCtrlBtn}
            >
              {logMaximized ? (
                <FullscreenExitIcon fontSize='small' />
              ) : (
                <FullscreenIcon fontSize='small' />
              )}
            </IconButton>
          </Tooltip>
          <IconButton size='small' onClick={onClose} className={classes.windowCtrlBtn}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Filter toolbar */}
      {logShowFilters && (
        <Box className={classes.filterToolbar}>
          <Grid container spacing={1.5} alignItems='center'>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size='small'
                fullWidth
                placeholder='Find text…'
                value={logSearch}
                onChange={(e) => {
                  onLogSearchChange(e.target.value);
                  onLogPageChange(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon className={classes.searchIcon} />
                      </InputAdornment>
                    ),
                    endAdornment: logSearch ? (
                      <InputAdornment position='end'>
                        <IconButton size='small' onClick={() => onLogSearchChange('')}>
                          <CloseIcon sx={{ fontSize: '0.85rem' }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                size='small'
                fullWidth
                label='From'
                type='date'
                slotProps={{ inputLabel: { shrink: true } }}
                value={logDateFrom}
                onChange={(e) => {
                  onLogDateFromChange(e.target.value);
                  onLogPageChange(0);
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                size='small'
                fullWidth
                label='To'
                type='date'
                slotProps={{ inputLabel: { shrink: true } }}
                value={logDateTo}
                onChange={(e) => {
                  onLogDateToChange(e.target.value);
                  onLogPageChange(0);
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Field Changed</InputLabel>
                <Select
                  value={logFilterField}
                  label='Field Changed'
                  onChange={(e) => {
                    onLogFilterFieldChange(e.target.value);
                    onLogPageChange(0);
                  }}
                >
                  <MenuItem value=''>All Fields</MenuItem>
                  {uniqueLogFields.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Reason Code</InputLabel>
                <Select
                  value={logFilterReason}
                  label='Reason Code'
                  onChange={(e) => {
                    onLogFilterReasonChange(e.target.value);
                    onLogPageChange(0);
                  }}
                >
                  <MenuItem value=''>All Reasons</MenuItem>
                  {ROLE_CHANGE_REASON_CODES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {hasLogFilters && (
            <Box className={classes.activeFiltersRow}>
              <Typography variant='caption' color='text.secondary' fontWeight={600}>
                Active filters:
              </Typography>
              {logSearch && (
                <Chip
                  label={`Text: "${logSearch}"`}
                  size='small'
                  onDelete={() => onLogSearchChange('')}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {logDateFrom && (
                <Chip
                  label={`From: ${logDateFrom}`}
                  size='small'
                  onDelete={() => onLogDateFromChange('')}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {logDateTo && (
                <Chip
                  label={`To: ${logDateTo}`}
                  size='small'
                  onDelete={() => onLogDateToChange('')}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {logFilterField && (
                <Chip
                  label={`Field: ${logFilterField}`}
                  size='small'
                  onDelete={() => onLogFilterFieldChange('')}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {logFilterReason && (
                <Chip
                  label={`Reason: ${ROLE_CHANGE_REASON_CODES.find((r) => r.value === logFilterReason)?.label || logFilterReason}`}
                  size='small'
                  onDelete={() => onLogFilterReasonChange('')}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              <Button
                size='small'
                color='error'
                variant='text'
                onClick={onClearLogFilters}
                sx={{ fontSize: '0.72rem', px: 0.75, py: 0, height: 20, minWidth: 'unset' }}
              >
                Clear all
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Table */}
      <DialogContent className={classes.dialogContent}>
        {isLoadingLog ? (
          <Box sx={{ p: 4 }}>
            <Loader />
          </Box>
        ) : filteredLog.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <HistoryIcon className={classes.emptyStateIcon} />
            <Typography variant='body1' color='text.secondary' fontWeight={500}>
              {hasLogFilters
                ? 'No records match the current filters'
                : 'No change records found for this user'}
            </Typography>
            {hasLogFilters && (
              <Button onClick={onClearLogFilters} variant='outlined' size='small' sx={{ mt: 2 }}>
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                {LOG_COLUMNS.map((col) => (
                  <TableCell key={col.id} className={classes.tableHeaderCell}>
                    <TableSortLabel
                      active={logSortBy === col.id}
                      direction={logSortBy === col.id ? logSortOrder : 'asc'}
                      onClick={() => onLogSort(col.id)}
                      className={classes.tableSortLabel}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLog.map((log, idx) => (
                <TableRow key={(log.id as string | number | null | undefined) ?? idx} hover className={classes.tableRow}>
                  <TableCell className={classes.cellDate}>{fmtDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    {log.changeType ? (
                      <Chip
                        label={formatChangeType(log.changeType)}
                        size='small'
                        color={CHANGE_TYPE_COLORS[log.changeType] || 'default'}
                        sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className={classes.cellFieldName}>{log.fieldName || '-'}</TableCell>
                  <TableCell className={classes.cellPrevValue}>
                    <Tooltip title={log.previousValue || ''}>
                      <span>{log.previousValue || '-'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell className={classes.cellNewValue}>
                    <Tooltip title={log.newValue || ''}>
                      <span>{log.newValue || '-'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell className={classes.cellChangedBy}>
                    {log.changedByName || '-'}
                  </TableCell>
                  <TableCell>
                    {log.reasonCode ? (
                      <Chip
                        label={
                          ROLE_CHANGE_REASON_CODES.find((r) => r.value === log.reasonCode)?.label ||
                          log.reasonCode
                        }
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className={classes.cellReasonNote}>
                    {log.reasonNotes ? (
                      <Tooltip title={log.reasonNotes}>
                        <span>{log.reasonNotes}</span>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      {/* Footer */}
      <Box className={classes.footer}>
        <Tooltip title='Export visible records to CSV'>
          <span>
            <Button
              size='small'
              variant='outlined'
              startIcon={<FileDownloadIcon />}
              onClick={onExportCsv}
              disabled={filteredLog.length === 0}
              sx={{ borderRadius: 2, fontSize: '0.78rem' }}
            >
              Export CSV
            </Button>
          </span>
        </Tooltip>
        <Typography variant='caption' color='text.disabled' sx={{ ml: 0.5 }}>
          Records retained per compliance policy (1–5 years) · Non-editable audit trail
        </Typography>
        <Box sx={{ flex: 1 }} />
        <TablePagination
          component='div'
          count={filteredLog.length}
          page={logPage}
          rowsPerPage={logRowsPerPage}
          onPageChange={(_, p) => onLogPageChange(p)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(e) => {
            onLogRowsPerPageChange(parseInt(e.target.value, 10));
            onLogPageChange(0);
          }}
          className={classes.pagination}
        />
      </Box>
    </Dialog>
  );
};

export default ChangesLogDialog;
