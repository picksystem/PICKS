import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  IconButton,
  PageHeader,
  type Column,
} from '../../../components';
import { Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import { GenericPanel, type TableConfig } from '@serviceops/genericpanel';
import { useAuth, useNotification } from '@serviceops/hooks';
import { useGetLeaveBalanceQuery, useGetLeaveRequestsQuery } from '@serviceops/services';
import type { ILeaveBalance, ILeaveRequest, ILeaveStatus } from '@serviceops/interfaces';
import { APPROVED_ESTIMATES_ACCENT } from '../Configuration/sections/General/components/ApprovedEstimates/shared/ApprovedEstimatesConfig';
import CreateLeaveModal from '../TimesheetDashboard/CreateLeaveModal';
import { useStyles } from './styles';

/* Same button look as the GenericPanel "New" button (Configuration pages) */
const panelButtonSx = {
  textTransform: 'none' as const,
  bgcolor: '#2d5ebb',
  '&:hover': { bgcolor: '#2d5ebb' },
};

/* The reference dashboard always shows a card per leave type — Privilege
   Leave, Casual Leave, Sick Leave, Absent and Optional Holiday. The API only
   returns the types that have a stored balance row, so the card row is built
   from this canonical list (0/0 when the API has no row for the type) plus
   any extra types the API happens to return. */
const KNOWN_LEAVE_TYPES = [
  'Privilege Leave',
  'Casual Leave',
  'Sick Leave',
  'Optional Holiday',
  'Absent',
] as const;

/* ── Flattened row shape for the panel columns (precomputed labels) ── */
interface LeaveRow {
  id: string;
  leaveType: string;
  employee: string;
  project: string;
  date: string;
  reason: string;
  days: number;
  hours: number;
  status: ILeaveStatus;
  remarks: string;
  approvedBy: string | null;
}

/* Colour-coded status pill: Approved (green check) / Cancelled (red cancel) /
   Submitted (amber pending) — mirrors the reference dashboard chips. */
const StatusPill = ({ status }: { status: ILeaveStatus }) => {
  if (status === 'approved')
    return (
      <Stack direction='row' spacing={0.5} alignItems='center'>
        <CheckCircleOutlineIcon sx={{ color: '#008a00', fontSize: 15 }} />
        <Typography variant='caption' sx={{ color: '#008a00', fontWeight: 700 }}>
          Approved
        </Typography>
      </Stack>
    );
  if (status === 'rejected')
    return (
      <Stack direction='row' spacing={0.5} alignItems='center'>
        <CancelIcon sx={{ color: '#d32f2f', fontSize: 15 }} />
        <Typography variant='caption' sx={{ color: '#d32f2f', fontWeight: 700 }}>
          Cancelled
        </Typography>
      </Stack>
    );
  return (
    <Stack direction='row' spacing={0.5} alignItems='center'>
      <PendingIcon sx={{ color: '#d97706', fontSize: 15 }} />
      <Typography variant='caption' sx={{ color: '#d97706', fontWeight: 700 }}>
        Submitted
      </Typography>
    </Stack>
  );
};

const LeaveDashboard = () => {
  const { classes } = useStyles();
  const notify = useNotification();
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const { data: leaveBalance = [], refetch: refetchBalance } = useGetLeaveBalanceQuery();
  const { data: leaveRequests = [], refetch: refetchRequests } = useGetLeaveRequestsQuery();

  /* Build the canonical card list first, then the type labels for the
     Create Time-Off modal (so "Absent" etc. are pickable even with no
     stored balance row). */
  const leaveBalanceMerged = useMemo(() => {
    const byType = new Map(leaveBalance.map((b) => [b.leaveType, b]));
    return [
      ...KNOWN_LEAVE_TYPES.map(
        (t) => byType.get(t) ?? { leaveType: t, total: 0, consumed: 0, available: 0 },
      ),
      ...leaveBalance.filter(
        (b) => !(KNOWN_LEAVE_TYPES as readonly string[]).includes(b.leaveType),
      ),
    ];
  }, [leaveBalance]);

  const leaveTypes = useMemo(
    () => leaveBalanceMerged.map((b) => b.leaveType),
    [leaveBalanceMerged],
  );

  /* The reference shows the owner + project per row; both come from the
     signed-in user (this is the user's own leave dashboard). */
  const employeeLabel = user
    ? `${user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()} (${user.employeeId || user.id})`
    : '—';
  const projectLabel = user?.businessUnit || user?.department || '—';

  const toRow = useCallback(
    (r: ILeaveRequest): LeaveRow => ({
      id: r.id,
      leaveType: r.leaveType,
      employee: employeeLabel,
      project: projectLabel,
      date: r.period,
      reason: r.reason || '—',
      days: r.days,
      hours: r.days,
      status: r.status,
      remarks: r.note || '—',
      approvedBy: r.approvedBy,
    }),
    [employeeLabel, projectLabel],
  );

  /* Section 1 — the user's full leave history (every status). */
  const historyRows = useMemo(() => leaveRequests.map(toRow), [leaveRequests, toRow]);

  /* Section 2 — requests still awaiting a manager's decision. */
  const requestRows = useMemo(
    () => leaveRequests.filter((r) => r.status === 'submitted').map(toRow),
    [leaveRequests, toRow],
  );

  /* Section 3 — decisions already taken (approved / cancelled). */
  const approvalRows = useMemo(
    () =>
      leaveRequests.filter((r) => r.status === 'approved' || r.status === 'rejected').map(toRow),
    [leaveRequests, toRow],
  );

  const balanceTotals = useMemo(() => {
    const total = leaveBalance.reduce((s, b) => s + b.total, 0);
    const available = leaveBalance.reduce((s, b) => s + b.available, 0);
    return { total, available };
  }, [leaveBalance]);

  /* Card list === leaveBalanceMerged: every known leave type gets a card
     (0/0 when the API has no balance row for it), followed by any extra
     types the API returns. */
  const balanceCards: ILeaveBalance[] = leaveBalanceMerged;

  const handleLeaveCreated = () => {
    setCreateOpen(false);
    refetchRequests();
    refetchBalance();
    notify.success('Leave request submitted for approval');
  };

  /* GenericPanel columns — typed the way the panel expects; each `format`
     re-casts the generic row back to LeaveRow. */
  type PanelRow = Record<string, unknown>;

  const historyColumns: Column<PanelRow>[] = [
    { id: 'leaveType', label: 'Leave Type', minWidth: 140 },
    { id: 'employee', label: 'Employee', minWidth: 220 },
    { id: 'date', label: 'Date', minWidth: 180 },
    { id: 'project', label: 'Project', minWidth: 200 },
    { id: 'reason', label: 'Reason', minWidth: 160 },
    { id: 'days', label: 'Days', minWidth: 60, align: 'center' },
    { id: 'hours', label: 'Hours', minWidth: 60, align: 'center' },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: false,
      filterable: false,
      format: (_v, row) => <StatusPill status={(row as unknown as LeaveRow).status} />,
    },
    {
      /* "Remarks" (info icon that surfaces the row's note) — keyed by
         `remarks` so it never collides with the plain `reason` column. */
      id: 'remarks',
      label: 'Remarks',
      minWidth: 120,
      sortable: false,
      filterable: false,
      format: (_v, row) => {
        const leaveRow = row as unknown as LeaveRow;
        return (
          <Tooltip
            title={leaveRow.remarks === '—' ? 'No remark' : leaveRow.remarks}
            placement='top'
          >
            <IconButton
              size='small'
              onClick={() =>
                notify.info(leaveRow.remarks === '—' ? 'No remark recorded' : leaveRow.remarks)
              }
              sx={{ color: '#64748b' }}
            >
              <InfoIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const requestColumns: Column<PanelRow>[] = [
    { id: 'employee', label: 'Employee', minWidth: 220 },
    { id: 'project', label: 'Project', minWidth: 200 },
    { id: 'leaveType', label: 'Leave Type', minWidth: 140 },
    { id: 'date', label: 'Date', minWidth: 180 },
    { id: 'days', label: 'Days', minWidth: 60, align: 'center' },
    { id: 'hours', label: 'Hours', minWidth: 60, align: 'center' },
    { id: 'reason', label: 'Reason', minWidth: 160 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: false,
      filterable: false,
      format: (_v, row) => <StatusPill status={(row as unknown as LeaveRow).status} />,
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 120,
      sortable: false,
      filterable: false,
      format: (_v, row) => (
        <Button
          variant='text'
          size='small'
          startIcon={<CheckCircleOutlineIcon />}
          label='Approve'
          onClick={() =>
            notify.info(
              `Approval of "${(row as unknown as LeaveRow).leaveType}" is handled by a manager`,
            )
          }
        />
      ),
    },
  ];

  const approvalColumns: Column<PanelRow>[] = [
    { id: 'employee', label: 'Employee', minWidth: 220 },
    { id: 'project', label: 'Project', minWidth: 200 },
    { id: 'leaveType', label: 'Leave Type', minWidth: 140 },
    { id: 'date', label: 'Date', minWidth: 180 },
    { id: 'hours', label: 'Hours', minWidth: 60, align: 'center' },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      sortable: false,
      filterable: false,
      format: (_v, row) => <StatusPill status={(row as unknown as LeaveRow).status} />,
    },
    { id: 'reason', label: 'Reason', minWidth: 160 },
    {
      id: 'remarks',
      label: 'Remarks',
      minWidth: 160,
      sortable: false,
      filterable: false,
      format: (_v, row) => {
        const leaveRow = row as unknown as LeaveRow;
        return (
          <Typography variant='body2' color='text.secondary' noWrap>
            {leaveRow.approvedBy ? `Approved by ${leaveRow.approvedBy}` : leaveRow.remarks}
          </Typography>
        );
      },
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 100,
      sortable: false,
      filterable: false,
      format: (_v, row) => (
        <Tooltip title='Open request' placement='top'>
          <IconButton
            size='small'
            onClick={() => notify.info(`Opening ${(row as unknown as LeaveRow).leaveType} request`)}
            sx={{ color: '#64748b' }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  /* ── Panel configs (same shape as the Configuration table configs —
     title/subtitle/accent/icon + fields drive the panel's search scope). */
  const historyConfig: TableConfig = {
    title: 'My Leave History',
    subtitle: 'All your leave requests across every status',
    accent: APPROVED_ESTIMATES_ACCENT,
    icon: <ChecklistIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Leave History Entry',
    accordionId: 'leave-history',
    fields: [
      { name: 'leaveType', label: 'Leave Type' },
      { name: 'employee', label: 'Employee' },
      { name: 'date', label: 'Date' },
      { name: 'project', label: 'Project' },
      { name: 'reason', label: 'Reason' },
      { name: 'days', label: 'Days' },
      { name: 'status', label: 'Status' },
      { name: 'remarks', label: 'Remarks' },
    ],
  };

  const requestConfig: TableConfig = {
    title: 'Leave Approval Request',
    subtitle: 'Requests awaiting a manager’s decision',
    accent: APPROVED_ESTIMATES_ACCENT,
    icon: <TaskAltIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Leave Request',
    accordionId: 'leave-approval-request',
    fields: [
      { name: 'employee', label: 'Employee' },
      { name: 'project', label: 'Project' },
      { name: 'leaveType', label: 'Leave Type' },
      { name: 'date', label: 'Date' },
      { name: 'days', label: 'Days' },
      { name: 'reason', label: 'Reason' },
      { name: 'status', label: 'Status' },
    ],
  };

  const approvalConfig: TableConfig = {
    title: 'Leave Approval History',
    subtitle: 'Decisions already taken on your leave',
    accent: APPROVED_ESTIMATES_ACCENT,
    icon: <VerifiedIcon sx={{ fontSize: '1.1rem' }} />,
    entity: 'Leave Approval',
    accordionId: 'leave-approval-history',
    fields: [
      { name: 'employee', label: 'Employee' },
      { name: 'project', label: 'Project' },
      { name: 'leaveType', label: 'Leave Type' },
      { name: 'date', label: 'Date' },
      { name: 'hours', label: 'Hours' },
      { name: 'status', label: 'Status' },
      { name: 'reason', label: 'Reason' },
    ],
  };

  return (
    <Box className={classes.container}>
      <PageHeader
        title='Personal Time Off'
        description='Track your leave balance, submitted requests, and approvals.'
        className={classes.pageHeader}
      />

      {/* ── Leave-balance card row (live balances + derived totals) ──
          Reference layout: label (left) + value (right) on one row, with a
          slim progress bar (fill = available / total) beneath. Every card
          carries a bar: leave types are orange when the remaining ratio is
          healthy (>= 50%) and blue otherwise; Total Leaves shows a full
          navy bar; Leave Balance shows the overall available/total in blue. */}
      <Box className={classes.balanceRow}>
        {balanceCards.map((b) => {
          const ratio = b.total > 0 ? b.available / b.total : 0;
          const fillPercent = Math.min(100, Math.round(ratio * 100));
          const fillColor = ratio >= 0.5 ? '#f97316' : '#2563eb';
          return (
            <Box key={b.leaveType} className={classes.balanceCard}>
              <Box className={classes.balanceCardHeader}>
                <Typography className={classes.balanceLabel}>{b.leaveType}</Typography>
                {/* Absent has no entitlement, so it reads a single "0"; the
                    allocated types always show the available/total fraction
                    (e.g. "0/0" when unused, "9.5/19.5" otherwise). */}
                <Typography className={classes.balanceValue}>
                  {b.leaveType === 'Absent' ? 0 : `${b.available}/${b.total}`}
                </Typography>
              </Box>
              <Box className={classes.balanceBarTrack}>
                <Box
                  className={classes.balanceBarFill}
                  sx={{ width: `${fillPercent}%`, backgroundColor: fillColor }}
                />
              </Box>
            </Box>
          );
        })}
        {/* Total Leaves — the full allocated pool, so its bar is complete
            (navy), signalling "all entitlements" rather than a ratio. */}
        <Box className={classes.balanceCard}>
          <Box className={classes.balanceCardHeader}>
            <Typography className={classes.balanceLabel}>Total Leaves</Typography>
            <Typography className={classes.balanceValue}>{balanceTotals.total}</Typography>
          </Box>
          <Box className={classes.balanceBarTrack}>
            <Box
              className={classes.balanceBarFill}
              sx={{ width: '100%', backgroundColor: '#1e2a5e' }}
            />
          </Box>
        </Box>
        {/* Leave Balance — overall available / total across all types, in
            blue, matching the leave-type cards' bar language. */}
        <Box className={classes.balanceCard}>
          <Box className={classes.balanceCardHeader}>
            <Typography className={classes.balanceLabel}>Leave Balance</Typography>
            <Typography className={classes.balanceValue}>{balanceTotals.available}</Typography>
          </Box>
          <Box className={classes.balanceBarTrack}>
            <Box
              className={classes.balanceBarFill}
              sx={{
                width: `${
                  balanceTotals.total > 0
                    ? Math.min(
                        100,
                        Math.round((balanceTotals.available / balanceTotals.total) * 100),
                      )
                    : 0
                }%`,
                backgroundColor: '#2563eb',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* The three leave tables — Configuration-style GenericPanel('plain'),
          the same component the Admin Controls / Approved Estimates panels
          use (accordion + accent box + panel toolbar + navy-header table).
          CRUD buttons are disabled (read-only data from the API); the leave
          actions slot into the panel toolbar via `toolbarExtra`. */}
      <Box className={classes.panelStack}>
        <GenericPanel
          config={historyConfig}
          data={historyRows as unknown as Record<string, unknown>[]}
          onSave={() => undefined}
          customColumns={historyColumns}
          variant='plain'
          plainAsSection
          enableNewButton={false}
          enableEditButton={false}
          enableDeleteButton={false}
          enableSuccessMessage={false}
          toolbarExtra={
            <Button
              size='small'
              variant='contained'
              startIcon={<AddIcon />}
              sx={panelButtonSx}
              label='Apply Leave'
              onClick={() => setCreateOpen(true)}
            />
          }
        />

        <GenericPanel
          config={requestConfig}
          data={requestRows as unknown as Record<string, unknown>[]}
          onSave={() => undefined}
          customColumns={requestColumns}
          variant='plain'
          plainAsSection
          enableNewButton={false}
          enableEditButton={false}
          enableDeleteButton={false}
          enableSuccessMessage={false}
          toolbarExtra={
            <Stack direction='row' spacing={1}>
              <Button
                size='small'
                variant='contained'
                startIcon={<CheckCircleOutlineIcon />}
                sx={panelButtonSx}
                label='Approve'
                onClick={() => notify.info('Approvals are handled by your manager')}
              />
              <Button
                size='small'
                variant='contained'
                startIcon={<CancelIcon />}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#d32f2f' },
                }}
                label='Reject'
                onClick={() => notify.info('Rejections are handled by your manager')}
              />
            </Stack>
          }
        />

        <GenericPanel
          config={approvalConfig}
          data={approvalRows as unknown as Record<string, unknown>[]}
          onSave={() => undefined}
          customColumns={approvalColumns}
          variant='plain'
          plainAsSection
          enableNewButton={false}
          enableEditButton={false}
          enableDeleteButton={false}
          enableSuccessMessage={false}
        />
      </Box>

      {/* ── Create Time-Off dialog (opened by the "Apply Leave" button) ── */}
      <CreateLeaveModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleLeaveCreated}
        leaveTypes={leaveTypes}
      />
    </Box>
  );
};

export default LeaveDashboard;
