import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: [];
}

const initialState: AuthState = {
  user: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    dataSuccess: (state, action) => {
      state.user = action.payload.user;
    },
  },
});

export const adminActions = adminSlice.actions;
export default adminSlice.reducer;
