import { Request, Response } from 'express';
import { prisma } from './prisma.client';

/**
 * Server-side session lifecycle helpers.
 *
 * The session cookie itself is managed by express-session (persisted in the
 * UserSession table via PgSessionStore). This module provides the user-level
 * operations: reading the session user, destroying a session, and revoking
 * all of a user's sessions (e.g. after password change / deactivation).
 */

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

/** The cookie name must match the express-session `name` option in app.ts. */
export const SESSION_COOKIE_NAME = 'serviceops.sid';

/**
 * Read the user referenced by the current session.
 * Returns null when there is no session, the session has no userId, the user
 * no longer exists, or the user is no longer active — i.e. the session is
 * effectively revoked.
 */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const userId: number | undefined = req.session?.userId;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
  });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
}

/** Destroy the current session (server-side) and clear the cookie (client-side). */
export function destroySession(req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    // Keep the secure flag consistent with the session cookie's settings.
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  req.session.destroy(() => {});
}

/**
 * Revoke sessions for a user across all devices.
 * Used after password change / reset / deactivation so an attacker holding a
 * stolen cookie on another device is signed out immediately.
 *
 * @param userId - The user whose sessions should be revoked.
 * @param excludeSessionId - Optional session id to keep alive (e.g. the current
 *   request's `req.sessionID`), so the active session is not invalidated.
 */
export async function revokeAllUserSessions(
  userId: number,
  excludeSessionId?: string,
): Promise<void> {
  if (excludeSessionId) {
    await prisma.$executeRaw`
      DELETE FROM "UserSession"
      WHERE (data->>'userId')::int = ${userId} AND id <> ${excludeSessionId}
    `;
  } else {
    await prisma.$executeRaw`
      DELETE FROM "UserSession" WHERE (data->>'userId')::int = ${userId}
    `;
  }
}

/** Delete all expired session rows (run periodically by the server process). */
export async function pruneExpiredSessions(): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "UserSession" WHERE "expiresAt" < now()
  `;
}
