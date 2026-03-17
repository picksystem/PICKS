/**
 * Auth Interfaces
 * Shared between Frontend and Backend
 */

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CONSULTANT = 'consultant',
}

export enum UserStatus {
  PENDING_APPROVAL = 'pending_approval',
  INVITED = 'invited',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEACTIVATED = 'deactivated',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum UserSource {
  SIGNUP = 'signup',
  ADMIN = 'admin',
  TICKET = 'ticket',
  AD = 'ad',
}

export enum RoleRequestStatus {
  PENDING = 'pending_approval',
  APPROVED = 'active',
  REJECTED = 'rejected',
}

export interface IAuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  phone: string | null;
  workLocation: string | null;
  department: string | null;
  businessUnit: string | null;
  employeeId: string | null;
  managerName: string | null;
  dateOfBirth: string | null;
  profilePicture: string | null;
  reasonForAccess: string | null;
  role: UserRole;
  requestedRole: string | null;
  status: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  accessFromDate: string | null;
  accessToDate: string | null;
  timezone: string | null;
  dateFormat: string | null;
  timeFormat: string | null;
  language: string | null;
  slaWorkingCalendar: string | null;
  slaExceptionGroup: string | null;
  application: string | null;
  applicationLead: string | null;
  consultantProfileUpdated: boolean;
  mustResetPassword: boolean;
  source: string | null;
  lastActivityAt: string | null;
  lastLoginAt?: string | null;
  failedLoginAttempts?: number | null;
  lockedUntil?: string | null;
  passwordChangedAt?: string | null;
}

export interface IUserChangeLog {
  id: number;
  userId: number;
  changeType: string;
  fieldName: string | null;
  previousValue: string | null;
  newValue: string | null;
  changedBy: number;
  changedByName: string;
  reasonCode: string | null;
  reasonNotes: string | null;
  createdAt: string;
}

export interface IConsultantProfile {
  id: number;
  userId: number;
  application: string;
  consultantRole: string | null;
  slaWorkingCalendar: string | null;
  slaExceptionCalendar: string | null;
  leadConsultant: string | null;
  applicationManager: string | null;
  isPocLead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConsultantRole {
  id: number;
  application: string;
  roleName: string;
  description: string | null;
  createdAt: string;
}

export type AuthAction =
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password'
  | 'change-password'
  | 'get-my-profile'
  | 'update-my-profile'
  | 'get-role-requests'
  | 'get-pending-role-requests'
  | 'approve-role-request'
  | 'reject-role-request'
  | 'get-all-users'
  | 'get-user'
  | 'update-user'
  | 'delete-user'
  | 'unlock-user'
  | 'create-user'
  | 'create-pending-user'
  | 'approve-pending-user'
  | 'generate-temp-password'
  | 'reset-user-password'
  | 'get-change-log'
  | 'get-consultant-profiles'
  | 'create-consultant-profile'
  | 'update-consultant-profile'
  | 'get-consultant-roles'
  | 'create-consultant-role'
  | 'update-consultant-role'
  | 'delete-consultant-role'
  | 'get-login-logs'
  | 'deactivate-user'
  | 'activate-user';

export interface IAuthActionRequest {
  action: AuthAction;
  [key: string]: unknown;
}

export interface ISignInInput {
  email: string;
  password: string;
}

export interface ISignInResponse {
  message: string;
  data: {
    user: IAuthUser;
    token: string;
    adminApproved: boolean;
    adminRequestPending: boolean;
  };
}
