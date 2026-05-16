// Slices index — re-exports all state slice reducers and actions
export * from './notificationSlice';

// Re-export auth store actions (authReducer is in store/)
export { setCredentials, updateUser, logout } from '../store/authStore';

// Re-export UI store actions (uiReducer is in store/)
export { showLoader, hideLoader } from '../store/uiStore';