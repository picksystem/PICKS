/**
 * User DTO — the shape of user data sent FROM the backend TO the frontend.
 *
 * A Data Transfer Object, NOT the domain entity. The backend owns the Prisma
 * `User` entity (and its secrets: password hash, OTP, invitation token,
 * lockout state, …). This DTO is a positive allow-list projection of the
 * fields the UI is meant to consume — anything not listed here is deliberately
 * not sent. Re-deriving this from the entity happens in a backend mapper
 * (`gateways/api/auth/user.mapper.ts`), never by passing the raw entity across
 * the boundary.
 *
 * Keeping the DTO here (shared) instead of mirroring the Prisma entity is what
 * decouples the two sides: the UI no longer depends on the backend domain model,
 * and a new backend-only field can never silently leak to the client.
 *
 * Self-contained (no enum imports) so it can't create a circular import with
 * the interfaces barrel; `role`/`status` are plain string unions here and the
 * UI compares them against the `UserRole`/`UserStatus` enums (string values).
 */
export interface IUserDto {
  id: number;

  // Identity
  firstName: string;
  lastName: string;
  email: string;
  name: string;

  // Profile / contact
  phone: string | null;
  workLocation: string | null;
  department: string | null;
  businessUnit: string | null;
  employeeId: string | null;
  managerName: string | null;
  dateOfBirth: string | null;
  profilePicture: string | null;
  reasonForAccess: string | null;

  // Role & access state (admin-facing; legitimate to display, not a secret)
  role: string;
  requestedRole: string | null;
  status: string | null;
  source: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;

  // Account flags
  isActive: boolean;
  mustResetPassword: boolean;
  consultantProfileUpdated: boolean;

  // Security / lockout (admin-visible operational data, shown in user-management)
  failedLoginAttempts?: number | null;
  lockedUntil?: string | null;
  passwordChangedAt?: string | null;

  // Access window
  accessFromDate: string | null;
  accessToDate: string | null;

  // Locale / SLA preferences
  timezone: string | null;
  dateFormat: string | null;
  timeFormat: string | null;
  language: string | null;
  slaWorkingCalendar: string | null;
  slaExceptionGroup: string | null;
  application: string | null;
  applicationLead: string | null;

  // Activity
  lastActivityAt: string | null;
  lastLoginAt?: string | null;

  // Audit
  createdAt: string;
  updatedAt: string;
}
