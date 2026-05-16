import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthUser } from '@serviceops/interfaces';

export interface AuthState {
  user: IAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('serviceops_token');
    const userStr = localStorage.getItem('serviceops_user');
    if (token && userStr && !isTokenExpired(token)) {
      const user = JSON.parse(userStr) as IAuthUser;
      return { user, token, isAuthenticated: true };
    }
  } catch {
    // ignore parse errors
  }
  // Clear stale/expired credentials
  localStorage.removeItem('serviceops_token');
  localStorage.removeItem('serviceops_user');
  return { user: null, token: null, isAuthenticated: false };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: IAuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('serviceops_token', action.payload.token);
      localStorage.setItem('serviceops_user', JSON.stringify(action.payload.user));
    },
    updateUser(state, action: PayloadAction<Partial<IAuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('serviceops_user', JSON.stringify(state.user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('serviceops_token');
      localStorage.removeItem('serviceops_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
