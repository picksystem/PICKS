import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Modal,
  Toggle,
  NavigateBeforeIcon,
  NavigateNextIcon,
  ArrowBackIcon,
  PageHeader,
  AddIcon,
  ContentCopyIcon,
  LinkIcon,
  AttachFileIcon,
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
} from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useNotification } from '@serviceops/hooks';
import { useStyles } from './styles';
import {
  TimesheetLine,
  TIMESHEET_CLIENTS,
  TIMESHEET_TASKS,
  DayEntry,
  ApprovalEntry,
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

const APPROVAL_HISTORY: ApprovalEntry[] = [
  {
    id: 'appr-1',
    period: '04-Oct-2026 – 10-Oct-2026',
    status: 'approved',
    submittedOn: '11-Oct-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: 'Srinivas Penumalla',
  },
  {
    id: 'appr-2',
    period: '27-Sep-2026 – 03-Oct-2026',
    status: 'approved',
    submittedOn: '04-Oct-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: 'Srinivas Penumalla',
  },
  {
    id: 'appr-3',
    period: '20-Sep-2026 – 26-Sep-2026',
    status: 'pending',
    submittedOn: '27-Sep-2026',
    submittedBy: 'Vineesh Reddy',
    approvedBy: '—',
  },
];

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
      liked: false,
      favourited: false,
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

  const [activeTab, setActiveTab] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => buildWeek(weekOffset), [weekOffset]);

  const [lines, setLines] = useState<TimesheetLine[]>(() => seedLines(buildWeek(0)));
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [showDetailedTotals, setShowDetailedTotals] = useState(true);
  const [showAdvancedNotes, setShowAdvancedNotes] = useState(false);

  const weekRangeLabel = useMemo(() => {
    const base = new Date();
    const startOfThisWeek = new Date(base);
    startOfThisWeek.setDate(base.getDate() - base.getDay() + 1);
    const startOfWeek = new Date(startOfThisWeek);
    startOfWeek.setDate(startOfThisWeek.getDate() + weekOffset * 7);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt(startOfWeek)}  -  ${fmt(new Date(startOfWeek.getTime() + 6 * 86400000))}`;
  }, [weekOffset]);

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
        client: TIMESHEET_CLIENTS[0],
        task: TIMESHEET_TASKS[0],
        externalNote: '',
        internalNote: '',
        billable: false,
        dayValues,
        status: 'pending',
      },
    ]);
    notify.success('Timesheet line added');
  };

  const handleCopyFromPreviousWeek = () => {
    const prevWeek = buildWeek(weekOffset - 1);
    const prevKeys = prevWeek.map((d) => d.key);
    const curKeys = week.map((d) => d.key);
    const keyMap: Record<string, string> = {};
    curKeys.forEach((k, i) => {
      keyMap[k] = prevKeys[i];
    });
    setLines((prev) =>
      prev.map((line) => {
        const dayValues = { ...line.dayValues };
        for (const curKey of curKeys) {
          const srcKey = keyMap[curKey];
          dayValues[curKey] = dayValues[srcKey] ?? 0;
        }
        return { ...line, dayValues };
      }),
    );
    notify.success('Copied hours from previous week');
  };

  const handleSave = () => {
    notify.success('Timesheet saved');
  };

  const handleSubmit = () => {
    setSubmitModalOpen(false);
    notify.success('Timesheet submitted for approval');
  };

  return (
    <Box className={classes.container}>
      <PageHeader
        title=' My timesheets'
        description='Log your hours per task for the selected week.'
        className={classes.pageHeader}
      />

      {/* ── Top bar: tabs + actions ───────────────────────────── */}
      <Box className={classes.topBar}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} className={classes.tabsBar}>
          <Tab label='Timesheet' />
          <Tab label='Approval History' />
        </Tabs>

        <Stack direction='row' spacing={1}>
          <Button
            variant='outlined'
            size='small'
            label='My Allocation'
            className={classes.topAction}
            onClick={() => notify.info('My Allocation coming soon')}
          />
          <Button
            variant='outlined'
            size='small'
            startIcon={<ArrowBackIcon />}
            label='Back'
            className={classes.topAction}
            onClick={() => notify.info('Navigating back')}
          />
        </Stack>
      </Box>

      {activeTab === 0 ? (
        <>
          {/* ── Person / period bar ───────────────────────────── */}
          <Box className={classes.periodBar}>
            <Typography variant='body2' className={classes.personName}>
              Srinivas Penumalla
            </Typography>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              className={classes.periodControls}
            >
              <Button
                variant='contained'
                size='small'
                startIcon={<NavigateBeforeIcon />}
                className={classes.periodNav}
                sx={{ borderRadius: '50%', px: 1 }}
                onClick={() => setWeekOffset((o) => o - 1)}
              />
              <Typography variant='body2' className={classes.periodLabel}>
                {weekRangeLabel}
              </Typography>
              <Button
                variant='contained'
                size='small'
                endIcon={<NavigateNextIcon />}
                className={classes.periodNav}
                sx={{ borderRadius: '50%', px: 1 }}
                onClick={() => setWeekOffset((o) => o + 1)}
              />
            </Stack>
          </Box>

          {/* ── Timesheet lines section ───────────────────────── */}
          <Box className={classes.linesSection}>
            {/* ── Toolbar: title + actions + toggles ──────────── */}
            <Box className={classes.linesToolbar}>
              <Typography className={classes.toolbarTitle}>Timesheet lines</Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<ContentCopyIcon />}
                label='Copy from favourite'
                onClick={() => notify.info('Copy from favourite coming soon')}
              />
              <Button
                variant='outlined'
                size='small'
                startIcon={<ContentCopyIcon />}
                label='Copy from timesheet'
                onClick={handleCopyFromPreviousWeek}
              />
              <Button
                variant='outlined'
                size='small'
                startIcon={<StickyNote2Icon />}
                label='Add to favourites'
                onClick={() => notify.info('Line added to favourites')}
              />
              <Button
                variant='outlined'
                size='small'
                startIcon={<LinkIcon />}
                label='Copy to a timesheet'
                onClick={() => notify.info('Copy to a timesheet coming soon')}
              />
              <Button
                variant='outlined'
                size='small'
                startIcon={<AttachFileIcon />}
                label='Add attachment'
                onClick={() => notify.info('Attachment coming soon')}
              />
              <Box className={classes.toolbarDivider} />
              <Stack direction='row' spacing={3} alignItems='center'>
                <Box className={classes.toolbarToggle}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    Use advanced notes
                  </Typography>
                  <Toggle
                    checked={showAdvancedNotes}
                    onChange={() => setShowAdvancedNotes((v) => !v)}
                    size='small'
                    className={cx(classes.billableSwitch, classes.toolbarToggleSwitch)}
                  />
                </Box>
                <Box className={classes.toolbarToggle}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    Show detailed totals
                  </Typography>
                  <Toggle
                    checked={showDetailedTotals}
                    onChange={() => setShowDetailedTotals((v) => !v)}
                    size='small'
                    className={cx(classes.billableSwitch, classes.toolbarToggleSwitch)}
                  />
                </Box>
                <Button
                  variant='text'
                  size='small'
                  startIcon={<BookmarkIcon sx={{ fontSize: '1rem' }} />}
                  label='Manage favourites'
                  onClick={() => notify.info('Manage favourites coming soon')}
                />
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<AddIcon />}
                  label='New line'
                  onClick={handleAddLine}
                />
              </Stack>
            </Box>

            {lines.length === 0 && (
              <Box className={classes.emptyState}>
                <AddIcon className={classes.emptyIcon} />
                <Typography variant='body1' color='text.secondary'>
                  No timesheet lines yet. Click &ldquo;New line&rdquo; to add one.
                </Typography>
              </Box>
            )}
          </Box>
        </>
      ) : (
        /* ── Approval History tab ─────────────────────────────── */
        <Box className={classes.linesSection}>
          <TableContainer className={classes.tableContainer}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.headerCell}>Period</TableCell>
                  <TableCell className={classes.headerCell}>Status</TableCell>
                  <TableCell className={classes.headerCell}>Submitted On</TableCell>
                  <TableCell className={classes.headerCell}>Submitted By</TableCell>
                  <TableCell className={classes.headerCell}>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {APPROVAL_HISTORY.map((entry) => (
                  <TableRow key={entry.id} hover className={classes.dataRow}>
                    <TableCell>{entry.period}</TableCell>
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <StatusDot
                          style={{
                            backgroundColor:
                              entry.status === 'approved' ? theme_success : theme_warning,
                          }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          {entry.status === 'approved' ? 'Approved' : 'Pending'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{entry.submittedOn}</TableCell>
                    <TableCell>{entry.submittedBy}</TableCell>
                    <TableCell>{entry.approvedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

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
        <Button variant='contained' label='Save' onClick={handleSave} />
        <Button variant='contained' label='Submit' onClick={() => setSubmitModalOpen(true)} />
      </Stack>

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
