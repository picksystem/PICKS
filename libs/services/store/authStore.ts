import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthUser } from '@serviceops/interfaces';

/**
 * Auth state lives in Redux only. The server-side session (an httpOnly cookie)
 * is the source of truth for "am I logged in"; nothing auth-related is stored
 * in localStorage/sessionStorage. On boot the UI re-validates the session with
 * a `get-session` call and sets `hydrated: true` so the router can render.
 */
export interface AuthState {
  user: IAuthUser | null;
  isAuthenticated: boolean;
  /** true once the initial `get-session` check has completed. */
  hydrated: boolean;
  mustResetPassword: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  hydrated: false,
  mustResetPassword: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: IAuthUser; mustResetPassword?: boolean }>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.mustResetPassword = action.payload.mustResetPassword === true;
      state.hydrated = true;
    },
    updateUser(state, action: PayloadAction<Partial<IAuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    markHydrated(state) {
      state.hydrated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.mustResetPassword = false;
    },
  },
});

export const { setCredentials, updateUser, markHydrated, logout } = authSlice.actions;
export default authSlice.reducer;
