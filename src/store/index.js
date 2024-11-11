import { configureStore } from '@reduxjs/toolkit';
import blockchainReducer from './blockchainSlice';

export const store = configureStore({
  reducer: {
    blockchain: blockchainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['blockchain/connectWallet/fulfilled'],
      },
    }),
});

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => {
    console.log('Current State:', store.getState());
  });
}

export default store;
