import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Toggle,
  IconButton,
  Modal,
  TextField,
  Select,
} from '../../../components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Stack,
  styled,
  Tooltip,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNotification } from '@serviceops/hooks';
import { useStyles } from './styles';
import {
  DayEntry,
  TimesheetLine,
  TIMESHEET_CLIENTS,
  TIMESHEET_TASKS,
} from './types/timesheet.types';

const theme_warning = '#ff9800';
const theme_success = '#008a00';

const StatusDot = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  flexShrink: 0,
}));

const DAY_KEY_MAP: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const DAY_SHORT: Record<string, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

const buildWeek = (offset: number): DayEntry[] => {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1 + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = DAY_KEY_MAP[d.getDay()];
    return {
      key,
      day: DAY_SHORT[key],
      date: `${d.getDate()}`,
      hours: 0,
    };
  });
};

const seedLines = (week: DayEntry[]): TimesheetLine[] => {
  const keys = week.map((d) => d.key);
  const days = (vals: number[]) =>
    vals.reduce(
      (acc, v, i) => {
        acc[keys[i]] = v;
        return acc;
      },
      {} as Record<string, number>,
    );

  return [
    {
      id: 'line-1',
      client: 'Hive Implementation',
      task: 'Development',
      externalNote: '',
      internalNote: '',
      billable: true,
      dayValues: days([8, 8, 0, 0, 0, 0, 0]),
      status: 'pending',
    },
    {
      id: 'line-2',
      client: 'Hive Implementation',
      task: 'Internal calls',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([1, 1, 0, 0, 0, 0, 0]),
      status: 'pending',
    },
    {
      id: 'line-3',
      client: 'Administrative',
      task: 'Vacation',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([0, 0, 0, 0, 0, 0, 0]),
      status: 'pending',
    },
    {
      id: 'line-4',
      client: 'Administrative',
      task: 'Fixed holidays',
      externalNote: '',
      internalNote: '',
      billable: false,
      dayValues: days([0, 0, 0, 0, 0, 0, 0]),
      status: 'approved',
    },
  ];
};

