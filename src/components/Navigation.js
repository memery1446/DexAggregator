import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setWalletConnected } from '../store';

const Navigation = () => {
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.wallet.isConnected);

  const handleConnect = () => {
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setWalletConnected(true));
      dispatch(setLoading(false));
    }, 2000);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <a className="navbar-brand" href="/">
          <img src="/logo.png" alt="DexAggregator Logo" height="30" />
        </a>
        <div className="ml-auto">
          {isWalletConnected ? (
            <span className="navbar-text">
              Wallet Connected: 0x1234...5678
            </span>
          ) : (
            <button
              onClick={handleConnect}
              className="btn btn-outline-primary"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
