import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import SwapCard from './components/SwapCard';
import Loading from './components/Loading';
import Footer from './components/Footer';

function App() {
  const isLoading = useSelector((state) => state.app.isLoading);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5" style={{
        background: 'linear-gradient(135deg, #7F7D9C 0%, #d6b85a 100%)',
        paddingTop: '80px !important'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg mb-5" style={{ borderRadius: '1.25rem', backgroundColor: '#594D5B' }}>
                <div className="card-body p-4">
                  {isLoading ? <Loading /> : <SwapCard />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
