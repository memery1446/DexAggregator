import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, fetchBalances } from '../store/blockchainSlice';
import logo from '../logo.png';

const Navigation = () => {
  const dispatch = useDispatch();
  
  const blockchainState = useSelector((state) => state.blockchain || {});
  const isLoading = blockchainState.isLoading || false;
  const address = blockchainState.address || null;

  const handleConnect = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      await dispatch(fetchBalances());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
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
              <div className="container position-relative">
                {/* Logo container with adjusted left positioning */}
                <div className="position-absolute d-none d-sm-block" style={{ left: '0', marginLeft: '-20px', top: '-16px', zIndex: 1000 }}>
                  <a href="/">
                    <img 
                      src={logo}
                      alt="URDEX Logo" 
                      height="90" 
                      className="d-inline-block"
                    />
                  </a>
                </div>
                
                {/* Main navigation content with proper spacing */}
                <div className="d-flex align-items-center justify-content-between w-100">
                  {/* Left side navigation links */}
                  <div className="d-flex align-items-center" style={{ marginLeft: '100px', height: '40px' }}>

                    <a 
                      href="https://www.youtube.com/playlist?list=PLFlTnaL2H_NGvk5I8wX7hTUDJj6guoZAK" 
                      className="text-white text-decoration-none h5 mb-0"
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ lineHeight: '40px' }}
                      >
                      Step-by-Step Videos
                    </a>
                    <a 
                      href="/about.html" 
                      className="text-white text-decoration-none h5 mb-0 ms-4"
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ lineHeight: '40px' }}
                      >
                      About
                    </a>

                  </div>
                  
                  {/* Right side buttons */}
                  <div className="d-flex align-items-center">
                    <a 
                      href="https://token-faucet-azure.vercel.app/"
                      className="btn btn-light me-3"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ height: '40px', lineHeight: '28px' }}
                      >
                      Get Tokens for URDEX
                    </a>
                    
                    {/* Wallet connection section */}
                    <div>
                      {address ? (
                        <div className="d-flex align-items-center">
                          <span className="me-2 text-white">Connected:</span>
                          <div className="btn-group">
                            <button 
                              type="button" 
                              className="btn btn-light btn-sm dropdown-toggle" 
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                            style={{ height: '40px', lineHeight: '28px' }}>
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
                          style={{ height: '40px', lineHeight: '28px' }}
                          >
                          {isLoading ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div className="container text-center mt-3 mb-4 d-none d-sm-block">
        <h1 className="display-2 fw-bold mb-0">URDEX</h1>
        <p className="h3 text-muted mb-0" style={{ marginTop: '-0.5rem' }}>aggregator</p>
      </div>
    </header>
  );
};

export default Navigation;

