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

  // Define a constant for the spacing
  const SPACING = '15px';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation style={{ marginBottom: SPACING }} />
      <main className="flex-grow-1 d-flex flex-column" 
            style={{ 
              background: 'linear-gradient(225deg, #e3b778, #7F7D9C)',
              minHeight: 'calc(100vh - 10px)' 
            }}>
        <div className="container mt-3">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div style={{ 
                transform: 'scale(0.85)', 
                transformOrigin: 'center top',
                marginTop: SPACING // Add top margin to the scaled container
              }}>
                <div className="card shadow-lg" style={{ 
                  borderRadius: '1.25rem', 
                  backgroundColor: '#594D5B',
                  maxWidth: '450px', 
                  width: '100%',
                  margin: '0 auto'
                }}>
                  <div className="card-body p-3">
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