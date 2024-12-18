import React from 'react';
import { useSelector } from 'react-redux';

const RecentTransactions = () => {
  const transactions = useSelector((state) => state.blockchain.transactions || []);

  if (transactions.length === 0) {
    return (
      <div className="text-muted text-center py-3">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="transactions-list">
      {transactions.map((tx, index) => (
        <div 
          key={tx.hash || index} 
          className="transaction-item mb-2 p-2 rounded"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderLeft: '4px solid #e3b778'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <span className="badge bg-secondary me-2">Swap</span>
              <small className="text-muted">
                {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Processing...'}
              </small>
            </div>
            <small className="text-truncate ms-2" style={{ maxWidth: '120px' }}>
              {tx.hash}
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <span className="text-white">{tx.inputAmount} {tx.inputToken}</span>
              <span className="text-muted">→</span>
              <span className="text-white">{tx.outputAmount} {tx.outputToken}</span>
            </div>
            <span className="badge ms-2" style={{ 
              backgroundColor: tx.status === 'confirmed' ? '#e3b778' : 
                             tx.status === 'failed' ? '#dc3545' : '#6c757d'
            }}>
              {tx.status || 'Pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;