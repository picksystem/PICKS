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
import { pool, sessionCookieSettings } from '@serviceops/database';

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

  // Deployments terminate TLS at a proxy (Render, Vercel, nginx). Trust the
  // immediate proxy hop so req.secure reflects the original scheme — that's
  // what drives the session cookie's Secure/SameSite flags (see
  // sessionCookieSettings in @serviceops/database).
  app.set('trust proxy', 1);

  // Cookie sessions rely on CORS + credentials being configured correctly.
  // A missing/empty CORS_ORIGIN means any cross-origin frontend will be
  // blocked by the browser — warn loudly at boot so it isn't a silent 401.
  if (!process.env.CORS_ORIGIN?.trim()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[startup] CORS_ORIGIN is not set — cross-origin browsers will be blocked ' +
        'from sending the session cookie. Set e.g. ' +
        'CORS_ORIGIN=https://app.serviceops.tech,https://api.serviceops.tech',
    );
  }

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

  // Server-side sessions persisted in PostgreSQL (UserSession table).
  //
  // Cookie flags follow the ACTUAL connection scheme (req.secure), NOT the
  // NODE_ENV label:
  //  - plain http  -> SameSite=Lax, not secure   (works for same-site dev)
  //  - https       -> SameSite=None + Secure     (required for cross-site)
  // `proxy: true` makes req.secure honor X-Forwarded-Proto behind a
  // TLS-terminating reverse proxy (Render/Vercel/nginx).
  // A secure cookie set over plain http is silently dropped by the browser,
  // which is exactly why tying this to NODE_ENV=production broke local dev.
  app.use(
    session({
      name: 'serviceops.sid',
      secret: SESSION_SECRET,
      store: new PgSessionStore(pool, SESSION_TTL_MS),
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: (req) => {
        const { secure, sameSite } = sessionCookieSettings(req);
        return {
          httpOnly: true,
          secure,
          sameSite,
          maxAge: SESSION_TTL_MS,
        };
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
