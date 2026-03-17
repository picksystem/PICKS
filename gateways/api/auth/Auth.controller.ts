import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  SignInSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
} from '@picks/interfaces';
import { BadRequestException, HttpException, UnauthorizedException } from '@picks/middleware';
import { prisma } from '@picks/database';
import { PrismaClient } from '@prisma/client';
import { sendEmail, generateOtp } from '@picks/config';

const JWT_SECRET = process.env.JWT_SECRET || 'picks-jwt-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];
const APP_URL = process.env.APP_URL || 'http://localhost:4200';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// ─── User Status Constants ────────────────────────────────────────────────────
const STATUS = {
  PENDING_APPROVAL: 'pending_approval',
  INVITED: 'invited',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DEACTIVATED: 'deactivated',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// ─── User Source Constants ────────────────────────────────────────────────────
const SOURCE = {
  SIGNUP: 'signup',
  ADMIN: 'admin',
  TICKET: 'ticket',
  AD: 'ad',
} as const;

type AuthAction =
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
  | 'generate-temp-password'
  | 'reset-user-password'
  | 'get-change-log'
  | 'activate-user'
  | 'deactivate-user'
  | 'get-consultant-profiles'
  | 'create-consultant-profile'
  | 'update-consultant-profile'
  | 'get-consultant-roles'
  | 'create-consultant-role'
  | 'update-consultant-role'
  | 'delete-consultant-role'
  | 'get-login-logs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUser(user: Record<string, unknown>) {
  const { password, otp, otpExpiresAt, otpIsUsed, invitationToken, ...safe } = user;
  return {
    ...safe,
    userId: safe.id,
    userName: safe.name,
    userEmail: safe.email,
  };
}

/** Generate a random temporary password: uppercase + lowercase + digit + symbol */
function generateTempPw(length = 12): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}

