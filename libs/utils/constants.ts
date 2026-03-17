const ADMIN_BASE = '/app/admin';
const USER_BASE = '/app/user';
const CONSULTANT_BASE = '/app/consultant';

const AdminPath = {
  DASHBOARD: `${ADMIN_BASE}/dashboard`,
  FAVOURITES: `${ADMIN_BASE}/favourites`,
  RECENT_ITEMS: `${ADMIN_BASE}/recent-items`,
  INCIDENT_MANAGEMENT: `${ADMIN_BASE}/incident-management`,
  CHANGE_MANAGEMENT: `${ADMIN_BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${ADMIN_BASE}/problem-management`,
  TIME_MANAGEMENT: `${ADMIN_BASE}/time-management`,
  REPORTS: `${ADMIN_BASE}/reports`,
  TICKET_TEMPLATES: `${ADMIN_BASE}/ticket-templates`,
  CAB_REQUEST: `${ADMIN_BASE}/cab-request`,
  KNOWLEDGE_BASE: `${ADMIN_BASE}/knowledge-base`,
  TEST_SCRIPTS: `${ADMIN_BASE}/test-scripts`,
  CREATE_TICKET: `${ADMIN_BASE}/create-ticket`,
  CREATE_TICKET_TYPE: `${ADMIN_BASE}/:type`,
  USER_MANAGEMENT: `${ADMIN_BASE}/user-management`,
  ROLE_REQUESTS: `${ADMIN_BASE}/access-requests`,
  PROFILE: `${ADMIN_BASE}/profile`,
  INCIDENT_DETAIL: `${ADMIN_BASE}/incident/:number`,
  TICKET_DETAIL: `${ADMIN_BASE}/ticket/:number`,
  SUGGESTED_SOLUTION: `${ADMIN_BASE}/suggested-solution`,
  CONSULTANT_PROFILE: `${ADMIN_BASE}/consultant-profile`,
  CONFIGURATION: `${ADMIN_BASE}/configuration`,
};

const UserPath = {
  DASHBOARD: `${USER_BASE}/dashboard`,
  FAVOURITES: `${USER_BASE}/favourites`,
  RECENT_ITEMS: `${USER_BASE}/recent-items`,
  INCIDENT_MANAGEMENT: `${USER_BASE}/incident-management`,
  CHANGE_MANAGEMENT: `${USER_BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${USER_BASE}/problem-management`,
};

const ConsultantPath = {
  DASHBOARD: `${CONSULTANT_BASE}/dashboard`,
  CHANGE_MANAGEMENT: `${CONSULTANT_BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${CONSULTANT_BASE}/problem-management`,
  CREATE_TICKET: `${CONSULTANT_BASE}/create-ticket`,
};

const AuthPath = {
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
};

const DefalutPage = {
  ADMIN_DEFAULT_PAGE: '/app/admin/*',
  USER_DEFAULT_PAGE: '/app/user/*',
  CONSULTANT_DEFAULT_PAGE: '/app/consultant/*',
};

/**
 * Combined Path object.
 * - Admin components should use constants.AdminPath
 * - User components should use constants.UserPath
 * - Auth/shared components should use constants.Path for auth routes
 */
const Path = {
  DEFAULT_PAGE: '/',
  ...AuthPath,
  ...AdminPath,
  NOT_FOUND: '*',
};

export const constants = {
  Path,
  AdminPath,
  UserPath,
  ConsultantPath,
  AuthPath,
  ADMIN_BASE,
  USER_BASE,
  CONSULTANT_BASE,
  DefalutPage,
};
