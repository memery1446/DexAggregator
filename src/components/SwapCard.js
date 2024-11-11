import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Alert, Spinner } from 'react-bootstrap';
import { connectWallet, fetchBalances } from '../store/blockchainSlice';
import TokenBalance from './TokenBalance';

// Memoized selectors
const selectBlockchainState = (state) => state.blockchain;

const selectIsWalletConnected = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.address !== null
);

const selectAddress = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.address
);

const selectBalances = createSelector(
  [selectBlockchainState],
  (blockchain) => blockchain?.balances || {}
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
  const [outputAmount, setOutputAmount] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isWalletConnected = useSelector(selectIsWalletConnected);
  const address = useSelector(selectAddress);
  const balances = useSelector(selectBalances);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const tokens = useMemo(() => ['TK1', 'TK2'], []);

  useEffect(() => {
    dispatch(connectWallet());
  }, [dispatch]);

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

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      setAlertInfo({ type: 'success', message: 'Wallet connected successfully!' });
    } catch (error) {
      setAlertInfo({ type: 'danger', message: error.message });
    }
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!isWalletConnected) {
      await handleConnectWallet();
      return;
    }
    setIsProcessing(true);
    setAlertInfo(null);

    try {
      // Simulating a transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulating a successful transaction
      setAlertInfo({ type: 'success', message: 'Swap completed successfully!' });
      setInputAmount('');
      setOutputAmount('');
      dispatch(fetchBalances()); // Fetch updated balances after swap
    } catch (error) {
      setAlertInfo({ type: 'danger', message: 'Transaction failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card shadow-lg" style={{ 
      borderRadius: '1rem', 
      overflow: 'hidden', 
      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
    }}>
      <div className="card-body p-4">
        <h5 className="card-title text-center mb-4">Swap Tokens</h5>
        {alertInfo && (
          <Alert variant={alertInfo.type} onClose={() => setAlertInfo(null)} dismissible>
            {alertInfo.message}
          </Alert>
        )}
        {isWalletConnected && <TokenBalance />}
        <form onSubmit={handleSwap}>
          <div className="mb-3">
            <label htmlFor="inputToken" className="form-label">From</label>
            <div className="input-group">
              <select
                className="form-select"
                id="inputToken"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                disabled={isLoading}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  transition: 'all 0.3s ease',
                }}
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
                onChange={(e) => setInputAmount(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: 'none'
                }}
              />
            </div>
            <small className="form-text text-muted">
              Balance: {isWalletConnected && balances[inputToken] ? `${balances[inputToken]} ${inputToken}` : '-- --'}
            </small>
          </div>

          <div className="text-center mb-3">
            <i 
              className="bi bi-arrow-down-up swap-icon" 
              style={{ fontSize: '1.5rem', color: '#7F7D9C' }}
            ></i>
          </div>

          <div className="mb-3">
            <label htmlFor="outputToken" className="form-label">To</label>
            <div className="input-group">
              <select
                className="form-select"
                id="outputToken"
                value={outputToken}
                onChange={(e) => setOutputToken(e.target.value)}
                disabled={isLoading}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                placeholder="0.0"
                value={outputAmount}
                onChange={(e) => setOutputAmount(e.target.value)}
                readOnly
                disabled={isLoading}
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: 'none'
                }}
              />
            </div>
            <small className="form-text text-muted">
              Balance: {isWalletConnected && balances[outputToken] ? `${balances[outputToken]} ${outputToken}` : '-- --'}
            </small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isLoading}
            style={{
              background: isWalletConnected ? 'linear-gradient(45deg, #e3b778, #7F7D9C)' : '#6c757d',
              border: 'none',
              padding: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : isWalletConnected ? (
              'Swap'
            ) : (
              'Connect Wallet'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwapCard;