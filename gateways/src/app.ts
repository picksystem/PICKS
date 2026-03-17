// Automatically catches async errors thrown inside route handlers
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Centralized error handling middleware
import { errorHandler, notFoundHandler } from '@picks/middleware';

// Import route modules
import authRoutes from '../api/auth/Auth.routes';
import adminRoutes from '../api/admin/routes';
import userRoutes from '../api/user/routes';
import consultantRoutes from '../api/consultant/routes';

// Constants for route paths
import { ADMIN_PATHS, USER_PATHS, CONSULTANT_PATHS } from '@picks/constants';

const app = express();

/**
 * -------------------------
 * Global Middleware
 * -------------------------
 */

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

/**
 * -------------------------
 * API Routes
 * -------------------------
 */

// Auth API routes
app.use('/api/auth', authRoutes);

// Admin API routes
app.use(`/api/${ADMIN_PATHS.ADMIN}`, adminRoutes);

// User API routes
app.use(`/api/${USER_PATHS.USER}`, userRoutes);

// Consultant API routes
app.use(`/api/${CONSULTANT_PATHS.CONSULTANT}`, consultantRoutes);

/**
 * -------------------------
 * Health Check
 * -------------------------
 */

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/**
 * -------------------------
 * Error Handling
 * -------------------------
 */

// Handles unknown routes (404 errors)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
