import React from 'react';
import { useSelector } from 'react-redux';

const StateMonitor = () => {
  const state = useSelector(state => state.blockchain);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: 'white', 
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 9999,
        fontSize: '12px'
      }}
    >
      <div>Redux State:</div>
      <pre style={{ margin: 0 }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

export default StateMonitor;