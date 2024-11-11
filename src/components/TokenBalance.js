import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBalances } from '../store/blockchainSlice';

const TokenBalance = () => {
  const dispatch = useDispatch();
  const { balances, isLoading } = useSelector((state) => ({
    balances: state.blockchain?.balances || {},
    isLoading: state.blockchain?.isLoading || false
  }));

  return (
    <div className="p-4 bg-light rounded-lg mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-lg font-semibold mb-0">Token Balances</h3>
        <button 
          onClick={() => dispatch(fetchBalances())}
          className="btn btn-sm btn-outline-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <div className="border-top pt-3">
        <div className="d-flex justify-content-between mb-2">
          <span>TK1:</span>
          <span className="font-monospace">
            {Number(balances.TK1 || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })}
          </span>
        </div>
        <div className="d-flex justify-content-between">
          <span>TK2:</span>
          <span className="font-monospace">
            {Number(balances.TK2 || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;
