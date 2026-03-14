import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  data: [];
}

const initialState: AuthState = {
  data: [],
};

const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    dataSuccess: (state, action) => {
      state.data = action.payload.user;
    },
  },
});

export const baseActions = baseSlice.actions;
export default baseSlice.reducer;
