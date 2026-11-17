import { constants } from '@serviceops/utils';
import type { AppRole } from '@serviceops/theme';
import type { ILeaveBalance, ILeaveRequest } from '@serviceops/interfaces';

const { BasePath, UserPath, ConsultantPath } = constants;

/* ── Deep links, resolved per app role so the bot never sends a user to a
   route their role can't open (a "user" has no Reports page, etc.). ── */
type LinkKey =
  | 'DASHBOARD'
  | 'FAVOURITES'
  | 'RECENT_ITEMS'
  | 'TICKET_MANAGEMENT'
  | 'INCIDENT_MANAGEMENT'
  | 'CHANGE_MANAGEMENT'
  | 'PROBLEM_MANAGEMENT'
  | 'TIME_MANAGEMENT'
  | 'REPORTS'
  | 'TICKET_BUNDLE'
  | 'TIMESHEET'
  | 'TIMESHEET_SUBMIT'
  | 'TIMESHEET_APPROVALS'
  | 'LEAVE'
  | 'CAB_REQUEST'
  | 'KNOWLEDGE_BASE'
  | 'TEST_SCRIPTS'
  | 'CREATE_TICKET'
  | 'USER_MANAGEMENT'
  | 'CLIENTS_AND_PROJECTS'
  | 'ROLE_REQUESTS'
  | 'PROFILE'
  | 'CONFIGURATION';

const PATHS: Record<LinkKey, Record<AppRole, string | undefined>> = {
  DASHBOARD: {
    admin: BasePath.DASHBOARD,
    user: UserPath.DASHBOARD,
    consultant: ConsultantPath.DASHBOARD,
  },
  FAVOURITES: {
    admin: BasePath.FAVOURITES,
    user: UserPath.FAVOURITES,
    consultant: ConsultantPath.FAVOURITES,
  },
  RECENT_ITEMS: {
    admin: BasePath.RECENT_ITEMS,
    user: UserPath.RECENT_ITEMS,
    consultant: ConsultantPath.RECENT_ITEMS,
  },
  TICKET_MANAGEMENT: { admin: BasePath.TICKET_MANAGEMENT, user: undefined, consultant: undefined },
  INCIDENT_MANAGEMENT: {
    admin: BasePath.INCIDENT_MANAGEMENT,
    user: UserPath.INCIDENT_MANAGEMENT,
    consultant: ConsultantPath.INCIDENT_MANAGEMENT,
  },
  CHANGE_MANAGEMENT: {
    admin: BasePath.CHANGE_MANAGEMENT,
    user: UserPath.CHANGE_MANAGEMENT,
    consultant: ConsultantPath.CHANGE_MANAGEMENT,
  },
  PROBLEM_MANAGEMENT: {
    admin: BasePath.PROBLEM_MANAGEMENT,
    user: UserPath.PROBLEM_MANAGEMENT,
    consultant: ConsultantPath.PROBLEM_MANAGEMENT,
  },
  TIME_MANAGEMENT: { admin: BasePath.TIME_MANAGEMENT, user: undefined, consultant: undefined },
  REPORTS: { admin: BasePath.REPORTS, user: undefined, consultant: undefined },
  TICKET_BUNDLE: { admin: BasePath.TICKET_TEMPLATES, user: undefined, consultant: undefined },
  TIMESHEET: { admin: BasePath.TIMESHEET, user: undefined, consultant: undefined },
  TIMESHEET_SUBMIT: { admin: BasePath.TIMESHEET_SUBMIT, user: undefined, consultant: undefined },
  TIMESHEET_APPROVALS: {
    admin: BasePath.TIMESHEET_APPROVALS,
    user: UserPath.TIMESHEET_APPROVALS,
    consultant: undefined,
  },
  LEAVE: { admin: BasePath.LEAVE, user: UserPath.LEAVE, consultant: undefined },
  CAB_REQUEST: { admin: BasePath.CAB_REQUEST, user: undefined, consultant: undefined },
  KNOWLEDGE_BASE: { admin: BasePath.KNOWLEDGE_BASE, user: undefined, consultant: undefined },
  TEST_SCRIPTS: { admin: BasePath.TEST_SCRIPTS, user: undefined, consultant: undefined },
  CREATE_TICKET: {
    admin: BasePath.CREATE_TICKET,
    user: UserPath.CREATE_TICKET,
    consultant: ConsultantPath.CREATE_TICKET,
  },
  USER_MANAGEMENT: { admin: BasePath.USER_MANAGEMENT, user: undefined, consultant: undefined },
  CLIENTS_AND_PROJECTS: {
    admin: BasePath.CLIENTS_AND_PROJECTS,
    user: undefined,
    consultant: undefined,
  },
  ROLE_REQUESTS: { admin: BasePath.ROLE_REQUESTS, user: undefined, consultant: undefined },
  PROFILE: { admin: BasePath.PROFILE, user: UserPath.PROFILE, consultant: ConsultantPath.PROFILE },
  CONFIGURATION: { admin: BasePath.CONFIGURATION, user: undefined, consultant: undefined },
};

