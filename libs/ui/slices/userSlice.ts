import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  product: [];
}

const initialState: AuthState = {
  product: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    dataSuccess: (state, action) => {
      state.product = action.payload.user;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
