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

/**
 * The user shape the backend sends to the frontend.
 *
 * `IAuthUser` is a DTO — a positive allow-list projection of the Prisma `User`
 * entity, NOT the entity itself. It excludes every backend-only/secret field
 * (password hash, OTP, invitation token, lockout counters, …). The entity is
 * owned by the backend; the DTO is what crosses the boundary. See
 * `libs/entities/dtos/user.dto.ts` and `gateways/api/auth/user.mapper.ts`.
 */
export type IAuthUser = import('../dtos/user.dto').IUserDto;

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

export type AuthAction =
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password'
  | 'change-password'
  | 'get-my-profile'
  | 'update-my-profile'
  | 'get-session'
  | 'logout'
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
    mustResetPassword: boolean;
    adminApproved: boolean;
    adminRequestPending: boolean;
  };
}

/**
 * Response of the `get-session` action, used to re-hydrate the UI on page
 * load against the server-side session cookie (no token is involved).
 */
export interface ISessionResponse {
  message: string;
  data:
    | { authenticated: false }
    | { authenticated: true; user: IAuthUser; mustResetPassword: boolean };
}
