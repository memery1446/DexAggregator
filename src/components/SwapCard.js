import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Alert, Spinner } from 'react-bootstrap';
import GasEstimator from './GasEstimator';
import { 
  connectWallet, 
  fetchBalances, 
  getSwapQuote,
  executeSwap,
  clearSwapStatus,
  clearBestQuote 
} from '../store/blockchainSlice';

// Memoized selectors
const selectBlockchainState = (state) => state.blockchain;

const selectIsWalletConnected = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.address !== null
);

const selectBalances = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.balances || {}
);

const selectBestQuote = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.bestQuote
);

const selectSwapStatus = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.swapStatus
);

const selectIsLoading = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.isLoading || false
);

const selectError = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.error || null
);

const SwapCard = () => {
  const dispatch = useDispatch();
  const [inputToken, setInputToken] = useState('TK1');
  const [outputToken, setOutputToken] = useState('TK2');
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
  const [alertInfo, setAlertInfo] = useState(null);

  const isWalletConnected = useSelector(selectIsWalletConnected);
  const balances = useSelector(selectBalances);
  const bestQuote = useSelector(selectBestQuote);
  const swapStatus = useSelector(selectSwapStatus);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const tokens = useMemo(() => ['TK1', 'TK2'], []);

  useEffect(() => {
    if (isWalletConnected) {
      dispatch(fetchBalances());
    }
  }, [isWalletConnected, dispatch]);

  useEffect(() => {
    if (error) {
      setAlertInfo({ type: 'danger', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (swapStatus === 'success') {
      setAlertInfo({ type: 'success', message: 'Swap completed successfully!' });
      setInputAmount('');
      dispatch(clearSwapStatus());
    }
  }, [swapStatus, dispatch]);

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      dispatch(fetchBalances());
      setAlertInfo({ type: 'success', message: 'Wallet connected successfully!' });
    } catch (error) {
      setAlertInfo({ type: 'danger', message: error.message });
    }
  };

  const handleInputChange = async (value) => {
    setInputAmount(value);
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      const isAtoB = inputToken === 'TK1';
      console.log('Requesting quote for:', {
        inputAmount: value,
        isAtoB,
        fromToken: inputToken,
        toToken: outputToken
      });
      dispatch(getSwapQuote({ inputAmount: value, isAtoB }));
    } else {
      dispatch(clearBestQuote());
    }
  };
    const [estimatedGasCost, setEstimatedGasCost] = useState(null);

  const handleGasEstimateComplete = (estimate) => {
    setEstimatedGasCost(estimate);
  };

  const handleTokenSwap = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount('');
    dispatch(clearBestQuote());
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!isWalletConnected) {
      dispatch(connectWallet());
      return;
    }

    if (!bestQuote) {
      setAlertInfo({ type: 'warning', message: 'Please enter an amount to swap' });
      return;
    }

    try {
      const minOutput = parseFloat(bestQuote.expectedOutput) * (1 - slippage / 100);
      const isAtoB = inputToken === 'TK1';
      
      console.log('Executing swap with params:', {
        inputAmount,
        isAtoB,
        minOutput: minOutput.toString(),
        slippage
      });

      await dispatch(executeSwap({
        inputAmount,
        isAtoB,
        minOutput: minOutput.toString()
      })).unwrap();

      setAlertInfo({ type: 'success', message: 'Swap completed successfully!' });
      setInputAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      setAlertInfo({ type: 'danger', message: error.message || 'Swap failed' });
    }
  };

  return (
    <div className="card shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="card-body p-4">
        <h5 className="card-title text-center mb-4">Swap Tokens</h5>
        
        {alertInfo && (
          <Alert 
            variant={alertInfo.type} 
            onClose={() => setAlertInfo(null)} 
            dismissible
          >
            {alertInfo.message}
          </Alert>
        )}

        <form onSubmit={handleSwap}>
          {/* Input Token Section */}
          <div className="mb-3">
            <label htmlFor="inputToken" className="form-label">From</label>
            <div className="input-group">
              <select
                className="form-select"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  setOutputToken(e.target.value === 'TK1' ? 'TK2' : 'TK1');
                  setInputAmount('');
                  dispatch(clearBestQuote());
                }}
                disabled={isLoading}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                min="0"
                step="any"
                required
                disabled={isLoading}
              />
            </div>
            <small className="text-muted">
              Balance: {balances[inputToken] || '0'} {inputToken}
            </small>
          </div>

          {/* Swap Direction Button */}
          <div className="text-center mb-3">
            <button 
              type="button"
              className="btn btn-outline-secondary rounded-circle p-2"
              onClick={handleTokenSwap}
              disabled={isLoading}
            >
              ↑↓
            </button>
          </div>

          {/* Output Token Section */}
          <div className="mb-3">
            <label htmlFor="outputToken" className="form-label">To</label>
            <div className="input-group">
              <select
                className="form-select"
                value={outputToken}
                onChange={(e) => {
                  setOutputToken(e.target.value);
                  setInputToken(e.target.value === 'TK1' ? 'TK2' : 'TK1');
                  setInputAmount('');
                  dispatch(clearBestQuote());
                }}
                disabled={isLoading}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                placeholder="0.0"
                value={bestQuote?.expectedOutput || ''}
                readOnly
                disabled
              />
            </div>
            <small className="text-muted">
              Balance: {balances[outputToken] || '0'} {outputToken}
            </small>
          </div>

          {/* Slippage Setting */}
          <div className="mb-3">
            <label className="form-label">Slippage Tolerance</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                min="0.1"
                max="5"
                step="0.1"
                disabled={isLoading}
              />
              <span className="input-group-text">%</span>
            </div>
            <small className="text-muted">
              Minimum output amount: {bestQuote ? (parseFloat(bestQuote.expectedOutput) * (1 - slippage / 100)).toFixed(6) : '0.0'}
            </small>
          </div>

          {/* Price Impact and Route Info */}
          {bestQuote && (
            <div className="mb-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between mb-2">
                <span>Best Route:</span>
                <span className="font-monospace">{bestQuote.bestAMM.slice(0, 6)}...{bestQuote.bestAMM.slice(-4)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Rate:</span>
                <span>
                  1 {inputToken} ≈ {(bestQuote.expectedOutput / bestQuote.inputAmount).toFixed(6)} {outputToken}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isLoading || !inputAmount || !bestQuote}
            style={{
              background: isWalletConnected ? 'linear-gradient(45deg, #e3b778, #7F7D9C)' : '#6c757d',
              border: 'none',
              padding: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {swapStatus === 'pending' ? 'Swapping...' : 'Loading...'}
              </>
            ) : !isWalletConnected ? (
              'Connect Wallet'
            ) : !inputAmount || !bestQuote ? (
              'Enter an amount'
            ) : (
              'Swap'
            )}
          </button>
            <GasEstimator />
          {/* Warning for insufficient balance */}
          {inputAmount && balances[inputToken] && 
           parseFloat(inputAmount) > parseFloat(balances[inputToken]) && (
            <div className="mt-2 text-danger">
              Insufficient {inputToken} balance
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SwapCard;