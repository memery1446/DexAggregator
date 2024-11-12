import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, fetchBalances } from '../store/blockchainSlice';
import logo from '../logo.png';

const Navigation = () => {
  const dispatch = useDispatch();
  
  // Safer state selection with default values
  const blockchainState = useSelector((state) => state.blockchain || {});
  const isLoading = blockchainState.isLoading || false;
  const address = blockchainState.address || null;

  const handleConnect = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      // Fetch balances right after connecting
      await dispatch(fetchBalances());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    // We'll implement disconnect functionality if needed
    console.log('Disconnect requested');
  };

  const truncateAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  return (
    <header>
      <div className="container-fluid px-0">
        <div className="row g-0">
          <div className="col-12" style={{ height: '40px', backgroundColor: 'white' }}></div>
        </div>
      </div>
      <div className="container-fluid px-0 position-relative">
        <div className="row g-0">
          <div className="col-12">
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#594D5B', height: '60px' }}>
              <div className="container">
                <div className="invisible">
                  {/* This is a placeholder to maintain layout */}
                  <img src={logo} alt="" height="60" />
                </div>
                <div className="ml-auto">
                  {address ? (
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-white">Connected:</span>
                      <div className="btn-group">
                        <button 
                          type="button" 
                          className="btn btn-light btn-sm dropdown-toggle" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          <span className="badge bg-success me-2"></span>
                          {truncateAddress(address)}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button 
                              className="dropdown-item" 
                              type="button" 
                              onClick={handleDisconnect}
                            >
                              Disconnect
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="btn btn-light"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
        <div className="position-absolute" style={{ top: '-25px', left: '55px', zIndex: 1000 }}>
          <a href="/">
            <img src={logo} alt="URDEX Logo" height="220" className="d-inline-block" />
          </a>
        </div>
      </div>
      <div className="container text-center mt-3 mb-4">
        <h1 className="display-2 fw-bold mb-0">URDEX</h1>
        <p className="h3 text-muted mb-0" style={{ marginTop: '-0.5rem' }}>aggregator</p>
      </div>
    </header>
  );
};

export default Navigation;