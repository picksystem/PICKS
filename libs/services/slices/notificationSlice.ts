import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration: number;
}

const initialState: NotificationState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 2000,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        severity: NotificationSeverity;
        autoHideDuration?: number;
      }>,
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
      state.autoHideDuration = action.payload.autoHideDuration ?? 2000;
    },
    hideNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
