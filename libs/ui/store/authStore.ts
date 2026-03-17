import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthUser } from '@picks/interfaces';

export interface AuthState {
  user: IAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('picks_token');
    const userStr = localStorage.getItem('picks_user');
    if (token && userStr) {
      const user = JSON.parse(userStr) as IAuthUser;
      return { user, token, isAuthenticated: true };
    }
  } catch {
    // ignore parse errors
  }
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
      localStorage.setItem('picks_token', action.payload.token);
      localStorage.setItem('picks_user', JSON.stringify(action.payload.user));
    },
    updateUser(state, action: PayloadAction<Partial<IAuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('picks_user', JSON.stringify(state.user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('picks_token');
      localStorage.removeItem('picks_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