export interface BotLink {
  label: string;
  path: string;
}

export interface BotReply {
  text: string;
  links: BotLink[];
}

/* ── The knowledge base: one entry per ServiceOps capability, end to end.
   Each entry is a short how-it-works explanation plus a deep link into the
   page that owns it. Keywords are lowercase phrases; the engine scores the
   question against all of them and answers the best match. ── */
interface Entry {
  id: string;
  keywords: string[];
  answer: string;
  link?: { key: LinkKey; label: string };
}

const entries: Entry[] = [
  {
    id: 'capabilities',
    keywords: ['what can you do', 'help me with', 'how do you work', 'abilities', 'capabilities'],
    answer:
      'I can guide you end-to-end through ServiceOps — tickets, incidents, changes, problems, timesheets, leave, approvals, reports, knowledge base, cabs, users and more. Ask things like "how do I create a ticket?", "show my leave balance" or "where do I approve timesheets?"',
  },
  {
    id: 'create-ticket',
    keywords: [
      'create ticket',
      'new ticket',
      'raise ticket',
      'raise a ticket',
      'log a ticket',
      'file a ticket',
      'make a ticket',
      'add a ticket',
    ],
    answer:
      'To create a ticket: open the Create Ticket page (or press the "+" icon in the header), pick a ticket type, fill in the title and description, assign it and submit. It then lands in Ticket Management for triage and work.',
    link: { key: 'CREATE_TICKET', label: 'Create Ticket' },
  },
  {
    id: 'ticket-management',
    keywords: [
      'ticket management',
      'view tickets',
      'open tickets',
      'my tickets',
      'ticket list',
      'assigned tickets',
      'work on ticket',
    ],
    answer:
      'The Ticket Management page lists tickets across every configured ticket type: search or filter, then open one to add comments, change its status or work on it. Opening a row shows the full detail view with its timeline.',
    link: { key: 'TICKET_MANAGEMENT', label: 'Ticket Management' },
  },
  {
    id: 'ticket-detail',
    keywords: [
      'ticket detail',
      'open a ticket',
      'view ticket',
      'incident detail',
      'timeline',
      'activities',
      'resolutions',
      'time entries',
    ],
    answer:
      'Open any ticket or incident to see its detail page: description, status, activities, time entries, comments and resolutions. You can update the status, add a time entry or comment right from there.',
    link: { key: 'INCIDENT_MANAGEMENT', label: 'Incidents' },
  },
  {
    id: 'suggested-solution',
    keywords: [
      'suggested solution',
      'similar solution',
      'match solution',
      'apply solution',
      'resolved incident',
    ],
    answer:
      'While creating a ticket, ServiceOps suggests solutions from previously resolved incidents that match your issue. Pick one to apply it, or save it as a draft — it matches by how similar your description is to each past resolution.',
    link: { key: 'CREATE_TICKET', label: 'Create Ticket' },
  },
  {
    id: 'favourites',
    keywords: [
      'favourite',
      'favourites',
      'starred',
      'my favourites',
      'bookmark',
      'bookmarked tickets',
    ],
    answer:
      'My Favourite Tickets is your starred list across every ticket type. Star a ticket to pin it here; click a row to open it in a new tab.',
    link: { key: 'FAVOURITES', label: 'My Favourite Tickets' },
  },
  {
    id: 'recent-items',
    keywords: [
      'recent',
      'recent items',
      'recently accessed',
      'recently opened',
      'history of items',
    ],
    answer:
      'Recent Items lists the things you opened most recently across the system, so you can jump straight back to where you left off.',
    link: { key: 'RECENT_ITEMS', label: 'Recent Items' },
  },
  {
    id: 'incidents',
    keywords: ['incident'],
    answer:
      'Incidents are tracked end-to-end on the Incident Management page: open the incident, log activities and resolutions, then move it to Resolved. Related records live under Changes and Problems, and the detail page carries the full timeline.',
    link: { key: 'INCIDENT_MANAGEMENT', label: 'Incidents' },
  },
  {
    id: 'changes',
    keywords: ['change request', 'change management', 'changes', 'planned change'],
    answer:
      'Change Requests are raised from Change Management: pick the change type, describe the impact and risk, and submit. Approvers decide each request and every change keeps a full audit trail.',
    link: { key: 'CHANGE_MANAGEMENT', label: 'Changes' },
  },
  {
    id: 'problems',
    keywords: ['problem management', 'problems', 'root cause'],
    answer:
      'Recurring or root-cause issues are tracked as Problems on the Problem Management page. Link the related incidents and changes, assign an owner, and resolve the root cause so it stops repeating.',
    link: { key: 'PROBLEM_MANAGEMENT', label: 'Problems' },
  },
  {
    id: 'timesheet-dashboard',
    keywords: [
      'timesheet',
      'time sheet',
      'log hours',
      'weekly hours',
      'hours',
      'calendar timesheet',
    ],
    answer:
      'The Timesheet dashboard shows your month day by day. Click any day to edit the entry or copy it from the previous week, then log hours under a client, project and task. It also shows your leave balance, upcoming events and holidays.',
    link: { key: 'TIMESHEET', label: 'Timesheet' },
  },
  {
    id: 'timesheet-submit',
    keywords: ['submit timesheet', 'timesheet submit', 'fill timesheet', 'log my week'],
    answer:
      'The Timesheet Submit page builds your week sheet: add rows with a client, project and task, set the daily hours, mark the billable flag and add external or internal notes, then submit. Your manager decides it in Timesheet Approval.',
    link: { key: 'TIMESHEET_SUBMIT', label: 'Timesheet Submit' },
  },
  {
    id: 'approvals',
    keywords: [
      'approval',
      'approvals',
      'approve',
      'reject',
      'my approvals',
      'pending',
      'manager decision',
      'decide',
    ],
    answer:
      'My Approvals (on the Timesheet dashboard) links to the shared Approvals page — one tab per type: Timesheet, Reopen Timesheet, Time-Off, Project, Customer, Exti, Expense and Employee Self Service. Decide in-cell with the Action field, or bulk with Approve All / Reject All; decided requests move to the history table.',
    link: { key: 'TIMESHEET_APPROVALS', label: 'My Approvals' },
  },
  {
    id: 'apply-leave',
    keywords: [
      'apply leave',
      'take leave',
      'request leave',
      'leave request',
      'time off',
      'time-off',
      'pto',
      'vacation',
      'apply for leave',
    ],
    answer:
      'To apply for leave: open Personal Time Off, press "Apply Leave", choose your leave type, dates and reason. It goes to your manager, and the balance cards and request tables on the same page show live status.',
    link: { key: 'LEAVE', label: 'Personal Time Off' },
  },
  {
    id: 'leave-history',
    keywords: ['leave history', 'my leave', 'leave requests', 'pending leave'],
    answer:
      'Your full leave history is on the Personal Time Off page: "My Leave History" shows every request across all statuses, "Leave Approval Request" shows what is still pending, and "Leave Approval History" shows decided ones with who approved them.',
    link: { key: 'LEAVE', label: 'Personal Time Off' },
  },
  {
    id: 'reports',
    keywords: ['report', 'reports', 'dashboard report'],
    answer:
      'The Reports page is where all system reports live — you open any report in a new tab to view it. (The report library is still being built out; the page shell and navigation are in place.)',
    link: { key: 'REPORTS', label: 'Reports' },
  },
  {
    id: 'knowledge-base',
    keywords: ['knowledge base', 'knowledge', 'kb', 'article', 'articles', 'procedure'],
    answer:
      'Knowledge Base is where shared articles and procedures are kept so the team can reuse solutions. The page is in place for managing articles; the article library is still being populated.',
    link: { key: 'KNOWLEDGE_BASE', label: 'Knowledge Base' },
  },
  {
    id: 'test-scripts',
    keywords: ['test script', 'test scripts', 'test case', 'test cases'],
    answer:
      'Test Scripts are kept on the Test Scripts page — a library of reusable steps per release. Admins add and edit; everyone else can run them.',
    link: { key: 'TEST_SCRIPTS', label: 'Test Scripts' },
  },
  {
    id: 'cab',
    keywords: ['cab', 'taxi', 'ride', 'car service'],
    answer:
      'Cab requests are managed on the Cab Request page across projects. The page is live for the feature; the request forms are being wired up, so check back as it fills in.',
    link: { key: 'CAB_REQUEST', label: 'Cab Request' },
  },
  {
    id: 'user-management',
    keywords: [
      'user management',
      'manage users',
      'add user',
      'create user',
      'team member',
      'employee management',
      'assign role',
    ],
    answer:
      'Admins manage people on User Management: create or edit a user, assign a role (Admin / User / Consultant) and set the status. Role changes take effect at the next sign-in.',
    link: { key: 'USER_MANAGEMENT', label: 'User Management' },
  },
  {
    id: 'clients-projects',
    keywords: ['client', 'clients', 'project', 'projects', 'clients and projects'],
    answer:
      'Clients and projects are maintained on the Clients and Projects page — add a client, create a project under it and set a manager. The timesheet pickers pull from this list.',
    link: { key: 'CLIENTS_AND_PROJECTS', label: 'Clients & Projects' },
  },
  {
    id: 'access-requests',
    keywords: ['access request', 'role request', 'permission', 'access', 'request role'],
    answer:
      'Access requests live on the Access Requests page: ask for a role, see its status and track who decided it.',
    link: { key: 'ROLE_REQUESTS', label: 'Access Requests' },
  },
  {
    id: 'configuration',
    keywords: [
      'configuration',
      'config',
      'ticket type',
      'ticket types',
      'approved estimate',
      'admin controls',
      'priorities',
      'statuses',
      'sla',
      'slas',
      'categorization',
      'business category',
      'service line',
      'reason code',
      'templates',
      'canned text',
      'calendars',
      'working day',
      'holiday calendar',
      'timesheet period',
      'sequence',
      'due date',
      'et controls',
      'eta',
      'time log',
    ],
    answer:
      'Configuration is the admin hub that keeps the whole app running. Visible sections: Admin Controls (system settings + default approved estimates per ticket type), Ticket Types, Priorities (levels, impact, urgency + matrix), Statuses, SLAs (response/ack/resolution, due dates, ET/ETA, time log), Categorization (business categories, service lines, applications and queues), Reason Codes, Templates (canned text for updates, comments, notes, resolutions, time entries) and Calendars (working days, holiday calendars, working calendars, timesheet periods). Each opens as a familiar table + search panel where you add, edit or delete rows. A few more (Consultant Profiles, Approvals, User Config, Timesheets, Expenses) are deep-linkable inside Configuration.',
    link: { key: 'CONFIGURATION', label: 'Configuration' },
  },
  {
    id: 'time-management',
    keywords: [
      'time management',
      'expense',
      'expenses',
      'expense claim',
      'per diem',
      'travel claim',
    ],
    answer:
      'Time Management is where all time entries across projects are managed. Expense claims are approved under the Expense Approval tab on the Approvals page. The time-entry management view is still being built out.',
    link: { key: 'TIME_MANAGEMENT', label: 'Time Management' },
  },
  {
    id: 'payroll',
    keywords: ['payroll', 'salary', 'payslip', 'pay slip', 'bonus', 'incentive', 'compensation'],
    answer:
      'Payroll, payslips and bonuses are handled by the finance team — the app tracks work (timesheets, expenses, leave) that feeds it. For pay dates or a missing entry, contact your HR representative.',
  },
  {
    id: 'optional-holidays',
    keywords: [
      'optional holiday',
      'optional holidays',
      'festival',
      'public holiday',
      'national holiday',
      'festival list',
    ],
    answer:
      'Optional (festival) holidays show in the Holidays card on the Timesheet dashboard. You can apply for them as leave from the Personal Time Off page — consult your manager before you go.',
    link: { key: 'TIMESHEET', label: 'Timesheet' },
  },
  {
    id: 'dashboard',
    keywords: ['dashboard', 'home', 'overview', 'start page'],
    answer:
      'The dashboard is your starting point — open items, recent activity and counts per module. Jump into any module from the side navigation or from its card.',
    link: { key: 'DASHBOARD', label: 'Dashboard' },
  },
  {
    id: 'profile',
    keywords: ['profile', 'password', 'my details', 'personal details', 'update my info'],
    answer:
      'Your profile — name, employee id, contact details and password — is on the Profile page, reachable from the avatar menu in the top-right.',
    link: { key: 'PROFILE', label: 'Profile' },
  },
  {
    id: 'ticket-bundle',
    keywords: ['ticket template', 'ticket bundle', 'template', 'templates', 'bundle'],
    answer:
      'Ticket Bundle holds pre-defined ticket templates that streamline creation with pre-filled fields and standardised workflows. The template library is being built out on the Ticket Bundle page.',
    link: { key: 'TICKET_BUNDLE', label: 'Ticket Bundle' },
  },
];

