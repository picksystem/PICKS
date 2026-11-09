// Automatically catches async errors thrown inside route handlers
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Centralized error handling + auth middleware
import { errorHandler, notFoundHandler, requireAuth, PgSessionStore } from '@serviceops/middleware';
import { pool } from '@serviceops/database';

// Import route modules
import authRoutes from '../api/auth/Auth.routes';
import userRoutes from '../api/user/routes';
import consultantRoutes from '../api/consultant/routes';
import { buildAdminRouter } from '../api/admin/routes';
import { ADMIN_PATHS, USER_PATHS, CONSULTANT_PATHS } from '@serviceops/constants';

type AppDeps = {
  ticketRouter?: express.Router;
};

// ─── Session configuration ───────────────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'serivceops-session-secret-key';
// Session lifetime (days) for the "stay signed in" cookie.
const SESSION_TTL_DAYS = parseInt(process.env.SESSION_TTL_DAYS || '7', 10);
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

function parseCorsOrigins(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Creates and configures the Express application.
 *
 * @param deps - Optional runtime dependencies resolved after DB startup.
 * @param deps.ticketRouter - Dynamically-built ticket router from adminTicketType table.
 */
export function createApp({ ticketRouter }: AppDeps = {}): express.Application {
  const app = express();

  // Gzip compress all responses — reduces payload size by 60-80%
  app.use(compression());

  // Enable CORS — allow credentials (cookie session) from configured origins
  app.use(
    cors({
      origin: parseCorsOrigins(process.env.CORS_ORIGIN) ?? true,
      credentials: true,
    }),
  );

  // Parse incoming JSON requests
  app.use(express.json({ limit: '10mb' }));

  // Parse cookies (needed to read the session cookie)
  app.use(cookieParser());

  // Server-side sessions persisted in PostgreSQL (UserSession table)
  app.use(
    session({
      name: 'serviceops.sid',
      secret: SESSION_SECRET,
      store: new PgSessionStore(pool, SESSION_TTL_MS),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // Cross-site cookie: requires secure (HTTPS) in production.
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
        maxAge: SESSION_TTL_MS,
      },
    }),
  );

  // Serve uploaded files statically
  const uploadsDir = path.join(__dirname, '../../uploads/attachments');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads/attachments', express.static(uploadsDir));
  // Return plain 404 for missing static files (prevent API notFoundHandler JSON response)
  app.use('/uploads', (_req, res) => res.status(404).end());

  // Auth API routes (public actions: signin/signup/forgot/verify/reset;
  // session-protected actions: get-session/logout/authenticated profile actions)
  app.use('/api/auth', authRoutes);

  // Admin API routes (includes dynamic ticket router).
  //
  // The whole /api/admin namespace requires an authenticated session. The
  // admin-*management* sub-routers (controls / configuration / ticket-type /
  // custom-field) additionally require the admin role — that guard is applied
  // inside each of those route files, NOT here, because the ticket
  // sub-router (/api/admin/tickets) is used by every role to create and manage
  // tickets and must stay accessible to any authenticated user.
  const adminRouter = buildAdminRouter(ticketRouter);
  app.use(`/api/${ADMIN_PATHS.ADMIN}`, requireAuth, adminRouter);

  // User API routes — session only
  app.use(`/api/${USER_PATHS.USER}`, requireAuth, userRoutes);

  // Consultant API routes — session only
  app.use(`/api/${CONSULTANT_PATHS.CONSULTANT}`, requireAuth, consultantRoutes);

  // Health Check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  // Handles unknown routes (404 errors)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
