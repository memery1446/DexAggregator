import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWalletConnected } from '../store';

const SwapCard = () => {
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.wallet.isConnected);
  const [inputToken, setInputToken] = useState('ETH');
  const [outputToken, setOutputToken] = useState('DAI');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');

  const tokens = ['ETH', 'DAI', 'USDC', 'WBTC'];
  const balances = {
    ETH: '1.5',
    DAI: '1000',
    USDC: '1000',
    WBTC: '0.05'
  };

  const handleConnect = () => {
    // Simulating wallet connection
    setTimeout(() => {
      dispatch(setWalletConnected(true));
    }, 1000);
  };

  const handleSwap = (e) => {
    e.preventDefault();
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
        <h5 className="card-title">Swap Tokens</h5>
        {!isWalletConnected ? (
          <button className="btn btn-primary mb-3" onClick={handleConnect}>Connect Wallet</button>
        ) : (
          <form onSubmit={handleSwap}>
            <div className="mb-3">
              <label htmlFor="inputToken" className="form-label">From</label>
              <select
                className="form-select mb-2"
                id="inputToken"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
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
              />
              <small className="form-text text-muted">
                Balance: {balances[inputToken]} {inputToken}
              </small>
            </div>
            <div className="mb-3">
              <label htmlFor="outputToken" className="form-label">To</label>
              <select
                className="form-select mb-2"
                id="outputToken"
                value={outputToken}
                onChange={(e) => setOutputToken(e.target.value)}
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
              />
              <small className="form-text text-muted">
                Balance: {balances[outputToken]} {outputToken}
              </small>
            </div>
            <button type="submit" className="btn btn-primary">Swap</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SwapCard;