const resolveLink = (entry: Entry, role: AppRole): BotLink[] => {
  if (!entry.link) return [];
  const path = PATHS[entry.link.key][role];
  return path ? [{ label: entry.link.label, path }] : [];
};

/* ── Live data answers (the bot checks the app's real records, not just
   the how-to text) ── */

const leaveLink = (role: AppRole): BotLink[] => {
  const path = PATHS.LEAVE[role];
  return path ? [{ label: 'Personal Time Off', path }] : [];
};

const balanceAnswer = (name: string, role: AppRole, balances: ILeaveBalance[]): BotReply => {
  if (balances.length === 0)
    return {
      text: `I couldn't find any leave balances saved for your account yet, ${name}. You can apply for leave from the Personal Time Off page — your manager approves it and the balance updates automatically.`,
      links: leaveLink(role),
    };
  const lines = balances
    .map((b) => `• ${b.leaveType}: ${b.available} of ${b.total} available`)
    .join('\n');
  return {
    text: `Here are your live leave balances:\n${lines}\nYou can apply for more from the Personal Time Off page.`,
    links: leaveLink(role),
  };
};

const requestsAnswer = (name: string, role: AppRole, requests: ILeaveRequest[]): BotReply => {
  const pending = requests.filter((r) => r.status === 'submitted');
  const decided = requests.filter((r) => r.status !== 'submitted');
  let text: string;
  if (requests.length === 0) {
    text = `You don't have any leave requests yet, ${name}. Apply for one from the Personal Time Off page and I can track its status here.`;
  } else {
    const parts: string[] = [];
    if (pending.length > 0)
      parts.push(
        `You have ${pending.length} request${pending.length > 1 ? 's' : ''} awaiting approval:\n${pending
          .map((r) => `• ${r.leaveType}, ${r.period} (${r.days} day${r.days !== 1 ? 's' : ''})`)
          .join('\n')}`,
      );
    if (decided.length > 0)
      parts.push(
        `Decided requests:\n${decided
          .map(
            (r) =>
              `• ${r.leaveType}, ${r.period} — ${r.status}${r.approvedBy ? ` by ${r.approvedBy}` : ''}`,
          )
          .join('\n')}`,
      );
    text = parts.join('\n');
  }
  return { text, links: leaveLink(role) };
};

