import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2024 DexAggregator. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="#" className="text-muted me-3">Terms of Service</a>
            <a href="#" className="text-muted">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
