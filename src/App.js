import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import SwapCard from './components/SwapCard';
import PriceChart from './components/PriceChart';
import RecentTransactions from './components/RecentTransactions';
import Loading from './components/Loading';
import Footer from './components/Footer';

const App = () => {
  const isConnecting = useSelector((state) => 
    state.blockchain?.isLoading && !state.blockchain?.address
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1 d-flex flex-column" 
            style={{ 
              background: 'linear-gradient(225deg, #e3b778, #7F7D9C)',
              minHeight: 'calc(100vh - 10px)',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
        <div className="container-fluid py-4">
          <div className="row">
            {/* Left side - Swap Card */}
            <div className="col-12 col-lg-5 col-xl-4 ps-lg-4">
              <div style={{ 
                paddingBottom: '2rem'
              }}>
                <div className="card shadow-lg border-0" 
                  style={{ 
                    borderRadius: '24px',
                    backgroundColor: 'rgba(89, 77, 91, 0.95)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '440px',
                    overflow: 'hidden'
                  }}>
                  <div className="p-4">
                    {isConnecting ? <Loading /> : <SwapCard />}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Price Chart and Recent Transactions */}
            <div className="col-12 col-lg-7 col-xl-8 pe-lg-4">
              <div className="d-flex flex-column h-100">
                {/* Price Chart */}
                <div className="mb-4">
                  <div className="card shadow-lg border-0" 
                    style={{ 
                      borderRadius: '24px',
                      backgroundColor: 'rgba(89, 77, 91, 0.95)',
                      backdropFilter: 'blur(10px)',
                      overflow: 'hidden'
                    }}>
                    <div className="p-4">
                      <PriceChart />
                    </div>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div>
                  <div className="card shadow-lg border-0" 
                    style={{ 
                      borderRadius: '24px',
                      backgroundColor: 'rgba(89, 77, 91, 0.95)',
                      backdropFilter: 'blur(10px)',
                      overflow: 'hidden'
                    }}>
                    <div className="p-4">
                      <h5 className="card-title text-white mb-3">Recent Transactions</h5>
                      <RecentTransactions />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;