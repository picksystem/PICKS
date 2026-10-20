import { useMemo, useState } from 'react';
import { Box, Typography, Button, IconButton, PageHeader } from '../../../components';
import { Menu, MenuItem, Stack, Box as MuiBox } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import CircleOutlineIcon from '@mui/icons-material/CircleOutline';
// import CancelOutlineIcon from '@mui/icons-material/CancelOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNotification, useAppNavigation } from '@serviceops/hooks';
import { constants } from '@serviceops/utils';
import { useStyles } from './styles';
import { DayMenu, TimesheetDay } from './types/timesheetDashboard.types';
import {
  actionItems,
  approvalItems,
  buildMonthDays,
  events,
  holidays,
  leaveRows,
  OCTOBER_2026,
  OCTOBER_2026_STATUS,
  timeOffBalance,
} from './data/timesheetDashboard.data';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COLORS: Record<string, string> = {
  draft: '#2563eb',
  approved: '#008a00',
  missed: '#d97706',
  holiday: '#6b7280',
  rejected: '#d32029',
};

const leaveStatusIcon = (status: string) => {
  if (status === 'approved')
    return <CheckCircleOutlineIcon sx={{ color: STATUS_COLORS.approved, fontSize: 18 }} />;
  // if (status === 'rejected')
  //   return <CancelOutlineIcon sx={{ color: STATUS_COLORS.rejected, fontSize: 18 }} />;
  // return <CircleOutlineIcon sx={{ color: STATUS_COLORS.draft, fontSize: 18 }} />;
};

