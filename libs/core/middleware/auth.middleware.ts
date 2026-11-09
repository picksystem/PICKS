import { Request, Response, NextFunction } from 'express';
import { prisma } from '@serviceops/database';
import { UnauthorizedException, ForbiddenException } from './error-handler.middleware';

/**
 * Session-based authentication.
 *
 * Login no longer returns a token — a server-side session (persisted in the
 * UserSession table via a Postgres-backed express-session store) is set on a
 * cookie. These middlewares restore the user on every request by looking up
 * the session's userId, so sessions stay revocable (logout, deactivation, or
 * password change immediately terminates access).
 */

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

/** Require a valid, active session. Populates `req.user`. */
export async function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const userId: number | undefined = req.session?.userId;
  if (!userId) {
    next(new UnauthorizedException('Authentication required'));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      next(new UnauthorizedException('Session no longer active. Please sign in again.'));
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Require an authenticated admin user. Must run after `requireAuth`. */
export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(new ForbiddenException('Admin access required'));
    return;
  }
  next();
}
