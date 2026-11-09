import { IAuthUser } from '@serviceops/interfaces';

/**
 * Entity → DTO mappers for user-facing responses.
 *
 * These are the single place where a backend Prisma `User` entity (or its
 * row-shaped representation) is turned into the frontend-facing `IAuthUser`
 * DTO. They use a POSITIVE allow-list: only the fields listed below are ever
 * emitted, so a new backend-only or secret field (password hash, OTP,
 * invitation token, lockout state, …) can never leak to the UI by accident —
 * it has to be explicitly added here to be sent.
 *
 * This replaces the old `sanitizeUser` helper, which worked by *deleting* a
 * handful of secret fields from the whole entity (deletion-list) — the fragile
 * inverse, where any new field leaked by default.
 */

const toIso = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** Map a Prisma `User` entity (or raw row) to the frontend `IAuthUser` DTO. */
export function toUserDto(user: Record<string, unknown>): IAuthUser {
  const str = (value: unknown): string | null =>
    value === null || value === undefined ? null : String(value);

  const dto: IAuthUser = {
    id: Number(user.id),

    // Identity
    firstName: str(user.firstName) ?? '',
    lastName: str(user.lastName) ?? '',
    email: str(user.email) ?? '',
    name: str(user.name) ?? '',

    // Profile / contact
    phone: str(user.phone),
    workLocation: str(user.workLocation),
    department: str(user.department),
    businessUnit: str(user.businessUnit),
    employeeId: str(user.employeeId),
    managerName: str(user.managerName),
    dateOfBirth: str(user.dateOfBirth),
    profilePicture: str(user.profilePicture),
    reasonForAccess: str(user.reasonForAccess),

    // Role & access state
    role: str(user.role) ?? 'user',
    requestedRole: str(user.requestedRole),
    status: str(user.status),
    source: str(user.source),
    reviewedBy:
      user.reviewedBy === null || user.reviewedBy === undefined ? null : Number(user.reviewedBy),
    reviewedAt: toIso(user.reviewedAt),
    adminNotes: str(user.adminNotes),

    // Account flags
    isActive: user.isActive === true,
    mustResetPassword: user.mustResetPassword === true,
    consultantProfileUpdated: user.consultantProfileUpdated === true,

    // Security / lockout (admin-visible operational data)
    failedLoginAttempts:
      user.failedLoginAttempts === null || user.failedLoginAttempts === undefined
        ? null
        : Number(user.failedLoginAttempts),
    lockedUntil: toIso(user.lockedUntil),
    passwordChangedAt: toIso(user.passwordChangedAt),

    // Access window
    accessFromDate: toIso(user.accessFromDate),
    accessToDate: toIso(user.accessToDate),

    // Locale / SLA preferences
    timezone: str(user.timezone),
    dateFormat: str(user.dateFormat),
    timeFormat: str(user.timeFormat),
    language: str(user.language),
    slaWorkingCalendar: str(user.slaWorkingCalendar),
    slaExceptionGroup: str(user.slaExceptionGroup),
    application: str(user.application),
    applicationLead: str(user.applicationLead),

    // Activity
    lastActivityAt: toIso(user.lastActivityAt),

    // Audit
    createdAt: toIso(user.createdAt) ?? '',
    updatedAt: toIso(user.updatedAt) ?? '',
  };

  // lastLoginAt is only present on some flows (sign-in) — include when present.
  const lastLoginAt = toIso(user.lastLoginAt);
  if (lastLoginAt !== null) dto.lastLoginAt = lastLoginAt;

  return dto;
}

/** Map a login-log row to a safe, UI-facing shape. */
export interface LoginLogDto {
  id: number;
  userId: number;
  loginTime: string | null;
  logoutTime: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export function toLoginLogDto(row: Record<string, unknown>): LoginLogDto {
  const str = (value: unknown): string | null =>
    value === null || value === undefined ? null : String(value);

  return {
    id: Number(row.id),
    userId: Number(row.userId),
    loginTime: toIso(row.loginTime),
    logoutTime: toIso(row.logoutTime),
    ipAddress: str(row.ipAddress),
    userAgent: str(row.userAgent),
  };
}

/** Map a change-log row to a safe, UI-facing shape. */
export interface UserChangeLogDto {
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
  createdAt: string | null;
}

export function toUserChangeLogDto(row: Record<string, unknown>): UserChangeLogDto {
  const str = (value: unknown): string | null =>
    value === null || value === undefined ? null : String(value);

  return {
    id: Number(row.id),
    userId: Number(row.userId),
    changeType: str(row.changeType) ?? '',
    fieldName: str(row.fieldName),
    previousValue: str(row.previousValue),
    newValue: str(row.newValue),
    changedBy: Number(row.changedBy),
    changedByName: str(row.changedByName) ?? '',
    reasonCode: str(row.reasonCode),
    reasonNotes: str(row.reasonNotes),
    createdAt: toIso(row.createdAt),
  };
}
