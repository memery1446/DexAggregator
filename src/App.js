import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import SwapCard from './components/SwapCard';

function App() {
  const isLoading = useSelector((state) => state.app.isLoading);

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <main className="container py-5">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="row justify-content-center">
            <div className="col-md-6">
              <SwapCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
