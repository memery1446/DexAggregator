import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Spinner } from 'react-bootstrap';

const SwapCard = () => {
  const dispatch = useDispatch();
  const [inputToken, setInputToken] = useState('TK1');
  const [outputToken, setOutputToken] = useState('TK2');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const isWalletConnected = useSelector((state) => state.wallet.isConnected);

  const tokens = ['TK1', 'TK2'];
  const balances = {
    TK1: '1000',
    TK2: '2000'
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!isWalletConnected) {
      setAlertInfo({ type: 'warning', message: 'Please connect your wallet first.' });
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
        <form onSubmit={handleSwap}>
          <div className="mb-3">
            <label htmlFor="inputToken" className="form-label">From</label>
            <div className="input-group">
              <select
                className="form-select"
                id="inputToken"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                disabled={isProcessing}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  transition: 'all 0.3s ease',
                  ...(isWalletConnected && {
                    ':hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#ced4da',
                      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
                    }
                  })
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
                disabled={isProcessing}
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: 'none'
                }}
              />
            </div>
            <small className="form-text text-muted">
              Balance: {isWalletConnected ? `${balances[inputToken]} ${inputToken}` : '-- --'}
            </small>
          </div>

          <div className="text-center mb-3">
            <i className="bi bi-arrow-down-up swap-icon" style={{ fontSize: '1.5rem', color: '#7F7D9C' }}></i>
          </div>

          <div className="mb-3">
            <label htmlFor="outputToken" className="form-label">To</label>
            <div className="input-group">
              <select
                className="form-select"
                id="outputToken"
                value={outputToken}
                onChange={(e) => setOutputToken(e.target.value)}
                disabled={isProcessing}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  transition: 'all 0.3s ease',
                  ...(isWalletConnected && {
                    ':hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#ced4da',
                      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
                    }
                  })
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
                disabled={isProcessing}
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: 'none'
                }}
              />
            </div>
            <small className="form-text text-muted">
              Balance: {isWalletConnected ? `${balances[outputToken]} ${outputToken}` : '-- --'}
            </small>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={!isWalletConnected || isProcessing}
            style={{
              background: isWalletConnected ? 'linear-gradient(45deg, #7F7D9C, #9E9CB2)' : '#6c757d',
              border: 'none',
              padding: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              ...(isWalletConnected && {
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }
              })
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
              'Connect Wallet to Swap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwapCard;
