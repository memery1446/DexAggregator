import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import SwapCard from './components/SwapCard';
import Loading from './components/Loading';
import Footer from './components/Footer';
//import StateMonitor from './components/StateMonitor';
 //{process.env.NODE_ENV === 'development' && <StateMonitor />}
//Add line above to app in order to display the logging info

const App = () => {
  // Only show loading during initial connection
  const isConnecting = useSelector((state) => 
    state.blockchain?.isLoading && !state.blockchain?.address
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card shadow-lg mb-5" style={{ borderRadius: '1.25rem', backgroundColor: '#594D5B' }}>
                <div className="card-body p-4">
                  {isConnecting ? <Loading /> : <SwapCard />}
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