// Automatically catches async errors thrown inside route handlers
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';

// Centralized error handling middleware
import { errorHandler, notFoundHandler } from '@serviceops/middleware';

// Import route modules
import authRoutes from '../api/auth/Auth.routes';
import userRoutes from '../api/user/routes';
import consultantRoutes from '../api/consultant/routes';
import { buildAdminRouter } from '../api/admin/routes';
import { ADMIN_PATHS, USER_PATHS, CONSULTANT_PATHS } from '@serviceops/constants';

type AppDeps = {
  ticketRouter?: express.Router;
};

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

  // Enable CORS
  app.use(cors());

  // Parse incoming JSON requests
  app.use(express.json({ limit: '10mb' }));

  // Serve uploaded files statically
  const uploadsDir = path.join(__dirname, '../../uploads/attachments');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads/attachments', express.static(uploadsDir));
  // Return plain 404 for missing static files (prevent API notFoundHandler JSON response)
  app.use('/uploads', (_req, res) => res.status(404).end());

  // Auth API routes
  app.use('/api/auth', authRoutes);

  // Admin API routes (includes dynamic ticket router)
  const adminRouter = buildAdminRouter(ticketRouter);
  app.use(`/api/${ADMIN_PATHS.ADMIN}`, adminRouter);

  // User API routes
  app.use(`/api/${USER_PATHS.USER}`, userRoutes);

  // Consultant API routes
  app.use(`/api/${CONSULTANT_PATHS.CONSULTANT}`, consultantRoutes);

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
