import { configureStore } from '@reduxjs/toolkit';
import blockchainReducer from './blockchainSlice';
import walletReducer from './walletSlice';

export const store = configureStore({
  reducer: {
    blockchain: blockchainReducer,
    wallet: walletReducer,
  },
});