/** Log an audit entry to UserChangeLog */
async function logChange(
  db: PrismaClient,
  userId: number,
  changeType: string,
  changedBy: number,
  changedByName: string,
  opts: {
    fieldName?: string;
    previousValue?: string;
    newValue?: string;
    reasonCode?: string;
    reasonNotes?: string;
  } = {},
) {
  await (db as any).userChangeLog.create({
    data: {
      userId,
      changeType,
      changedBy,
      changedByName,
      fieldName: opts.fieldName ?? null,
      previousValue: opts.previousValue ?? null,
      newValue: opts.newValue ?? null,
      reasonCode: opts.reasonCode ?? null,
      reasonNotes: opts.reasonNotes ?? null,
    },
  });
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class AuthController {
  handleAction = async (req: Request, res: Response, next: NextFunction) => {
    const { action } = req.body as { action: AuthAction };

    try {
      switch (action) {
        case 'signin':
          return await this.signin(req, res);
        case 'signup':
          return await this.signup(req, res);
        case 'forgot-password':
          return await this.forgotPassword(req, res);
        case 'verify-otp':
          return await this.verifyOtp(req, res);
        case 'reset-password':
          return await this.resetPassword(req, res);
        case 'change-password':
        case 'get-my-profile':
        case 'update-my-profile':
          return await this.handleAuthenticatedAction(req, res, action);
        case 'get-role-requests':
        case 'get-pending-role-requests':
        case 'approve-role-request':
        case 'reject-role-request':
        case 'get-all-users':
        case 'get-user':
        case 'update-user':
        case 'delete-user':
        case 'unlock-user':
        case 'create-user':
        case 'create-pending-user':
        case 'generate-temp-password':
        case 'reset-user-password':
        case 'get-change-log':
        case 'activate-user':
        case 'deactivate-user':
        case 'get-consultant-profiles':
        case 'create-consultant-profile':
        case 'update-consultant-profile':
        case 'get-consultant-roles':
        case 'create-consultant-role':
        case 'update-consultant-role':
        case 'delete-consultant-role':
        case 'get-login-logs':
          return await this.handleAdminAction(req, res, action);
        default:
          res.status(400).json({ message: `Unknown action: ${action}` });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        next(new BadRequestException('Validation failed', errors));
      } else if (error instanceof HttpException) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };

  // ── Sign In ─────────────────────────────────────────────────────────────────
  private signin = async (req: Request, res: Response) => {
    const validatedData = await SignInSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const db = prisma as PrismaClient;
    const user = await db.user.findUnique({ where: { email: validatedData.email } });

    if (!user) throw new UnauthorizedException('Invalid email or password');

    // Block non-active statuses (STATUS.EXPIRED temporarily allowed)
    const activeStatuses = [STATUS.ACTIVE, STATUS.INVITED, STATUS.EXPIRED];
    if (!(user as any).isActive || !activeStatuses.includes((user as any).status as any)) {
      const statusMsg: Record<string, string> = {
        [STATUS.PENDING_APPROVAL]: 'Your account is pending admin approval.',
        [STATUS.INVITED]: 'Please set your password using the invitation link sent to your email.',
        [STATUS.DEACTIVATED]: 'Your account has been deactivated. Contact admin.',
        [STATUS.REJECTED]: 'Your access request was rejected. Contact admin.',
        [STATUS.EXPIRED]: 'Your account access has expired. Contact admin.',
        [STATUS.INACTIVE]: 'Your account is inactive. Contact admin.',
      };
      throw new UnauthorizedException(
        statusMsg[(user as any).status as string] ||
          'Your account is not active. Please contact admin.',
      );
    }

    // // Check lockout (temporarily disabled)
    // if (user.lockedUntil && user.lockedUntil > new Date()) {
    //   const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    //   res.status(423).json({
    //     message: `Account locked. Try again after ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
    //   });
    //   return;
    // }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      // // Failed attempts tracking disabled temporarily
      // const newFailed = user.failedLoginAttempts + 1;
      // const updateData: Record<string, unknown> = { failedLoginAttempts: newFailed };
      // if (newFailed >= MAX_FAILED_ATTEMPTS) {
      //   updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60_000);
      // }
      // await db.user.update({ where: { id: user.id }, data: updateData });
      // if (newFailed >= MAX_FAILED_ATTEMPTS) {
      //   res.status(423).json({
      //     message: `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} min.`,
      //   });
      //   return;
      // }
      throw new UnauthorizedException('Invalid email or password');
    }

    const now = new Date();
    await db.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now, lastActivityAt: now },
    });

    // Log login
    await (db as any).loginLog.create({
      data: {
        userId: user.id,
        loginTime: now,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: now.toISOString(),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const userWithLogin = { ...user, lastLoginAt: now } as unknown as Record<string, unknown>;
    const mustReset = (user as any).mustResetPassword === true;

    res.json({
      message: mustReset
        ? 'Sign in successful. You must change your temporary password before continuing.'
        : 'Sign in successful',
      data: {
        user: sanitizeUser(userWithLogin),
        token,
        mustResetPassword: mustReset,
        adminApproved: user.role === 'admin',
        adminRequestPending: false,
      },
    });
  };

  // ── Sign Up (source = signup, status = pending_approval) ───────────────────
  private signup = async (req: Request, res: Response) => {
    const validatedData = await SignUpSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const db = prisma as PrismaClient;

    const existingUser = await db.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`;

    const user = await db.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone || null,
        workLocation: validatedData.workLocation || null,
        department: validatedData.department || null,
        reasonForAccess: validatedData.reasonForAccess || null,
        employeeId: validatedData.employeeId || null,
        businessUnit: validatedData.businessUnit || null,
        managerName: validatedData.managerName || null,
        name: fullName,
        role: 'user',
        requestedRole: validatedData.role,
        status: STATUS.PENDING_APPROVAL,
        source: SOURCE.SIGNUP,
        isActive: false,
        // Auto-detected locale fields from browser
        timezone: (validatedData as any).timezone || null,
        language: (validatedData as any).language || null,
        dateFormat: (validatedData as any).dateFormat || null,
        timeFormat: (validatedData as any).timeFormat || null,
        slaWorkingCalendar: (validatedData as any).slaWorkingCalendar || null,
        slaExceptionGroup: (validatedData as any).slaExceptionGroup || null,
      },
    });

    // Notify admin (fire and forget)
    sendEmail(
      process.env.ADMIN_EMAIL || 'admin@picks.com',
      'PICKS — New Access Request',
      `<h2>New Access Request</h2>
       <p><strong>${fullName}</strong> (${validatedData.email}) has signed up and is requesting <strong>${validatedData.role}</strong> access.</p>
       <p>Please review in the Access Requests section.</p>`,
    ).catch(console.error);

    res.status(201).json({
      message:
        'Account created. Your request is pending admin approval. You will be notified via email once approved.',
      data: {
        user: sanitizeUser(user as unknown as Record<string, unknown>),
        status: STATUS.PENDING_APPROVAL,
      },
    });
  };

  private forgotPassword = async (req: Request, res: Response) => {
    const validatedData = await ForgotPasswordSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const db = prisma as PrismaClient;
    const user = await db.user.findUnique({ where: { email: validatedData.email } });

    if (!user) {
      res.json({ message: 'If the email exists, an OTP has been sent.' });
      return;
    }

    if (user.otpExpiresAt && user.otpExpiresAt > new Date() && !user.otpIsUsed) {
      const remainingMinutes = Math.ceil((user.otpExpiresAt.getTime() - Date.now()) / 60000);
      res.status(429).json({
        message: `OTP already sent. Wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
      });
      return;
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60_000);
    await db.user.update({
      where: { email: validatedData.email },
      data: { otp, otpExpiresAt, otpIsUsed: false },
    });

    if (process.env.NODE_ENV !== 'production')
      console.log(`[DEV] OTP for ${validatedData.email}: ${otp}`);

    sendEmail(
      validatedData.email,
      'PICKS — Password Reset OTP',
      `<h2>Password Reset</h2><p>Your OTP:</p><h1 style="color:#1976d2;letter-spacing:4px">${otp}</h1><p>Valid for 10 minutes.</p>`,
    ).catch(console.error);

    res.json({ message: 'If the email exists, an OTP has been sent.' });
  };

  private verifyOtp = async (req: Request, res: Response) => {
    const validatedData = await VerifyOtpSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const db = prisma as PrismaClient;
    const user = await db.user.findUnique({ where: { email: validatedData.email } });

    if (
      !user ||
      user.otp !== validatedData.otp ||
      user.otpIsUsed ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    await db.user.update({ where: { id: user.id }, data: { otpIsUsed: true } });

    const resetToken = jwt.sign(
      { email: validatedData.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
    res.json({ message: 'OTP verified', data: { verified: true, resetToken } });
  };

  private resetPassword = async (req: Request, res: Response) => {
    const validatedData = await ResetPasswordSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    let decoded: { email: string; purpose: string };
    try {
      decoded = jwt.verify(validatedData.resetToken, JWT_SECRET) as typeof decoded;
    } catch {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    if (decoded.purpose !== 'password-reset' || decoded.email !== validatedData.email) {
      res.status(400).json({ message: 'Invalid reset token' });
      return;
    }

    const db = prisma as PrismaClient;
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
    await db.user.update({
      where: { email: validatedData.email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
        otpIsUsed: false,
        passwordChangedAt: new Date(),
      },
    });

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  };

  // ── Authenticated (non-admin) actions ────────────────────────────────────────
  private handleAuthenticatedAction = async (req: Request, res: Response, action: string) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Access token is required');

    const token = authHeader.split(' ')[1];
    let decoded: { id: number; email: string; name: string; role: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as typeof decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const db = prisma as PrismaClient;

    const userId = Number(decoded.id);

    // Track last activity (fire-and-forget — does not block the response)
    db.user.update({ where: { id: userId }, data: { lastActivityAt: new Date() } }).catch(() => {});

    if (action === 'change-password') {
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'currentPassword and newPassword are required' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters' });
        return;
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(401).json({ message: 'Session expired. Please sign in again.' });
        return;
      }

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
      if (await bcrypt.compare(newPassword, user.password)) {
        res.status(400).json({ message: 'New password must differ from current' });
        return;
      }

      await db.user.update({
        where: { id: userId },
        data: {
          password: await bcrypt.hash(newPassword, 10),
          passwordChangedAt: new Date(),
          mustResetPassword: false,
        },
      });
      res.json({ message: 'Password changed successfully' });
    }

    if (action === 'get-my-profile') {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(401).json({ message: 'Session expired. Please sign in again.' });
        return;
      }
      res.json({
        message: 'Profile retrieved',
        data: sanitizeUser(user as unknown as Record<string, unknown>),
      });
    }

    if (action === 'update-my-profile') {
      const { data: updateData } = req.body as { data: Record<string, unknown> };
      if (!updateData || typeof updateData !== 'object') {
        res.status(400).json({ message: 'data object is required' });
        return;
      }

      const existing = await db.user.findUnique({ where: { id: userId } });
      if (!existing) {
        res.status(401).json({ message: 'Session expired. Please sign in again.' });
        return;
      }

      const safeFields = [
        'firstName',
        'lastName',
        'phone',
        'dateOfBirth',
        'profilePicture',
        'department',
        'workLocation',
        'employeeId',
        'businessUnit',
        'managerName',
        'timezone',
        'language',
        'dateFormat',
        'timeFormat',
      ];

      const sanitizedUpdate: Record<string, unknown> = {};
      for (const key of safeFields) {
        if (key in updateData) sanitizedUpdate[key] = updateData[key];
      }

      if ('firstName' in sanitizedUpdate || 'lastName' in sanitizedUpdate) {
        const fn = (sanitizedUpdate.firstName as string) ?? existing.firstName;
        const ln = (sanitizedUpdate.lastName as string) ?? existing.lastName;
        sanitizedUpdate.name = `${fn} ${ln}`;
      }

      const updated = await db.user.update({
        where: { id: userId },
        data: sanitizedUpdate,
      });

      res.json({
        message: 'Profile updated successfully',
        data: sanitizeUser(updated as unknown as Record<string, unknown>),
      });
    }
  };

  // ── Admin actions ─────────────────────────────────────────────────────────────
  private handleAdminAction = async (req: Request, res: Response, action: string) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Access token is required');

    const token = authHeader.split(' ')[1];
    let decoded: { id: number; email: string; name: string; role: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as typeof decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const db = prisma as PrismaClient;

    // Track last activity (fire-and-forget — does not block the response)
    db.user
      .update({ where: { id: decoded.id }, data: { lastActivityAt: new Date() } })
      .catch(() => {});

    switch (action) {
      // ── List users ──────────────────────────────────────────────────────────
      case 'get-all-users': {
        const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({
          message: 'Users retrieved successfully',
          data: users.map((u: Record<string, unknown>) =>
            sanitizeUser(u as unknown as Record<string, unknown>),
          ),
        });
        break;
      }

      case 'get-user': {
        const { userId } = req.body as { userId: number };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        res.json({
          message: 'User retrieved',
          data: sanitizeUser(user as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Pending requests ────────────────────────────────────────────────────
      case 'get-role-requests': {
        const users = await db.user.findMany({
          where: { requestedRole: { not: null } },
          orderBy: { createdAt: 'desc' },
        });
        res.json({
          message: 'Role requests retrieved',
          data: users.map((u: Record<string, unknown>) =>
            sanitizeUser(u as unknown as Record<string, unknown>),
          ),
        });
        break;
      }

      case 'get-pending-role-requests': {
        const users = await db.user.findMany({
          where: { status: STATUS.PENDING_APPROVAL },
          orderBy: { createdAt: 'desc' },
        });
        res.json({
          message: 'Pending requests retrieved',
          data: users.map((u: Record<string, unknown>) =>
            sanitizeUser(u as unknown as Record<string, unknown>),
          ),
        });
        break;
      }

      // ── Approve role request → status: INVITED, send invitation email ───────
      case 'approve-role-request': {
        const { userId, adminNotes, accessFromDate, accessToDate } = req.body as {
          userId: number;
          adminNotes?: string;
          accessFromDate?: string;
          accessToDate?: string;
        };

        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        if ((user as any).status !== STATUS.PENDING_APPROVAL) {
          res.status(400).json({ message: 'Request is not in pending_approval state' });
          return;
        }

        // Generate invitation token (15-min expiry)
        const invToken = crypto.randomBytes(32).toString('hex');
        const invExpiry = new Date(Date.now() + 24 * 60 * 60_000); // 24h

        const approvedRole = (user as any).requestedRole || 'user';
        const updated = await db.user.update({
          where: { id: userId },
          data: {
            role: approvedRole,
            status: STATUS.INVITED,
            isActive: false, // becomes active after user sets password
            reviewedBy: decoded.id,
            reviewedAt: new Date(),
            adminNotes: adminNotes || null,
            invitationToken: invToken,
            invitationExpiry: invExpiry,
            accessFromDate: accessFromDate ? new Date(accessFromDate) : null,
            accessToDate: accessToDate ? new Date(accessToDate) : null,
          } as any,
        });

        await logChange(db, userId, 'access_approved', decoded.id, decoded.name, {
          fieldName: 'status',
          previousValue: STATUS.PENDING_APPROVAL,
          newValue: STATUS.INVITED,
          reasonNotes: adminNotes,
        });

        // Send invitation email with set-password link
        const invLink = `${APP_URL}/set-password?token=${invToken}&email=${encodeURIComponent(user.email)}`;
        sendEmail(
          user.email,
          'PICKS — Your Access Has Been Approved',
          `<h2>Welcome to PICKS!</h2>
           <p>Your access request has been approved with the role: <strong>${approvedRole}</strong>.</p>
           <p>Please click the link below to set your password and activate your account:</p>
           <p><a href="${invLink}" style="background:#1976d2;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px">Set Password & Activate Account</a></p>
           <p>This link expires in 24 hours.</p>`,
        ).catch(console.error);

        // If consultant — send profile reminder
        if (approvedRole === 'consultant') {
          sendEmail(
            user.email,
            'PICKS — Please Update Your Consultant Profile',
            `<h2>Action Required: Consultant Profile</h2>
             <p>After activating your account, please update your consultant profile in the system.</p>`,
          ).catch(console.error);
        }

        res.json({
          message: 'Access approved. Invitation email sent to user.',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Reject role request ─────────────────────────────────────────────────
      case 'reject-role-request': {
        const { userId, adminNotes } = req.body as { userId: number; adminNotes?: string };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const updated = await db.user.update({
          where: { id: userId },
          data: {
            status: STATUS.REJECTED,
            reviewedBy: decoded.id,
            reviewedAt: new Date(),
            adminNotes: adminNotes || null,
          },
        });

        await logChange(db, userId, 'access_rejected', decoded.id, decoded.name, {
          fieldName: 'status',
          previousValue: (user as any).status,
          newValue: STATUS.REJECTED,
          reasonNotes: adminNotes,
        });

        sendEmail(
          user.email,
          'PICKS — Access Request Update',
          `<h2>Access Request Update</h2><p>We regret to inform you that your access request has been rejected.</p>${adminNotes ? `<p>Reason: ${adminNotes}</p>` : ''}`,
        ).catch(console.error);

        res.json({
          message: 'Access request rejected',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Admin creates user (source=admin, status=active, temp password) ─────
      case 'create-user': {
        const body = req.body as Record<string, any>;
        const {
          firstName,
          lastName,
          email,
          password,
          role = 'user',
          phone,
          department,
          workLocation,
          businessUnit,
          employeeId,
          managerName,
          reasonForAccess,
          accessFromDate,
          accessToDate,
          timezone,
          dateFormat,
          timeFormat,
          language,
          slaWorkingCalendar,
          slaExceptionGroup,
        } = body;

        if (!firstName || !lastName || !email) {
          res.status(400).json({ message: 'firstName, lastName, and email are required' });
          return;
        }

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
          res.status(409).json({ message: 'Email already registered' });
          return;
        }

        const tempPw = password || generateTempPw();
        const hashedPw = await bcrypt.hash(tempPw, 10);
        const fullName = `${firstName} ${lastName}`;
        const now = new Date();

        const user = await db.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPw,
            name: fullName,
            role,
            phone: phone || null,
            department: department || null,
            workLocation: workLocation || null,
            businessUnit: businessUnit || null,
            employeeId: employeeId || null,
            managerName: managerName || null,
            reasonForAccess: reasonForAccess || null,
            timezone: timezone || null,
            dateFormat: dateFormat || null,
            timeFormat: timeFormat || null,
            language: language || null,
            slaWorkingCalendar: slaWorkingCalendar || null,
            slaExceptionGroup: slaExceptionGroup || null,
            status: STATUS.ACTIVE,
            source: SOURCE.ADMIN,
            isActive: true,
            mustResetPassword: true,
            firstActivationDate: now,
            accessFromDate: accessFromDate ? new Date(accessFromDate) : null,
            accessToDate: accessToDate ? new Date(accessToDate) : null,
          } as any,
        });

        await logChange(db, user.id, 'access_created', decoded.id, decoded.name, {
          fieldName: 'source',
          newValue: SOURCE.ADMIN,
          reasonNotes: `Admin created user directly. Role: ${role}`,
        });

        // Send welcome email with temp password
        sendEmail(
          email,
          'PICKS — Your Account Has Been Created',
          `<h2>Welcome to PICKS!</h2>
           <p>Your account has been created by an administrator.</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Temporary Password:</strong> <code style="font-size:1.2em">${tempPw}</code></p>
           <p>Please sign in and change your password immediately.</p>
           <p><a href="${APP_URL}/signin" style="background:#1976d2;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px">Sign In</a></p>`,
        ).catch(console.error);

        res.status(201).json({
          message: 'User created successfully. Credentials emailed to user.',
          data: sanitizeUser(user as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Create pending user from ticket creation ────────────────────────────
      case 'create-pending-user': {
        const body = req.body as Record<string, any>;
        const { firstName, lastName, email, phone, department, workLocation } = body;
        if (!firstName || !lastName || !email) {
          res.status(400).json({ message: 'firstName, lastName, and email are required' });
          return;
        }

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
          res.json({
            message: 'User already exists',
            data: sanitizeUser(existing as unknown as Record<string, unknown>),
          });
          return;
        }

        const tempPw = generateTempPw();
        const hashed = await bcrypt.hash(tempPw, 10);
        const user = await db.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashed,
            name: `${firstName} ${lastName}`,
            role: 'user',
            requestedRole: 'user',
            phone: phone || null,
            department: department || null,
            workLocation: workLocation || null,
            status: STATUS.PENDING_APPROVAL,
            source: SOURCE.TICKET,
            isActive: false,
          } as any,
        });

        res.status(201).json({
          message: 'Pending user created from ticket',
          data: sanitizeUser(user as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Update user ─────────────────────────────────────────────────────────
      case 'update-user': {
        const {
          userId,
          data: updateData,
          reasonCode,
          reasonNotes,
        } = req.body as {
          userId: number;
          data: Record<string, unknown>;
          reasonCode?: string;
          reasonNotes?: string;
        };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        if (!updateData || typeof updateData !== 'object') {
          res.status(400).json({ message: 'data object is required' });
          return;
        }

        const existingUser = await db.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const allowedFields = [
          'firstName',
          'lastName',
          'name',
          'phone',
          'role',
          'isActive',
          'workLocation',
          'department',
          'employeeId',
          'businessUnit',
          'managerName',
          'dateOfBirth',
          'profilePicture',
          'adminNotes',
          'application',
          'slaWorkingCalendar',
          'slaExceptionGroup',
          'applicationLead',
          'accessFromDate',
          'accessToDate',
          'timezone',
          'dateFormat',
          'timeFormat',
          'language',
          'reasonForAccess',
          'mustResetPassword',
          'consultantProfileUpdated',
        ];

        const sanitizedUpdate: Record<string, unknown> = {};
        for (const key of allowedFields) {
          if (key in updateData) sanitizedUpdate[key] = updateData[key];
        }

        // Auto-build full name if first/last changed
        if ('firstName' in sanitizedUpdate || 'lastName' in sanitizedUpdate) {
          const fn = (sanitizedUpdate.firstName as string) || existingUser.firstName;
          const ln = (sanitizedUpdate.lastName as string) || existingUser.lastName;
          sanitizedUpdate.name = `${fn} ${ln}`;
        }

        // Log auditable field changes; pass reasonCode + reasonNotes for role changes
        const auditFields = [
          'role',
          'department',
          'workLocation',
          'isActive',
          'timezone',
          'language',
        ];
        for (const field of auditFields) {
          if (field in sanitizedUpdate && sanitizedUpdate[field] !== (existingUser as any)[field]) {
            await logChange(
              db,
              userId,
              field === 'role' ? 'role_change' : 'field_update',
              decoded.id,
              decoded.name,
              {
                fieldName: field,
                previousValue: String((existingUser as any)[field] ?? ''),
                newValue: String(sanitizedUpdate[field] ?? ''),
                ...(field === 'role'
                  ? { reasonCode: reasonCode ?? undefined, reasonNotes: reasonNotes ?? undefined }
                  : {}),
              },
            );
          }
        }

        const updated = await db.user.update({ where: { id: userId }, data: sanitizedUpdate });
        res.json({
          message: 'User updated successfully',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Activate user (manual) ───────────────────────────────────────────────
      case 'activate-user': {
        const { userId, adminNotes } = req.body as { userId: number; adminNotes?: string };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const now = new Date();
        const updated = await db.user.update({
          where: { id: userId },
          data: {
            isActive: true,
            status: STATUS.ACTIVE,
            firstActivationDate: (user as any).firstActivationDate ?? now,
          } as any,
        });

        await logChange(db, userId, 'activation', decoded.id, decoded.name, {
          fieldName: 'status',
          previousValue: (user as any).status,
          newValue: STATUS.ACTIVE,
          reasonNotes: adminNotes,
        });

        res.json({
          message: 'User activated',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Deactivate user (manual override) ────────────────────────────────────
      case 'deactivate-user': {
        const { userId, adminNotes } = req.body as { userId: number; adminNotes?: string };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        const updated = await db.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            status: STATUS.DEACTIVATED,
            lastDeactivationDate: new Date(),
          } as any,
        });

        await logChange(db, userId, 'deactivation', decoded.id, decoded.name, {
          fieldName: 'status',
          previousValue: (user as any).status,
          newValue: STATUS.DEACTIVATED,
          reasonNotes: adminNotes,
        });

        res.json({
          message: 'User deactivated',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Generate temporary password ──────────────────────────────────────────
      case 'generate-temp-password': {
        const { userIds } = req.body as { userIds: number[] };
        if (!userIds?.length) {
          res.status(400).json({ message: 'userIds array is required' });
          return;
        }

        const results: { userId: number; success: boolean }[] = [];
        for (const uid of userIds) {
          const user = await db.user.findUnique({ where: { id: uid } });
          if (!user) {
            results.push({ userId: uid, success: false });
            continue;
          }

          const tempPw = generateTempPw();
          const hashed = await bcrypt.hash(tempPw, 10);
          await db.user.update({
            where: { id: uid },
            data: { password: hashed, mustResetPassword: true, passwordChangedAt: new Date() },
          });

          await logChange(db, uid, 'password_reset', decoded.id, decoded.name, {
            reasonNotes: 'Temporary password generated by admin',
          });

          sendEmail(
            user.email,
            'PICKS — Your Temporary Password',
            `<h2>Temporary Password</h2>
             <p>An administrator has generated a temporary password for your account.</p>
             <p><strong>Temporary Password:</strong> <code style="font-size:1.2em">${tempPw}</code></p>
             <p>Please sign in and change your password immediately.</p>`,
          ).catch(console.error);

          results.push({ userId: uid, success: true });
        }

        res.json({
          message: `Temporary password sent to ${results.filter((r) => r.success).length} user(s)`,
          data: results,
        });
        break;
      }

      // ── Reset user password (admin sets new password directly) ──────────────
      case 'reset-user-password': {
        const { userId, newPassword } = req.body as { userId: number; newPassword: string };
        if (!userId || !newPassword) {
          res.status(400).json({ message: 'userId and newPassword are required' });
          return;
        }
        if (newPassword.length < 6) {
          res.status(400).json({ message: 'Password must be at least 6 characters' });
          return;
        }

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        await db.user.update({
          where: { id: userId },
          data: {
            password: await bcrypt.hash(newPassword, 10),
            mustResetPassword: true,
            passwordChangedAt: new Date(),
          },
        });

        await logChange(db, userId, 'password_reset', decoded.id, decoded.name, {
          reasonNotes: 'Password reset by admin',
        });

        sendEmail(
          user.email,
          'PICKS — Password Reset',
          `<h2>Password Reset</h2><p>Your password has been reset by an administrator. Please sign in with your new credentials and change your password immediately.</p>`,
        ).catch(console.error);

        res.json({ message: 'Password reset successfully' });
        break;
      }

      // ── Get change log ───────────────────────────────────────────────────────
      case 'get-change-log': {
        const { userId } = req.body as { userId: number };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const logs = await (db as any).userChangeLog.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        res.json({ message: 'Change log retrieved', data: logs });
        break;
      }

      // ── Unlock user ──────────────────────────────────────────────────────────
      case 'unlock-user': {
        const { userId } = req.body as { userId: number };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        const updated = await db.user.update({
          where: { id: userId },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        res.json({
          message: 'Account unlocked',
          data: sanitizeUser(updated as unknown as Record<string, unknown>),
        });
        break;
      }

      // ── Delete user ──────────────────────────────────────────────────────────
      case 'delete-user': {
        const { userId } = req.body as { userId: number };
        if (!userId) {
          res.status(400).json({ message: 'userId is required' });
          return;
        }
        const existing = await db.user.findUnique({ where: { id: userId } });
        if (!existing) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        await db.user.delete({ where: { id: userId } });
        res.json({ message: 'User deleted successfully' });
        break;
      }

      // ── Get login logs ───────────────────────────────────────────────────────
      case 'get-login-logs': {
        const { userId } = req.body as { userId?: number };
        const logs = await (db as any).loginLog.findMany({
          where: userId ? { userId } : undefined,
          orderBy: { loginTime: 'desc' },
          take: 100,
        });
        res.json({ message: 'Login logs retrieved', data: logs });
        break;
      }

      // ── Consultant Profiles ─────────────────────────────────────────────────
      case 'get-consultant-profiles': {
        const profiles = await (db as any).consultantProfile.findMany({
          orderBy: { createdAt: 'desc' },
        });
        res.json({ message: 'Consultant profiles retrieved', data: profiles });
        break;
      }

      case 'create-consultant-profile': {
        const { data: profileData } = req.body as { data: Record<string, any> };
        if (!profileData?.userId || !profileData?.application) {
          res.status(400).json({ message: 'userId and application are required' });
          return;
        }
        const profile = await (db as any).consultantProfile.create({ data: profileData });
        // Mark consultant profile as updated
        await db.user.update({
          where: { id: profileData.userId },
          data: { consultantProfileUpdated: true },
        });
        res.status(201).json({ message: 'Consultant profile created', data: profile });
        break;
      }

      case 'update-consultant-profile': {
        const { profileId, data: profileData } = req.body as {
          profileId: number;
          data: Record<string, any>;
        };
        if (!profileId) {
          res.status(400).json({ message: 'profileId is required' });
          return;
        }
        const profile = await (db as any).consultantProfile.update({
          where: { id: profileId },
          data: profileData,
        });
        if (profileData.userId)
          await db.user.update({
            where: { id: profileData.userId },
            data: { consultantProfileUpdated: true },
          });
        res.json({ message: 'Consultant profile updated', data: profile });
        break;
      }

      // ── Consultant Roles ────────────────────────────────────────────────────
      case 'get-consultant-roles': {
        const roles = await (db as any).consultantRole.findMany({
          orderBy: { application: 'asc' },
        });
        res.json({ message: 'Consultant roles retrieved', data: roles });
        break;
      }

      case 'create-consultant-role': {
        const { data: roleData } = req.body as { data: Record<string, any> };
        if (!roleData?.application || !roleData?.roleName) {
          res.status(400).json({ message: 'application and roleName are required' });
          return;
        }
        const role = await (db as any).consultantRole.create({ data: roleData });
        res.status(201).json({ message: 'Consultant role created', data: role });
        break;
      }

      case 'update-consultant-role': {
        const { roleId, data: roleData } = req.body as {
          roleId: number;
          data: Record<string, any>;
        };
        if (!roleId) {
          res.status(400).json({ message: 'roleId is required' });
          return;
        }
        const role = await (db as any).consultantRole.update({
          where: { id: roleId },
          data: roleData,
        });
        res.json({ message: 'Consultant role updated', data: role });
        break;
      }

      case 'delete-consultant-role': {
        const { roleId } = req.body as { roleId: number };
        if (!roleId) {
          res.status(400).json({ message: 'roleId is required' });
          return;
        }
        await (db as any).consultantRole.delete({ where: { id: roleId } });
        res.json({ message: 'Consultant role deleted' });
        break;
      }

      default:
        res.status(400).json({ message: `Unknown admin action: ${action}` });
    }
  };
}
