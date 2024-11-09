import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWalletConnected } from '../store';

const SwapCard = () => {
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.wallet.isConnected);
  const [inputToken, setInputToken] = useState('TK1');
  const [outputToken, setOutputToken] = useState('TK2');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');

  const tokens = ['TK1', 'TK2'];
  const balances = {
    TK1: '1000',
    TK2: '2000'
  };

  const handleSwap = (e) => {
    e.preventDefault();
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Implement swap logic here
    console.log('Swap initiated', { inputToken, outputToken, inputAmount, outputAmount });
  };

  const handleInputChange = (e) => {
    setInputAmount(e.target.value);
    // In a real application, you would calculate the output amount based on some exchange rate
    setOutputAmount(e.target.value); // This is just a placeholder
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-3">Swap Tokens</h5>
        <form onSubmit={handleSwap}>
          <div className="mb-3">
            <label htmlFor="inputToken" className="form-label">From</label>
            <select
              className="form-select mb-2"
              id="inputToken"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              disabled={!isWalletConnected}
            >
              {tokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
            <input
              type="number"
              className="form-control"
              id="inputAmount"
              value={inputAmount}
              onChange={handleInputChange}
              placeholder="Enter amount to swap"
              disabled={!isWalletConnected}
            />
            <small className="form-text text-muted">
              Balance: {isWalletConnected ? `${balances[inputToken]} ${inputToken}` : '-- --'}
            </small>
          </div>
          <div className="mb-3">
            <label htmlFor="outputToken" className="form-label">To</label>
            <select
              className="form-select mb-2"
              id="outputToken"
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              disabled={!isWalletConnected}
            >
              {tokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
            <input
              type="number"
              className="form-control"
              id="outputAmount"
              value={outputAmount}
              placeholder="Estimated output"
              readOnly
              disabled={!isWalletConnected}
            />
            <small className="form-text text-muted">
              Balance: {isWalletConnected ? `${balances[outputToken]} ${outputToken}` : '-- --'}
            </small>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={!isWalletConnected}>
            {isWalletConnected ? 'Swap' : 'Connect Wallet to Swap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwapCard;