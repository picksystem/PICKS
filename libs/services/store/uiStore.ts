import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  loaderVisible: boolean;
  loaderMessage: string;
}

const initialState: UIState = {
  loaderVisible: false,
  loaderMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showLoader(state, action: PayloadAction<string>) {
      state.loaderVisible = true;
      state.loaderMessage = action.payload;
    },
    hideLoader(state) {
      state.loaderVisible = false;
      state.loaderMessage = '';
    },
  },
});

export const { showLoader, hideLoader } = uiSlice.actions;
export default uiSlice.reducer;
