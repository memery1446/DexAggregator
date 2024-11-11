import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

const selectBalances = createSelector(
  (state) => state.blockchain?.balances,
  (balances) => balances || {}
);

const TokenBalance = () => {
  const balances = useSelector(selectBalances);

  return (
    <div className="p-4 bg-light rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Token Balances</h3>
      <p className="mb-1">TK1: {balances.TK1 || '0'}</p>
      <p>TK2: {balances.TK2 || '0'}</p>
    </div>
  );
};

export default TokenBalance;