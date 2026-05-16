/**
 * @serviceops/services
 *
 * Unified export for all services:
 * - State management (slices, store, auth)
 * - API services (RTK Query endpoints)
 */

// ── State Management ──────────────────────────────────────────────────────────
export * from './store';
export type { RootState, AppDispatch } from './store';

// ── State Slices ─────────────────────────────────────────────────────────────
export * from './slices';
export {
  showNotification,
  hideNotification,
  showLoader,
  hideLoader,
  setCredentials,
  updateUser,
  logout,
} from './slices';

// ── API Services (RTK Query) ──────────────────────────────────────────────────
export * from './api';
export { baseApi } from './api';

// Re-export common RTK Query types for convenience
export type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