/* ── The main engine: live data first, then keyword-scored knowledge, then
   a helpful fallback. ── */
export const answerQuestion = (
  question: string,
  name: string,
  role: AppRole,
  leaveBalance: ILeaveBalance[],
  leaveRequests: ILeaveRequest[],
): BotReply => {
  const q = question.toLowerCase();

  /* Live: "show my leave balance / how much leave do I have" */
  if (
    /\b(leave|time.?off|pto)\b/.test(q) &&
    /\b(balance|remaining|how much|left|available|quota|show|check)\b/.test(q)
  )
    return balanceAnswer(name, role, leaveBalance);

  /* Live: "show my leave requests / what's pending" */
  if (
    /\b(leave|time.?off)\b/.test(q) &&
    /\b(request|requests|history|pending|submitted|approved|rejected|show|list|status)\b/.test(q)
  )
    return requestsAnswer(name, role, leaveRequests);

  /* Knowledge base — score every entry by how many of its keyword phrases
     appear in the question; the best score wins. */
  let best: { entry: Entry; score: number } | null = null;
  for (const entry of entries) {
    const score = entry.keywords.reduce((s, k) => s + (q.includes(k) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  if (best)
    return {
      text: best.entry.answer,
      links: resolveLink(best.entry, role),
    };

  return {
    text: `I'm not sure I can help with that, ${name}. I cover the whole app — tickets, incidents, changes, problems, timesheets, leave, approvals, reports, knowledge base, cabs, users and configuration. Try asking "how do I submit a timesheet?" or "show my leave balance".`,
    links: [],
  };
};
