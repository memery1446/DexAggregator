import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import SwapCard from './components/SwapCard';
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
              overflowY: 'auto', // Ensure main content is scrollable
              overflowX: 'hidden' // Prevent horizontal scroll
            }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-8">
              <div style={{ 
                margin: '0 auto',
                paddingBottom: '2rem' // Add padding at bottom for better scroll visibility
              }}>
                <div className="card shadow-lg border-0" 
                  style={{ 
                    borderRadius: '24px',
                    backgroundColor: 'rgba(89, 77, 91, 0.95)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '440px',
                    margin: '0 auto',
                    overflow: 'hidden'
                  }}>
                  <div className="p-4">
                    {isConnecting ? <Loading /> : <SwapCard />}
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