const TimesheetDashboard = () => {
  const { classes, cx } = useStyles();
  const notify = useNotification();
  const { navigateToPath } = useAppNavigation();

  const { BasePath } = constants;
  const submitPath = BasePath.TIMESHEET_SUBMIT || BasePath.TIMESHEET;

  const [menu, setMenu] = useState<DayMenu>({ anchorEl: null, day: 0, open: false });

  const days = useMemo(
    () => buildMonthDays(OCTOBER_2026.year, OCTOBER_2026.monthIndex, OCTOBER_2026_STATUS),
    [],
  );

  const todayCell: TimesheetDay | undefined = days.find((d) => d.inMonth && d.day === 20);

  const openDayMenu = (event: React.MouseEvent<HTMLElement>, day: TimesheetDay) => {
    setMenu({ anchorEl: event.currentTarget, day: day.day, open: true });
  };

  const closeDayMenu = () => setMenu((m) => ({ ...m, open: false, anchorEl: null }));

  const handleEditView = () => {
    closeDayMenu();
    navigateToPath(submitPath);
  };

  const handleCopyFromPrevWeek = () => {
    closeDayMenu();
    notify.success(`Entries for ${menu.day} copied from previous week`);
  };

  const renderDayCell = (d: TimesheetDay, idx: number) => {
    const isOutside = !d.inMonth;
    const isToday = d.inMonth && d.day === todayCell?.day && d.day === 20;
    const statusClass =
      d.status === 'missed'
        ? classes.dayBorderBottomMissed
        : d.status === 'draft'
          ? classes.dayBorderBottomDraft
          : d.status === 'approved'
            ? classes.dayBorderBottomApproved
            : d.status === 'rejected'
              ? classes.dayBorderBottomRejected
              : '';
    const bgClass = d.status === 'holiday' ? classes.holidayBg : isToday ? classes.todayBg : '';

    return (
      <MuiBox
        key={idx}
        className={cx(classes.dayCell, statusClass, bgClass)}
        onClick={isOutside ? undefined : (e) => openDayMenu(e, d)}
        sx={{ cursor: isOutside ? 'default' : 'pointer' }}
      >
        <Typography
          variant='body2'
          className={cx(
            classes.dayNumber,
            isOutside && classes.dayNumberOutside,
            isToday && classes.dayNumberToday,
          )}
        >
          {d.day}
        </Typography>

        {d.times && d.times.length > 0 && !isOutside && (
          <MuiBox className={classes.dayTimes}>
            {d.times.map((t, i) => (
              <Typography key={i} className={classes.dayTime}>
                {t}
              </Typography>
            ))}
          </MuiBox>
        )}

        {!isOutside && d.status !== 'none' && (
          <MuiBox className={classes.dayStatusMark}>
            <EditIcon sx={{ fontSize: 15, color: STATUS_COLORS.draft }} />
          </MuiBox>
        )}
      </MuiBox>
    );
  };

  return (
    <Box className={classes.container}>
      {/* ── Page header (matches existing base-page header style) ── */}
      <PageHeader
        title='Timesheet'
        description='Track your timesheet status, time-off balance, approvals, and upcoming events for the selected month.'
        className={classes.pageHeader}
      />

      <MuiBox className={classes.layout}>
        {/* ═══ Left column ═══ */}
        <MuiBox className={classes.col}>
          {/* ── Calendar card ── */}
          <MuiBox className={classes.card}>
            <Stack
              className={classes.calendarHeader}
              direction='row'
              spacing={1.5}
              alignItems='center'
              justifyContent='center'
            >
              <IconButton
                className={classes.navButton}
                onClick={() => notify.info('Previous month')}
              >
                <NavigateBeforeIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography className={classes.monthLabel}>
                {MONTH_NAMES[OCTOBER_2026.monthIndex]} {OCTOBER_2026.year}
              </Typography>
              <IconButton className={classes.navButton} onClick={() => notify.info('Next month')}>
                <NavigateNextIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            <MuiBox className={classes.calendarGrid}>
              <MuiBox className={classes.gridRow}>
                {WEEKDAYS.map((wd) => (
                  <MuiBox key={wd} className={classes.weekdayCell}>
                    {wd}
                  </MuiBox>
                ))}
              </MuiBox>
              <MuiBox className={classes.gridRow}>{days.map(renderDayCell)}</MuiBox>
            </MuiBox>

            <MuiBox className={classes.legend}>
              {Object.entries({
                Draft: STATUS_COLORS.draft,
                Approved: STATUS_COLORS.approved,
                'Missed Entry': STATUS_COLORS.missed,
                Holiday: STATUS_COLORS.holiday,
                Rejected: STATUS_COLORS.rejected,
              }).map(([label, color]) => (
                <MuiBox key={label} className={classes.legendItem}>
                  <span className={classes.legendLine} style={{ backgroundColor: color }} />
                  {label}
                </MuiBox>
              ))}
            </MuiBox>
          </MuiBox>

          {/* ── Personal Time-off Balance card ── */}
          <MuiBox className={classes.card}>
            <Typography className={classes.cardTitle}>Personal Time-off Balance</Typography>

            <MuiBox className={classes.balanceRow}>
              {timeOffBalance.map((b) => (
                <MuiBox key={b.label}>
                  <Typography className={classes.balanceValue}>{b.value}</Typography>
                  <Typography className={classes.balanceLabel}>{b.label}</Typography>
                </MuiBox>
              ))}
            </MuiBox>

            {leaveRows.map((row) => (
              <MuiBox key={row.id} className={classes.leaveRow}>
                <MuiBox className={classes.leaveStatusIcon}>{leaveStatusIcon(row.status)}</MuiBox>
                <Typography variant='body2'>{row.period}</Typography>
                <Typography variant='body2' color='primary'>
                  {row.type}
                </Typography>
                <Typography variant='body2' color='primary'>
                  {row.note}
                </Typography>
              </MuiBox>
            ))}

            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              justifyContent='space-between'
              sx={{ marginTop: 1.5 }}
            >
              <Stack direction='row' spacing={2}>
                {(['submitted', 'approved', 'rejected'] as const).map((s) => (
                  <MuiBox key={s} className={classes.legendChip}>
                    <span
                      className={classes.legendDot}
                      style={{
                        borderColor: STATUS_COLORS[s === 'submitted' ? 'draft' : s],
                      }}
                    />
                    {s[0].toUpperCase() + s.slice(1)}
                  </MuiBox>
                ))}
              </Stack>
              <Button
                variant='text'
                color='primary'
                label='Create Time-Off'
                onClick={() => notify.info('Create Time-Off coming soon')}
              />
            </Stack>
          </MuiBox>
        </MuiBox>

        {/* ═══ Middle column ═══ */}
        <MuiBox className={classes.col}>
          {/* ── My Action card ── */}
          <MuiBox className={classes.card}>
            <Typography className={classes.cardTitle}>My Action</Typography>
            {actionItems.map((item) => (
              <MuiBox
                key={item.id}
                className={cx(classes.listRow, item.disabled && classes.listRowDisabled)}
                onClick={item.disabled ? undefined : () => notify.info(`${item.title} coming soon`)}
              >
                <MuiBox className={classes.listRowText}>
                  <Typography className={classes.listRowTitle}>{item.title}</Typography>
                  <Typography className={classes.listRowSubtitle}>{item.subtitle}</Typography>
                </MuiBox>
                <ChevronRightIcon className={classes.chevron} />
              </MuiBox>
            ))}
          </MuiBox>

          {/* ── Upcoming Events card ── */}
          <MuiBox className={classes.card}>
            <Typography className={classes.cardTitle}>Upcoming Events</Typography>
            {events.map((ev) => (
              <MuiBox key={ev.id} className={classes.eventRow}>
                <MuiBox className={classes.eventDateBox}>
                  <Typography className={classes.eventDateDay}>{ev.day}</Typography>
                  <Typography className={classes.eventDateMonth}>{ev.month}</Typography>
                </MuiBox>
                <MuiBox sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {ev.title}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {ev.subtitle}
                  </Typography>
                </MuiBox>
                <IconButton size='small' onClick={() => notify.info('Opening event in new tab')}>
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </MuiBox>
            ))}
          </MuiBox>
        </MuiBox>

        {/* ═══ Right column ═══ */}
        <MuiBox className={classes.col}>
          {/* ── My Approvals card ── */}
          <MuiBox className={classes.card}>
            <Typography className={classes.cardTitle}>My Approvals</Typography>
            {approvalItems.map((item) => (
              <MuiBox
                key={item.id}
                className={classes.approvalRow}
                onClick={() => notify.info(`${item.label} coming soon`)}
              >
                <MuiBox>{item.icon}</MuiBox>
                <Typography className={classes.approvalLabel}>{item.label}</Typography>
                <MuiBox className={classes.approvalCount}>{item.count}</MuiBox>
              </MuiBox>
            ))}
          </MuiBox>

          {/* ── Holidays card ── */}
          <MuiBox className={classes.card}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography className={classes.cardTitle} sx={{ marginBottom: 0 }}>
                Holidays
              </Typography>
              <IconButton size='small' onClick={() => notify.info('Calendar coming soon')}>
                <CalendarMonthIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            {holidays[0].note && (
              <MuiBox className={classes.holidayNote}>{holidays[0].note}</MuiBox>
            )}

            {holidays.map((h) => (
              <Stack key={h.id} direction='row' spacing={1} sx={{ mb: 1 }}>
                <MuiBox className={classes.eventDateBox}>
                  <Typography className={classes.eventDateDay}>{h.day}</Typography>
                  <Typography className={classes.eventDateMonth}>{h.month}</Typography>
                </MuiBox>
                <Typography variant='body2' sx={{ fontWeight: 500, alignSelf: 'center' }}>
                  {h.title}
                </Typography>
              </Stack>
            ))}
          </MuiBox>
        </MuiBox>
      </MuiBox>

      {/* ── Day edit/view popup ── */}
      <Menu
        anchorEl={menu.anchorEl}
        open={menu.open}
        onClose={closeDayMenu}
        className={classes.dayMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEditView} className={classes.dayMenuItem}>
          Edit/View Timesheet Entry
        </MenuItem>
        <MenuItem onClick={handleCopyFromPrevWeek} className={classes.dayMenuItem}>
          Copy From Previous Week
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TimesheetDashboard;
