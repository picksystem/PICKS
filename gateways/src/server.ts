// Force IPv4 DNS resolution — must be set before any network connections
// Render free tier does not support outbound IPv6; Node 18+ defaults to IPv6-first
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Load env.gateway.json values into process.env (without overwriting existing vars)
import path from 'path';
import fs from 'fs';

const envGatewayPath = path.resolve(__dirname, '../../env/src/env.gateway.json');
try {
  const envGatewayContent = fs.readFileSync(envGatewayPath, 'utf-8');
  const envGatewayVars = JSON.parse(envGatewayContent);
  for (const [key, value] of Object.entries(envGatewayVars)) {
    if (!process.env[key] && value !== '' && value !== null && value !== undefined) {
      process.env[key] = String(value);
    }
  }
} catch {
  // env.gateway.json not found or invalid — rely on .env / system env vars
}

// Custom Winston logger
import { logger } from '@serviceops/config';

// Express app factory
import { createApp } from './app';

// Prisma client for database access
import { prisma, pruneExpiredSessions } from '@serviceops/database';

// Build dynamic ticket router from Configuration API
import { createTicketRouter } from '../api/admin/Ticket/Ticket.routes';
import { CleanupExpiredDraftsUseCase, AdminTicketGateway, getCacheGateway } from '@serviceops/core';

const ticketGateway = new AdminTicketGateway(prisma as any);

// Server configuration
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * --------------------------------
 * Database Connection Check
 * --------------------------------
 * Ensures database is reachable
 * before starting the server.
 *
 * The Supabase session pooler caps total simultaneous clients at `pool_size`
 * (default 15) — and every process sharing that pooler user counts against
 * it (old Render instance during a deploy, a local dev box, retry storms).
 * A transient "max clients reached" blip must not kill the deploy, so the
 * first check retries with backoff instead of exiting immediately.
 */
const DB_CONNECT_ATTEMPTS = parseInt(process.env.DB_CONNECT_ATTEMPTS || '8', 10);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkDatabaseConnection() {
  for (let attempt = 1; ; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      if (attempt > 1) {
        logger.warn(`Database connection established on retry ${attempt - 1}`);
      } else {
        logger.info('Database connection established');
      }
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const poolerFull =
        message.includes('EMAXCONNSESSION') || message.includes('max clients');

      if (attempt >= DB_CONNECT_ATTEMPTS) {
        logger.error(`Failed to connect to database after ${attempt} attempts:`, error);
        process.exit(1); // Stop app if DB is unavailable
      }

      const delayMs = Math.min(45_000, 5_000 * 2 ** (attempt - 1));
      if (poolerFull) {
        logger.warn(
          `Database: Supabase pooler client limit reached ` +
            `(attempt ${attempt}/${DB_CONNECT_ATTEMPTS}), retrying in ${delayMs / 1000}s. ` +
            'Free slots by stopping idle local dev servers, checking for extra ' +
            'services sharing the same pooler user, or raising Supabase pool_size.',
        );
      } else {
        logger.warn(
          `Database connection failed (attempt ${attempt}/${DB_CONNECT_ATTEMPTS}), ` +
            `retrying in ${delayMs / 1000}s:`,
          error,
        );
      }
      await sleep(delayMs);
    }
  }
}

/**
 * --------------------------------
 * Server Startup
 * --------------------------------
 */
async function startServer() {
  try {
    // Verify database connectivity
    await checkDatabaseConnection();

    // Build the dynamic ticket router from adminTicketType table
    const ticketRouter = await createTicketRouter();

    // Create Express app with ticket router injected
    const app = createApp({ ticketRouter });

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info('='.repeat(60));
      logger.info('Unified ServiceOps Backend API Server Started');
      logger.info('='.repeat(60));
      logger.info(`Server running on: http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info('='.repeat(60));

      // Run expired draft cleanup on startup and every 24 hours
      const cleanupUseCase = new CleanupExpiredDraftsUseCase(ticketGateway);
      const runCleanup = async () => {
        try {
          const count = await cleanupUseCase.execute();
          if (count > 0) {
            logger.info(`Cleaned up ${count} expired draft incident(s)`);
          }
        } catch (error) {
          logger.error('Failed to cleanup expired drafts:', error);
        }
      };
      setTimeout(runCleanup, 10_000); // delay initial run until pool is warmed up
      setInterval(runCleanup, 24 * 60 * 60 * 1000);

      // Periodically prune expired server-side sessions (UserSession table) and
      // expired PostgreSQL cache entries (CacheEntry table). PostgreSQL backs
      // both the session store and the cache, so a single sweep covers both.
      const runSessionAndCachePrune = async () => {
        try {
          await pruneExpiredSessions();
          await getCacheGateway().pruneExpired();
        } catch (error) {
          logger.warn('Session/cache prune failed (will retry on next cycle):', error);
        }
      };
      setTimeout(runSessionAndCachePrune, 30_000);
      // Hourly sweep is plenty for a cache whose entries are invalidated on
      // write and self-expire; the prune just reclaims the storage.
      setInterval(runSessionAndCachePrune, 60 * 60 * 1000);
    });

    /**
     * --------------------------------
     * Graceful Shutdown Handler
     * --------------------------------
     * Ensures server and DB close cleanly
     */
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: initiating graceful shutdown`);

      // Stop accepting new HTTP requests
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close Prisma DB connection
          await prisma.$disconnect();
          logger.info('Database connection closed');
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle OS-level shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Catch uncaught synchronous errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Catch unhandled promise rejections — only shut down for truly fatal errors.
    // Transient database connection errors (e.g. Supabase pooler closing idle
    // connections) are recoverable; the Prisma client will re-establish the pool
    // on the next query. Shutting down for these brings the whole service down
    // unnecessarily.
    const fatalErrorPatterns = [
      /ENOENT/i, // missing file / directory
      /EACCES/i, // permission denied
      /EADDRINUSE/i, // port already in use
      /listen EADDRINUSE/i,
    ];
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      const message =
        typeof reason === 'string'
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason);

      const isFatal = fatalErrorPatterns.some((p) => p.test(message));

      if (!isFatal) {
        // Likely a transient DB issue — log and continue.
        logger.warn('Non-fatal unhandled rejection (continuing):', message);
        // Reset the Prisma pool so the next query gets fresh connections.
        try {
          const { prisma } = require('@serviceops/database');
          // Force a pool reset on the proxy by nulling the global
          if (prisma && typeof (prisma as any).$disconnect === 'function') {
            void (prisma as any).$disconnect().catch(() => {});
          }
        } catch {
          // ignore – we just want to nudge a pool reset
        }
        return;
      }

      logger.error('Fatal unhandled rejection – shutting down:', reason);
      gracefulShutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Bootstrap the application
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