const Timesheet = () => {
  const { classes, cx } = useStyles();
  const notify = useNotification();

  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => buildWeek(weekOffset), [weekOffset]);

  const [lines, setLines] = useState<TimesheetLine[]>(() => seedLines(buildWeek(0)));
  const [advancedNotes, setAdvancedNotes] = useState(false);
  const [detailedTotals, setDetailedTotals] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [newClient, setNewClient] = useState(TIMESHEET_CLIENTS[0]);
  const [newTask, setNewTask] = useState(TIMESHEET_TASKS[0]);

  const lineTotal = (line: TimesheetLine) =>
    week.reduce((sum, d) => sum + (line.dayValues[d.key] || 0), 0);

  const columnTotals = week.map((d) =>
    lines.reduce((sum, line) => sum + (line.dayValues[d.key] || 0), 0),
  );
  const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

  const weekRangeLabel = useMemo(() => {
    const base = new Date();
    const startOfThisWeek = new Date(base);
    startOfThisWeek.setDate(base.getDate() - base.getDay() + 1);
    const startOfWeek = new Date(startOfThisWeek);
    startOfWeek.setDate(startOfThisWeek.getDate() + weekOffset * 7);
    const label = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${label} – ${week[6].date}`;
  }, [week, weekOffset]);

  const updateDay = (lineId: string, dayKey: string, value: string) => {
    const hours = Math.max(0, Math.min(24, parseInt(value, 10) || 0));
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, dayValues: { ...line.dayValues, [dayKey]: hours } } : line,
      ),
    );
  };

  const handleAddLine = () => {
    const id = `line-${Date.now()}`;
    const dayValues = week.reduce(
      (acc, d) => {
        acc[d.key] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );
    setLines((prev) => [
      ...prev,
      {
        id,
        client: newClient,
        task: newTask,
        externalNote: '',
        internalNote: '',
        billable: false,
        dayValues,
        status: 'pending',
      },
    ]);
    notify.success('Timesheet line added');
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
    notify.info('Timesheet line removed');
  };

  const handleToggleBillable = (id: string, checked: boolean) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, billable: checked } : line)),
    );
  };

  const handleSave = () => {
    notify.success('Timesheet saved');
  };

  const handleSubmit = () => {
    setSubmitModalOpen(false);
    notify.success('Timesheet submitted for approval');
  };

  const handleRecall = () => {
    notify.success('Timesheet recalled from approval');
  };

  const statusLabel = (status: TimesheetLine['status']) =>
    status === 'approved' ? 'Approved' : 'Pending approval';

  return (
    <Box className={classes.container}>
      {/* ── Top bar ───────────────────────────────────────────── */}
      <Box className={classes.topBar}>
        <Stack direction='row' spacing={1} alignItems='center' className={classes.breadcrumbs}>
          <Typography className={classes.breadcrumbItem}>Timesheets</Typography>
          <Typography className={classes.breadcrumbSeparator}>&gt;</Typography>
          <Typography className={classes.breadcrumbItem} color='primary'>
            Submit timesheets
          </Typography>
        </Stack>
        <Stack direction='row' spacing={2}>
          <Button
            variant='text'
            color='primary'
            label="Create colleague's timesheet"
            onClick={() => notify.info('Create colleague’s timesheet coming soon')}
          />
          <Button
            variant='text'
            color='primary'
            label='Timesheet approvals'
            onClick={() => notify.info('Timesheet approvals coming soon')}
          />
        </Stack>
      </Box>

      {/* ── Summary card ──────────────────────────────────────── */}
      <Box className={classes.summaryCard}>
        <Stack direction='row' spacing={3} alignItems='flex-end' className={classes.summaryRow}>
          <Box>
            <Typography variant='h5' className={classes.pageTitle}>
              My timesheets
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Log your hours per task for the selected week.
            </Typography>
          </Box>

          <Stack direction='row' spacing={4} className={classes.metaFields}>
            <Stack spacing={0.5}>
              <Typography variant='caption' color='text.secondary'>
                Timesheet Resource name
              </Typography>
              <Typography variant='body2'>Vineesh Reddy</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant='caption' color='text.secondary'>
                Timesheet number
              </Typography>
              <Typography variant='body2'>TS000001</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant='caption' color='text.secondary'>
                Status
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <StatusDot style={{ backgroundColor: theme_warning }} />
                <Typography variant='body2'>Pending approval</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction='row' spacing={1.5} alignItems='center' className={classes.periodBox}>
            <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
              Select timesheet period
            </Typography>
            <Button
              variant='outlined'
              size='small'
              startIcon={<NavigateBeforeIcon />}
              label='Previous'
              onClick={() => setWeekOffset((o) => o - 1)}
            />
            <Typography
              variant='body2'
              sx={{ fontWeight: 700, minWidth: 110, textAlign: 'center' }}
            >
              {weekRangeLabel}
            </Typography>
            <Button
              variant='outlined'
              size='small'
              startIcon={<NavigateNextIcon />}
              label='Next'
              onClick={() => setWeekOffset((o) => o + 1)}
            />
            <Tooltip title='Pick a period'>
              <IconButton size='small'>
                <CalendarMonthIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className={classes.statsRow}>
          <Box className={classes.statCard}>
            <Typography variant='caption' color='text.secondary'>
              Total Hours
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <AccessTimeIcon fontSize='small' className={classes.statIcon} />
              <Typography variant='body2'>Attended Hours/work scheduled</Typography>
            </Stack>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {grandTotal} hrs
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            component='div'
            sx={{ flex: 1 }}
          >
            <TextField
              label='Billable hours'
              value='25'
              className={classes.statField}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label='Non-billable hours'
              value='20'
              className={classes.statField}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label='Holidays'
              value='09'
              className={classes.statField}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label='Leaves'
              value='09'
              className={classes.statField}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label='Billable hours ratio'
              value='55%'
              className={classes.statField}
              inputProps={{ readOnly: true }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* ── Timesheet lines section ───────────────────────────── */}
      <Box className={classes.linesSection}>
        <Stack direction='row' spacing={2} alignItems='center' className={classes.linesHeader}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Timesheet lines
          </Typography>

          <Stack direction='row' spacing={1}>
            <Button
              variant='outlined'
              size='small'
              startIcon={<AddIcon />}
              label='New line'
              onClick={handleAddLine}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<SaveIcon />}
              label='Save'
              onClick={handleSave}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<EditIcon />}
              label='Edit'
              onClick={() => notify.info('Edit timesheet coming soon')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<DeleteIcon />}
              label='Remove line'
              onClick={() => notify.warning('Select a line to remove')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<ContentCopyIcon />}
              label='Copy from favourites'
              onClick={() => notify.info('Copy from favourites coming soon')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<ContentCopyIcon />}
              label='Copy from timesheet'
              onClick={() => notify.info('Copy from timesheet coming soon')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<StarBorderIcon />}
              label='Add to favourites'
              onClick={() => notify.info('Add to favourites coming soon')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<ContentCopyIcon />}
              label='Copy to a timesheet'
              onClick={() => notify.info('Copy to a timesheet coming soon')}
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<AttachFileIcon />}
              label='Add attachment'
              onClick={() => notify.info('Add attachment coming soon')}
            />
          </Stack>

          <Stack direction='row' spacing={2} alignItems='center' ml='auto'>
            <Toggle
              label='Use advanced notes'
              checked={advancedNotes}
              onChange={(_e, checked) => setAdvancedNotes(checked)}
            />
            <Toggle
              label='Show detailed totals'
              checked={detailedTotals}
              onChange={(_e, checked) => setDetailedTotals(checked)}
            />
            <Button
              variant='text'
              color='primary'
              label='Manage favourites'
              onClick={() => notify.info('Manage favourites coming soon')}
            />
          </Stack>
        </Stack>

        {/* ── New line selector ── */}
        <Box className={classes.addLineBar}>
          <Select
            value={newClient}
            onChange={(e) => setNewClient(e.target.value as string)}
            options={TIMESHEET_CLIENTS.map((c) => ({ value: c, label: c }))}
            label='Client/Project'
            className={classes.addLineField}
          />
          <Select
            value={newTask}
            onChange={(e) => setNewTask(e.target.value as string)}
            options={TIMESHEET_TASKS.map((t) => ({ value: t, label: t }))}
            label='Task'
            className={classes.addLineField}
          />
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            label='Add line'
            onClick={handleAddLine}
          />
        </Box>

        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell className={classes.selectCell} />
                <TableCell className={classes.headerCell}>Client/Project</TableCell>
                <TableCell className={classes.headerCell}>Task</TableCell>
                {advancedNotes && (
                  <TableCell className={classes.headerCell}>External Note</TableCell>
                )}
                {advancedNotes && (
                  <TableCell className={classes.headerCell}>Internal Note</TableCell>
                )}
                <TableCell className={classes.headerCell} align='center'>
                  Billable
                </TableCell>
                {week.map((d) => (
                  <TableCell key={d.key} align='center' className={classes.headerCell}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                      {d.day}
                    </Typography>
                    <Typography variant='caption' sx={{ fontWeight: 700 }}>
                      {d.date}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align='center' className={classes.headerCell}>
                  Total Hours
                </TableCell>
                <TableCell align='center' className={classes.headerCell}>
                  Status
                </TableCell>
                <TableCell align='center' className={classes.headerCell}>
                  Line actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.id} hover className={classes.dataRow}>
                  <TableCell className={classes.selectCell}>
                    <input type='checkbox' className={classes.checkbox} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={line.client}
                      options={TIMESHEET_CLIENTS.map((c) => ({ value: c, label: c }))}
                      onChange={() => notify.info('Client selection coming soon')}
                      className={classes.cellSelect}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={line.task}
                      options={TIMESHEET_TASKS.map((t) => ({ value: t, label: t }))}
                      onChange={() => notify.info('Task selection coming soon')}
                      className={classes.cellSelect}
                      fullWidth
                    />
                  </TableCell>
                  {advancedNotes && <TableCell>{line.externalNote || '—'}</TableCell>}
                  {advancedNotes && <TableCell>{line.internalNote || '—'}</TableCell>}
                  <TableCell align='center'>
                    <Toggle
                      checked={line.billable}
                      size='small'
                      onChange={(e) =>
                        handleToggleBillable(line.id, (e.target as HTMLInputElement).checked)
                      }
                    />
                  </TableCell>
                  {week.map((d) => (
                    <TableCell key={d.key} align='center'>
                      <TextField
                        value={String(line.dayValues[d.key] ?? 0)}
                        onChange={(e) => updateDay(line.id, d.key, e.target.value)}
                        inputProps={{ className: classes.dayCell, maxLength: 2 }}
                        className={classes.dayCellField}
                        slotProps={{ input: { startAdornment: undefined } }}
                      />
                    </TableCell>
                  ))}
                  <TableCell align='center'>
                    <TextField
                      value={String(lineTotal(line))}
                      inputProps={{ readOnly: true, className: classes.dayCell }}
                      className={classes.dayCellField}
                      disabled
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
                      <StatusDot
                        style={{
                          backgroundColor:
                            line.status === 'approved' ? theme_success : theme_warning,
                        }}
                      />
                      <Typography variant='caption' sx={{ whiteSpace: 'nowrap' }}>
                        {statusLabel(line.status)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align='center'>
                    <Stack direction='row' spacing={0.5} justifyContent='center'>
                      <Tooltip title='Delete line'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleRemoveLine(line.id)}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit line'>
                        <IconButton
                          size='small'
                          onClick={() => notify.info('Edit line coming soon')}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Add to favourites'>
                        <IconButton
                          size='small'
                          onClick={() => notify.info('Add to favourites coming soon')}
                        >
                          <StarBorderIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Totals row ── */}
        {lines.length > 0 && (
          <Box className={classes.totalsRow}>
            <Stack direction='row' spacing={1} alignItems='center' className={classes.totalsLabel}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                Total Hours
              </Typography>
            </Stack>
            {week.map((d, i) => (
              <Box key={`total-${d.key}`} className={classes.totalsDayCell}>
                {columnTotals[i] || '–'}
              </Box>
            ))}
            <Box className={cx(classes.totalsDayCell, classes.totalsGrandCell)}>{grandTotal}</Box>
            <Box sx={{ width: 140 }} />
            <Box sx={{ width: 130 }} />
          </Box>
        )}

        {lines.length === 0 && (
          <Box className={classes.emptyState}>
            <AddIcon className={classes.emptyIcon} />
            <Typography variant='body1' color='text.secondary'>
              No timesheet lines yet. Click &ldquo;New line&rdquo; to add one.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Footer actions ────────────────────────────────────── */}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='flex-end'
        className={classes.footerActions}
      >
        <Button
          variant='outlined'
          color='primary'
          label='Close'
          onClick={() => notify.info('Timesheet closed')}
        />
        <Button variant='contained' color='error' label='Save' onClick={handleSave} />
        <Button
          variant='contained'
          color='error'
          label='Submit'
          onClick={() => setSubmitModalOpen(true)}
        />
      </Stack>

      {/* ── Post-submission options ── */}
      <Box className={classes.postSubmit}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', textAlign: 'center', marginBottom: 1 }}
        >
          Options after submission
        </Typography>
        <Stack direction='row' spacing={1} justifyContent='center'>
          <Button
            variant='outlined'
            label='Close'
            onClick={() => notify.info('Timesheet closed')}
          />
          <Button variant='contained' color='primary' label='Recall' onClick={handleRecall} />
          <Button
            variant='contained'
            color='primary'
            label='View status'
            onClick={() => notify.info('Timesheet is pending approval')}
          />
        </Stack>
      </Box>

      {/* ── Submit confirmation modal ── */}
      <Modal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title='Confirm'
        maxWidth='xs'
        footer={
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            className={classes.modalFooter}
          >
            <Button
              variant='contained'
              color='error'
              size='small'
              label='Submit'
              onClick={handleSubmit}
            />
            <Button
              variant='outlined'
              size='small'
              label='Cancel'
              onClick={() => setSubmitModalOpen(false)}
            />
          </Stack>
        }
      >
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center' }}>
          Are you sure you want to submit?
        </Typography>
      </Modal>
    </Box>
  );
};

export default Timesheet;
