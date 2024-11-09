import { configureStore, createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isLoading: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  }
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    isConnected: false,
  },
  reducers: {
    setWalletConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  }
});

export const { setLoading } = appSlice.actions;
export const { setWalletConnected } = walletSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    wallet: walletSlice.reducer,
  },
});
