import MoreTimeIcon from '@mui/icons-material/MoreTime';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BadgeIcon from '@mui/icons-material/Badge';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';

/* Shared accent for every approvals table (Configuration-style panel look). */
export const APPROVALS_ACCENT = '#0369a1';

/* One day column of the week sheet (Mon…Sun keys, matching the Timesheet
   page's dayKeys). */
export interface TimesheetViewDay {
  key: string;
  day: string;
  date: string;
}

/* A single log line inside a submitted timesheet — the read-only mirror of
   the Timesheet page's line grid that the "view" dialog renders. */
export interface TimesheetViewLine {
  id: string;
  client: string;
  project: string;
  task: string;
  billable: boolean;
  /* Hours per week-day, same shape as the Timesheet page's line.dayValues */
  dayValues: Record<string, number>;
}

/* The submitted timesheet behind a "Timesheet Approval" row — what the eye
   icon opens. Mirrors the Timesheet page's week sheet (status + lines +
   notes + the week's day columns), everything a manager needs to decide. */
export interface TimesheetDetail {
  submittedBy: string;
  period: string;
  submittedOn: string;
  status: 'submitted' | 'approved' | 'rejected';
  weekDays: TimesheetViewDay[];
  externalNote?: string;
  internalNote?: string;
  lines: TimesheetViewLine[];
}

export type ApprovalType =
  | 'timesheet'
  | 'reopenTimesheet'
  | 'timeOff'
  | 'project'
  | 'customer'
  | 'exti'
  | 'expense'
  | 'employeeSelfService';

/** What the searchable Action dropdown can decide a request as. */
export type ActionDecision = 'Approve' | 'Reject' | 'Info Required' | 'Change Approver';

export interface ApprovalTab {
  key: ApprovalType;
  label: string;
  /* ReactElement (not ReactNode) so it satisfies both the Tab's `icon` prop
     and GenericPanel's `TableConfig.icon`. */
  icon: React.ReactElement;
  panelTitle: string;
  panelSubtitle: string;
  entity: string;
  accordionId: string;
  columns: { id: string; label: string; minWidth: number; align?: 'left' | 'right' | 'center' }[];
  /** Fields the panel toolbar's search filters across. */
  searchFields: { name: string; label: string }[];
  /** Pending requests shown in the table (static demo rows — no backend yet). */
  rows: Record<string, unknown>[];
  /** Requests already decided (approved/rejected) for this type. */
  historyRows: Record<string, unknown>[];
  /** Row type with the searchable Action dropdown (only set for the
     Timesheet Approval table). */
  withActionDecision?: boolean;
}

const commonColumns = [
  { id: 'employee', label: 'Employee', minWidth: 220 },
  { id: 'project', label: 'Project', minWidth: 200 },
  { id: 'date', label: 'Date', minWidth: 180 },
];

const statusColumn = { id: 'status', label: 'Status', minWidth: 120 };

