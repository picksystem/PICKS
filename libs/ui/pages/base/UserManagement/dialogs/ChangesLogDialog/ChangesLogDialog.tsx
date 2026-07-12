import { useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  InputAdornment,
  TablePagination,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Loader,
  UserAvatar,
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  Paper,
  Button,
  DataTable,
  Tooltip,
  Grid,
} from '@serviceops/component';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useStyles } from './styles';
import { ChangesLogDialogProps } from './util';
import { UserRow, ChangeLogEntry } from '../../types/userManagement.types';
import {
  LOG_COLUMNS,
  ROLE_CHANGE_REASON_CODES,
  fmtDateTime,
} from '../../utils/userManagement.utils';

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
  const [fieldOpen, setFieldOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
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
          <Grid container spacing={1.5} alignItems='flex-start'>
            <Grid size={{ xs: 12, sm: 2.4 }}>
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
                    endAdornment: (
                      <InputAdornment position='end'>
                        {logSearch ? (
                          <ClearIcon
                            onClick={() => onLogSearchChange('')}
                            sx={{
                              fontSize: 18,
                              color: 'text.primary',
                              cursor: 'pointer',
                              '&:hover': { color: 'text.primary' },
                            }}
                          />
                        ) : (
                          <SearchIcon className={classes.searchIcon} />
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <DatePicker
                label='From'
                value={logDateFrom ? dayjs(logDateFrom) : null}
                onChange={(newValue) => {
                  onLogDateFromChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                  onLogPageChange(0);
                }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <DatePicker
                label='To'
                value={logDateTo ? dayjs(logDateTo) : null}
                onChange={(newValue) => {
                  onLogDateToChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                  onLogPageChange(0);
                }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Field Changed'
                  placeholder='All fields'
                  value={logFilterField}
                  onFocus={() => setFieldOpen(true)}
                  onBlur={() => setTimeout(() => setFieldOpen(false), 150)}
                  fullWidth
                  size='small'
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          {logFilterField ? (
                            <ClearIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                onLogFilterFieldChange('');
                                onLogPageChange(0);
                                setFieldOpen(false);
                              }}
                              sx={{
                                fontSize: 18,
                                color: 'text.primary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon className={classes.searchIcon} />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { cursor: 'pointer' } }}
                />
                {fieldOpen && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxHeight: 220,
                      overflow: 'auto',
                    }}
                  >
                    <List dense disablePadding>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={!logFilterField}
                          onClick={() => {
                            onLogFilterFieldChange('');
                            onLogPageChange(0);
                            setFieldOpen(false);
                          }}
                          sx={{ py: 1, px: 1.5 }}
                        >
                          <ListItemText
                            primary='All Fields'
                            primaryTypographyProps={{ fontSize: '0.84rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                      {uniqueLogFields.map((f) => (
                        <ListItem key={f} disablePadding>
                          <ListItemButton
                            selected={logFilterField === f}
                            onClick={() => {
                              onLogFilterFieldChange(f);
                              onLogPageChange(0);
                              setFieldOpen(false);
                            }}
                            sx={{ py: 1, px: 1.5 }}
                          >
                            <ListItemText primary={f} primaryTypographyProps={{ fontSize: '0.84rem' }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label='Reason Code'
                  placeholder='All reasons'
                  value={
                    ROLE_CHANGE_REASON_CODES.find((r) => r.value === logFilterReason)?.label ?? ''
                  }
                  onFocus={() => setReasonOpen(true)}
                  onBlur={() => setTimeout(() => setReasonOpen(false), 150)}
                  fullWidth
                  size='small'
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          {logFilterReason ? (
                            <ClearIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                onLogFilterReasonChange('');
                                onLogPageChange(0);
                                setReasonOpen(false);
                              }}
                              sx={{
                                fontSize: 18,
                                color: 'text.primary',
                                cursor: 'pointer',
                                '&:hover': { color: 'text.primary' },
                              }}
                            />
                          ) : (
                            <SearchIcon className={classes.searchIcon} />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { cursor: 'pointer' } }}
                />
                {reasonOpen && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxHeight: 220,
                      overflow: 'auto',
                    }}
                  >
                    <List dense disablePadding>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={!logFilterReason}
                          onClick={() => {
                            onLogFilterReasonChange('');
                            onLogPageChange(0);
                            setReasonOpen(false);
                          }}
                          sx={{ py: 1, px: 1.5 }}
                        >
                          <ListItemText
                            primary='All Reasons'
                            primaryTypographyProps={{ fontSize: '0.84rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                      {ROLE_CHANGE_REASON_CODES.map((r) => (
                        <ListItem key={r.value} disablePadding>
                          <ListItemButton
                            selected={logFilterReason === r.value}
                            onClick={() => {
                              onLogFilterReasonChange(r.value);
                              onLogPageChange(0);
                              setReasonOpen(false);
                            }}
                            sx={{ py: 1, px: 1.5 }}
                          >
                            <ListItemText
                              primary={r.label}
                              primaryTypographyProps={{ fontSize: '0.84rem' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
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
          <DataTable
            columns={LOG_COLUMNS.map((col) => ({ id: col.id, label: col.label }))}
            data={paginatedLog}
            rowKey='id'
            searchable={false}
            initialRowsPerPage={10}
          />
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
