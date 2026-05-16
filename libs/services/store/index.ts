// Store index — re-exports all store reducers and creates the Redux store
export { default as authReducer, setCredentials, updateUser, logout } from './authStore';
export { default as uiReducer, showLoader, hideLoader } from './uiStore';

export { store, type RootState, type AppDispatch } from './configureStore';
