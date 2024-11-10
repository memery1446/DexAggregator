import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWalletConnected } from '../store';
import logo from '../logo.png';

const Navigation = () => {
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.wallet.isConnected);

  const handleConnect = () => {
    dispatch(setWalletConnected(true));
  };

  const handleDisconnect = () => {
    dispatch(setWalletConnected(false));
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header>
      <div className="container-fluid px-0">
        <div className="row g-0">
          <div className="col-12" style={{ height: '40px', backgroundColor: 'white' }}></div>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#594D5B' }}>
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src={logo} alt="URDEX Logo" height="40" className="d-inline-block align-top" />
          </a>
          <div className="ml-auto">
            {isWalletConnected ? (
              <div className="d-flex align-items-center">
                <span className="me-2 text-white">Connected:</span>
                <div className="btn-group">
                  <button type="button" className="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="badge bg-success me-2"></span>
                    {truncateAddress('0x1234567890123456789012345678901234567890')}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><button className="dropdown-item" type="button" onClick={handleDisconnect}>Disconnect</button></li>
                  </ul>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="btn btn-light"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
      <div className="container text-center mt-4 mb-5">
        <h1 className="display-4 fw-bold mb-0">URDEX</h1>
        <p className="h3 text-muted mb-0" style={{ marginTop: '-0.5rem' }}>aggregator</p>
      </div>
    </header>
  );
};

export default Navigation;