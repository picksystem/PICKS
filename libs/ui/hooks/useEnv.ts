import { useMemo } from 'react';
import { EnvConfig } from '../../entities/interfaces/env.types';

/**
 * Helper function to parse boolean environment variables
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Helper function to parse number environment variables
 */
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Custom hook to access environment variables with type safety
 * Provides parsed and validated environment configuration
 *
 * @example
 * const env = useEnv();
 * console.log(env.apiUrl); // Type-safe access
 * console.log(env.enableAnalytics); // Already parsed as boolean
 *
 * @example
 * // Access specific env values
 * const env = useEnv();
 * fetch(env.apiUrl, { timeout: env.apiTimeout });
 */
export function useEnv(): EnvConfig {
  return useMemo(() => {
    const env: EnvConfig = {
      // API Configuration
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      apiTimeout: parseNumber(process.env.REACT_APP_API_TIMEOUT, 30000),

      // Authentication
      authTokenKey: process.env.REACT_APP_AUTH_TOKEN_KEY || 'auth_token',
      refreshTokenKey: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token',

      // Application Settings
      appName: process.env.REACT_APP_NAME || 'ServiceOps',
      appVersion: process.env.REACT_APP_VERSION || '1.0.0',
      environment: (process.env.REACT_APP_ENVIRONMENT as EnvConfig['environment']) || 'development',

      // Feature Flags
      enableAnalytics: parseBoolean(process.env.REACT_APP_ENABLE_ANALYTICS, true),
      enableDebugMode: parseBoolean(process.env.REACT_APP_ENABLE_DEBUG_MODE, true),
      // Pagination
      defaultPageSize: parseNumber(process.env.REACT_APP_DEFAULT_PAGE_SIZE, 10),
      maxPageSize: parseNumber(process.env.REACT_APP_MAX_PAGE_SIZE, 100),

      // Session
      sessionTimeout: parseNumber(process.env.REACT_APP_SESSION_TIMEOUT, 3600000), // 1 hour
      idleTimeout: parseNumber(process.env.REACT_APP_IDLE_TIMEOUT, 1800000), // 30 minutes

      // File Upload
      maxFileSize: parseNumber(process.env.REACT_APP_MAX_FILE_SIZE, 10485760), // 10MB
      allowedFileTypes:
        process.env.REACT_APP_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',

      // Partner Specific (optional)
      partnerName: process.env.REACT_APP_PARTNER_NAME,
      partnerId: process.env.REACT_APP_PARTNER_ID,
    };

    return env;
  }, []);
}

/**
 * Utility function to get environment config without using hook
 * Useful for non-component contexts (utilities, services, etc.)
 *
 * @example
 * import { getEnvConfig } from '@serviceops/hooks';
 * const env = getEnvConfig();
 * console.log(env.apiUrl);
 */
export function getEnvConfig(): EnvConfig {
  return {
    // API Configuration
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    apiTimeout: parseNumber(process.env.REACT_APP_API_TIMEOUT, 30000),

    // Authentication
    authTokenKey: process.env.REACT_APP_AUTH_TOKEN_KEY || 'auth_token',
    refreshTokenKey: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token',

    // Application Settings
    appName: process.env.REACT_APP_NAME || 'ServiceOps',
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    environment: (process.env.REACT_APP_ENVIRONMENT as EnvConfig['environment']) || 'development',

    // Feature Flags
    enableAnalytics: parseBoolean(process.env.REACT_APP_ENABLE_ANALYTICS, true),
    enableDebugMode: parseBoolean(process.env.REACT_APP_ENABLE_DEBUG_MODE, true),
    // Pagination
    defaultPageSize: parseNumber(process.env.REACT_APP_DEFAULT_PAGE_SIZE, 10),
    maxPageSize: parseNumber(process.env.REACT_APP_MAX_PAGE_SIZE, 100),

    // Session
    sessionTimeout: parseNumber(process.env.REACT_APP_SESSION_TIMEOUT, 3600000),
    idleTimeout: parseNumber(process.env.REACT_APP_IDLE_TIMEOUT, 1800000),

    // File Upload
    maxFileSize: parseNumber(process.env.REACT_APP_MAX_FILE_SIZE, 10485760),
    allowedFileTypes:
      process.env.REACT_APP_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',

    // Partner Specific
    partnerName: process.env.REACT_APP_PARTNER_NAME,
    partnerId: process.env.REACT_APP_PARTNER_ID,
  };
}
