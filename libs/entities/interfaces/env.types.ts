// Environment configuration interface
export interface EnvConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;

  // Authentication
  authTokenKey: string;
  refreshTokenKey: string;

  // Application Settings
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';

  // Feature Flags
  enableAnalytics: boolean;
  enableDebugMode: boolean;
  // Pagination
  defaultPageSize: number;
  maxPageSize: number;

  // Session
  sessionTimeout: number;
  idleTimeout: number;

  // File Upload
  maxFileSize: number;
  allowedFileTypes: string;

  // Partner Specific (optional)
  partnerName?: string;
  partnerId?: string;
}
