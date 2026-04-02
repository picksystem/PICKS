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

// Import Express app instance
import app from './app';

// Custom Winston logger
import { logger } from '@serviceops/config';

// Prisma client for database access
import { prisma } from '@serviceops/database';

// Draft cleanup
import { CleanupExpiredDraftsUseCase } from '@serviceops/core/use-cases';
import { incidentGateway } from '../api/admin/Incident/Incident.routes';

// Server configuration
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * --------------------------------
 * Database Connection Check
 * --------------------------------
 * Ensures database is reachable
 * before starting the server
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1); // Stop app if DB is unavailable
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

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Unified SerivceOps Backend API Server Started`);
      logger.info('='.repeat(60));
      logger.info(`📍 Server running on: http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
      logger.info('='.repeat(60));

      // Run expired draft cleanup on startup and every 24 hours
      const cleanupUseCase = new CleanupExpiredDraftsUseCase(incidentGateway);
      const runCleanup = async () => {
        try {
          const count = await cleanupUseCase.execute();
          if (count > 0) {
            logger.info(`🗑️ Cleaned up ${count} expired draft incident(s)`);
          }
        } catch (error) {
          logger.error('Failed to cleanup expired drafts:', error);
        }
      };
      setTimeout(runCleanup, 10_000); // delay initial run until pool is warmed up
      setInterval(runCleanup, 24 * 60 * 60 * 1000);
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
          logger.info('✅ Graceful shutdown completed');
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

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
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