export const approvalTabs: ApprovalTab[] = [
  {
    key: 'timesheet',
    label: 'Timesheet Approval',
    icon: <MoreTimeIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Timesheet Approval',
    panelSubtitle: 'Timesheet submissions awaiting your decision',
    entity: 'Timesheet Approval',
    accordionId: 'timesheet-approval',
    /* Full manager-review header set — the pending table renders these
       plus a leading select-all checkbox and a trailing Action/Check
       column, both built by the page. */
    columns: [
      { id: 'empId', label: 'Emp Id', minWidth: 80 },
      { id: 'employee', label: 'Employee', minWidth: 150 },
      { id: 'client', label: 'Client', minWidth: 100 },
      { id: 'project', label: 'Project', minWidth: 130 },
      { id: 'task', label: 'Task', minWidth: 90 },
      { id: 'submissionDate', label: 'Submission Date', minWidth: 110 },
      { id: 'period', label: 'Period', minWidth: 140, align: 'center' },
      { id: 'projectHours', label: 'Project Hours', minWidth: 70, align: 'center' },
      { id: 'timeOffHours', label: 'Time-Off Hours', minWidth: 80, align: 'center' },
      { id: 'comment', label: 'Comment', minWidth: 110 },
      statusColumn,
    ],
    searchFields: [
      { name: 'empId', label: 'Emp Id' },
      { name: 'employee', label: 'Employee' },
      { name: 'client', label: 'Client' },
      { name: 'project', label: 'Project' },
      { name: 'task', label: 'Task' },
      { name: 'submissionDate', label: 'Submission Date' },
      { name: 'period', label: 'Period' },
      { name: 'status', label: 'Status' },
    ],
    withActionDecision: true,
    rows: [
      {
        id: 'ts-1',
        empId: 'EMP-1042',
        employee: 'Srinivas Penumalla',
        client: 'Acme Corp',
        project: 'ServiceOps Core',
        task: 'Development',
        submissionDate: '12 Oct 2026',
        period: '05 Oct 2026 to 10 Oct 2026',
        projectHours: 32,
        timeOffHours: 8,
        comment: '—',
        status: 'Submitted',
        timesheetDetail: {
          submittedBy: 'Srinivas Penumalla',
          period: '05 Oct 2026 to 10 Oct 2026',
          submittedOn: '12 Oct 2026',
          status: 'submitted',
          weekDays: [
            { key: 'mon', day: 'Mon', date: '05' },
            { key: 'tue', day: 'Tue', date: '06' },
            { key: 'wed', day: 'Wed', date: '07' },
            { key: 'thu', day: 'Thu', date: '08' },
            { key: 'fri', day: 'Fri', date: '09' },
            { key: 'sat', day: 'Sat', date: '10' },
            { key: 'sun', day: 'Sun', date: '11' },
          ],
          externalNote: 'Completed sprint 24 story points for the ServiceOps Core release.',
          internalNote: 'One hour spent on a client call on Friday.',
          lines: [
            {
              id: 'ts-1-l1',
              client: 'Acme Corp',
              project: 'ServiceOps Core',
              task: 'Development',
              billable: true,
              dayValues: { mon: 8, tue: 8, wed: 8, thu: 8 },
            },
            {
              id: 'ts-1-l2',
              client: 'Acme Corp',
              project: 'ServiceOps Core',
              task: 'Vacation',
              billable: false,
              dayValues: { fri: 4, sat: 4 },
            },
          ],
        } satisfies TimesheetDetail,
      },
      {
        id: 'ts-2',
        empId: 'EMP-2110',
        employee: 'Arjun Rao',
        client: 'Globex',
        project: 'ServiceOps Core',
        task: 'Development',
        submissionDate: '05 Oct 2026',
        period: '01 Oct 2026 to 04 Oct 2026',
        projectHours: 28,
        timeOffHours: 0,
        comment: 'PTO noted in internal comment',
        status: 'Submitted',
        timesheetDetail: {
          submittedBy: 'Arjun Rao',
          period: '01 Oct 2026 to 04 Oct 2026',
          submittedOn: '05 Oct 2026',
          status: 'submitted',
          weekDays: [
            { key: 'mon', day: 'Mon', date: '28' },
            { key: 'tue', day: 'Tue', date: '29' },
            { key: 'wed', day: 'Wed', date: '30' },
            { key: 'thu', day: 'Thu', date: '01' },
            { key: 'fri', day: 'Fri', date: '02' },
            { key: 'sat', day: 'Sat', date: '03' },
            { key: 'sun', day: 'Sun', date: '04' },
          ],
          externalNote: 'Worked on the onboarding module and bug fixes.',
          internalNote: 'Two days of PTO on Wed–Thu.',
          lines: [
            {
              id: 'ts-2-l1',
              client: 'Globex',
              project: 'ServiceOps Core',
              task: 'Development',
              billable: true,
              dayValues: { thu: 4, fri: 4, sat: 4, sun: 4 },
            },
            {
              id: 'ts-2-l2',
              client: 'Globex',
              project: 'ServiceOps Core',
              task: 'Testing',
              billable: true,
              dayValues: { thu: 3, fri: 3, sat: 3, sun: 3 },
            },
          ],
        } satisfies TimesheetDetail,
      },
      {
        id: 'ts-3',
        empId: 'EMP-3377',
        employee: 'Meera Nair',
        client: 'Initech',
        project: 'Client Portal',
        task: 'Development',
        submissionDate: '03 Oct 2026',
        period: '28 Sep 2026 to 02 Oct 2026',
        projectHours: 35,
        timeOffHours: 0,
        comment: '—',
        status: 'Submitted',
        timesheetDetail: {
          submittedBy: 'Meera Nair',
          period: '28 Sep 2026 to 02 Oct 2026',
          submittedOn: '03 Oct 2026',
          status: 'submitted',
          weekDays: [
            { key: 'mon', day: 'Mon', date: '28' },
            { key: 'tue', day: 'Tue', date: '29' },
            { key: 'wed', day: 'Wed', date: '30' },
            { key: 'thu', day: 'Thu', date: '01' },
            { key: 'fri', day: 'Fri', date: '02' },
            { key: 'sat', day: 'Sat', date: '03' },
            { key: 'sun', day: 'Sun', date: '04' },
          ],
          externalNote: 'Client Portal API hardening and performance tuning.',
          internalNote: '',
          lines: [
            {
              id: 'ts-3-l1',
              client: 'Initech',
              project: 'Client Portal',
              task: 'Development',
              billable: true,
              dayValues: { mon: 8, tue: 8, wed: 8, thu: 4 },
            },
            {
              id: 'ts-3-l2',
              client: 'Initech',
              project: 'Client Portal',
              task: 'Code Review',
              billable: true,
              dayValues: { mon: 2, tue: 1, wed: 2, thu: 2 },
            },
          ],
        } satisfies TimesheetDetail,
      },
    ],
    historyRows: [],
  },
  {
    key: 'reopenTimesheet',
    label: 'Reopen Timesheet Approval',
    icon: <RestartAltIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Reopen Timesheet Approval',
    panelSubtitle: 'Requests to reopen already-approved timesheet periods',
    entity: 'Reopen Timesheet Approval',
    accordionId: 'reopen-timesheet-approval',
    columns: [
      ...commonColumns,
      { id: 'period', label: 'Period', minWidth: 200 },
      { id: 'reason', label: 'Reason', minWidth: 180 },
      statusColumn,
    ],
    searchFields: [
      { name: 'employee', label: 'Employee' },
      { name: 'project', label: 'Project' },
      { name: 'date', label: 'Date' },
      { name: 'period', label: 'Period' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'timeOff',
    label: 'Time-Off Approval',
    icon: <EventBusyIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Time-Off Approval',
    panelSubtitle: 'Time-off requests awaiting a manager’s decision',
    entity: 'Time-Off Approval',
    accordionId: 'time-off-approval',
    columns: [
      ...commonColumns,
      { id: 'leaveType', label: 'Leave Type', minWidth: 140 },
      { id: 'days', label: 'Days', minWidth: 60, align: 'center' },
      { id: 'reason', label: 'Reason', minWidth: 160 },
      statusColumn,
    ],
    searchFields: [
      { name: 'employee', label: 'Employee' },
      { name: 'project', label: 'Project' },
      { name: 'date', label: 'Date' },
      { name: 'leaveType', label: 'Leave Type' },
      { name: 'reason', label: 'Reason' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'project',
    label: 'Project Approval',
    icon: <AssignmentIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Project Approval',
    panelSubtitle: 'New and modified project definitions awaiting approval',
    entity: 'Project Approval',
    accordionId: 'project-approval',
    columns: [
      { id: 'project', label: 'Project', minWidth: 220 },
      { id: 'client', label: 'Client', minWidth: 200 },
      { id: 'manager', label: 'Manager', minWidth: 200 },
      { id: 'date', label: 'Date', minWidth: 180 },
      statusColumn,
    ],
    searchFields: [
      { name: 'project', label: 'Project' },
      { name: 'client', label: 'Client' },
      { name: 'manager', label: 'Manager' },
      { name: 'date', label: 'Date' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'customer',
    label: 'Customer Approval',
    icon: <SupportAgentIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Customer Approval',
    panelSubtitle: 'Customer and account changes awaiting approval',
    entity: 'Customer Approval',
    accordionId: 'customer-approval',
    columns: [
      { id: 'client', label: 'Customer', minWidth: 220 },
      { id: 'requester', label: 'Requester', minWidth: 200 },
      { id: 'date', label: 'Date', minWidth: 180 },
      { id: 'detail', label: 'Detail', minWidth: 200 },
      statusColumn,
    ],
    searchFields: [
      { name: 'client', label: 'Customer' },
      { name: 'requester', label: 'Requester' },
      { name: 'date', label: 'Date' },
      { name: 'detail', label: 'Detail' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'exti',
    label: 'Exti Approval',
    icon: <BadgeIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Exti Approval',
    panelSubtitle: 'External (Exti) requests awaiting approval',
    entity: 'Exti Approval',
    accordionId: 'exti-approval',
    columns: [
      { id: 'requester', label: 'Requester', minWidth: 220 },
      { id: 'project', label: 'Project', minWidth: 200 },
      { id: 'date', label: 'Date', minWidth: 180 },
      { id: 'detail', label: 'Detail', minWidth: 200 },
      statusColumn,
    ],
    searchFields: [
      { name: 'requester', label: 'Requester' },
      { name: 'project', label: 'Project' },
      { name: 'date', label: 'Date' },
      { name: 'detail', label: 'Detail' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'expense',
    label: 'Expense Approval',
    icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Expense Approval',
    panelSubtitle: 'Submitted expense claims awaiting approval',
    entity: 'Expense Approval',
    accordionId: 'expense-approval',
    columns: [
      { id: 'employee', label: 'Employee', minWidth: 220 },
      { id: 'project', label: 'Project', minWidth: 200 },
      { id: 'date', label: 'Date', minWidth: 140 },
      { id: 'category', label: 'Category', minWidth: 140 },
      { id: 'amount', label: 'Amount', minWidth: 100, align: 'right' },
      statusColumn,
    ],
    searchFields: [
      { name: 'employee', label: 'Employee' },
      { name: 'project', label: 'Project' },
      { name: 'date', label: 'Date' },
      { name: 'category', label: 'Category' },
      { name: 'amount', label: 'Amount' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
  {
    key: 'employeeSelfService',
    label: 'Employee Self Service Approval',
    icon: <PeopleIcon sx={{ fontSize: 18 }} />,
    panelTitle: 'Employee Self Service Approval',
    panelSubtitle: 'Self-service requests raised by employees',
    entity: 'Employee Self Service Approval',
    accordionId: 'employee-self-service-approval',
    columns: [
      { id: 'employee', label: 'Employee', minWidth: 220 },
      { id: 'requestType', label: 'Request Type', minWidth: 180 },
      { id: 'date', label: 'Date', minWidth: 140 },
      { id: 'detail', label: 'Detail', minWidth: 200 },
      statusColumn,
    ],
    searchFields: [
      { name: 'employee', label: 'Employee' },
      { name: 'requestType', label: 'Request Type' },
      { name: 'date', label: 'Date' },
      { name: 'detail', label: 'Detail' },
      { name: 'status', label: 'Status' },
    ],
    rows: [],
    historyRows: [],
  },
];

/** Counts per approval type — keeps the dashboard's "My Approvals" badges in
    sync with the tables on this page. */
export const approvalCounts: Record<ApprovalType, number> = approvalTabs.reduce(
  (acc, tab) => ({ ...acc, [tab.key]: tab.rows.length }),
  {} as Record<ApprovalType, number>,
);
