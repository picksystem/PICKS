import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { counterReducer, userReducer, notificationReducer } from '../slices';
import authReducer from '../store/authStore';
import { baseApi } from '@picks/services';

// Configure the store with all reducers and RTK Query middleware
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer, //  RTK Query API Admin slice
    auth: authReducer, // Auth slice
    counter: counterReducer, // Counter slice
    user: userReducer, // User slice
    notification: notificationReducer, // Notification slice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Optional: enable refetchOnFocus/refetchOnReconnect for queries
setupListeners(store.dispatch);

// Type definitions for TS - Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
