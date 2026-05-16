const BASE = '/app/admin';
const USER_BASE = '/app/user';
const CONSULTANT_BASE = '/app/consultant';

const BasePath = {
  DASHBOARD: `${BASE}/dashboard`,
  FAVOURITES: `${BASE}/favourites`,
  RECENT_ITEMS: `${BASE}/recent-items`,
  INCIDENT_MANAGEMENT: `${BASE}/incident-management`,
  CHANGE_MANAGEMENT: `${BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${BASE}/problem-management`,
  TIME_MANAGEMENT: `${BASE}/time-management`,
  REPORTS: `${BASE}/reports`,
  TICKET_TEMPLATES: `${BASE}/ticket-templates`,
  CAB_REQUEST: `${BASE}/cab-request`,
  KNOWLEDGE_BASE: `${BASE}/knowledge-base`,
  TEST_SCRIPTS: `${BASE}/test-scripts`,
  CREATE_TICKET: `${BASE}/create-ticket`,
  CREATE_TICKET_TYPE: `${BASE}/:type`,
  USER_MANAGEMENT: `${BASE}/user-management`,
  ROLE_REQUESTS: `${BASE}/access-requests`,
  PROFILE: `${BASE}/profile`,
  INCIDENT_DETAIL: `${BASE}/incident/:number`,
  TICKET_DETAIL: `${BASE}/ticket/:number`,
  SUGGESTED_SOLUTION: `${BASE}/suggested-solution`,
  CONSULTANT_PROFILE: `${BASE}/consultant-profile`,
  CONFIGURATION: `${BASE}/configuration`,
};

const UserPath = {
  DASHBOARD: `${USER_BASE}/dashboard`,
  FAVOURITES: `${USER_BASE}/favourites`,
  RECENT_ITEMS: `${USER_BASE}/recent-items`,
  INCIDENT_MANAGEMENT: `${USER_BASE}/incident-management`,
  CHANGE_MANAGEMENT: `${USER_BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${USER_BASE}/problem-management`,
  CREATE_TICKET: `${USER_BASE}/create-ticket`,
  PROFILE: `${USER_BASE}/profile`,
  INCIDENT_DETAIL: `${USER_BASE}/incident/:number`,
  TICKET_DETAIL: `${USER_BASE}/ticket/:number`,
};

const ConsultantPath = {
  DASHBOARD: `${CONSULTANT_BASE}/dashboard`,
  FAVOURITES: `${CONSULTANT_BASE}/favourites`,
  RECENT_ITEMS: `${CONSULTANT_BASE}/recent-items`,
  INCIDENT_MANAGEMENT: `${CONSULTANT_BASE}/incident-management`,
  CHANGE_MANAGEMENT: `${CONSULTANT_BASE}/change-management`,
  PROBLEM_MANAGEMENT: `${CONSULTANT_BASE}/problem-management`,
  CREATE_TICKET: `${CONSULTANT_BASE}/create-ticket`,
  PROFILE: `${CONSULTANT_BASE}/profile`,
  INCIDENT_DETAIL: `${CONSULTANT_BASE}/incident/:number`,
  TICKET_DETAIL: `${CONSULTANT_BASE}/ticket/:number`,
};

const AuthPath = {
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
};

const DefalutPage = {
  BASE_DEFAULT_PAGE: '/app/admin/*',
  USER_DEFAULT_PAGE: '/app/user/*',
  CONSULTANT_DEFAULT_PAGE: '/app/consultant/*',
};

/**
 * Combined Path object.
 * - Base components should use constants.BasePath
 * - User components should use constants.UserPath
 * - Auth/shared components should use constants.Path for auth routes
 */
const Path = {
  DEFAULT_PAGE: '/',
  ...AuthPath,
  ...BasePath,
  NOT_FOUND: '*',
};

export const constants = {
  Path,
  BasePath,
  UserPath,
  ConsultantPath,
  AuthPath,
  BASE,
  USER_BASE,
  CONSULTANT_BASE,
  DefalutPage,
};
