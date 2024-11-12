import React from 'react';

const TransactionHistory = () => {
  // Mock data - in practice you'd get this from your blockchain state
  const recentTxs = [
    {
      hash: '0x1234...5678',
      type: 'Swap',
      from: { symbol: 'TK1', amount: '100' },
      to: { symbol: 'TK2', amount: '98.5' },
      status: 'completed',
      timestamp: Date.now() - 1000 * 60 * 5 // 5 mins ago
    }
  ];

  const formatTime = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="mt-4 border-top pt-3">
      <h6 className="mb-3">Recent Transactions</h6>
      {recentTxs.length === 0 ? (
        <div className="text-muted">No recent transactions</div>
      ) : (
        <div className="small">
          {recentTxs.map((tx) => (
            <div key={tx.hash} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
              <div>
                <span className="text-primary">{tx.type}:</span>{' '}
                {tx.from.amount} {tx.from.symbol} → {tx.to.amount} {tx.to.symbol}
              </div>
              <div className="text-muted">
                {formatTime(tx.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
