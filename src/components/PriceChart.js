import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPriceHistory } from '../store/blockchainSlice';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PriceChart = () => {
  const dispatch = useDispatch();
  const [timeframe, setTimeframe] = useState('24H');
  
  // Get price data from Redux store
  const priceData = useSelector((state) => state.blockchain?.priceHistory || []);
  const inputToken = useSelector((state) => state.blockchain?.selectedInputToken || 'TK1');
  const outputToken = useSelector((state) => state.blockchain?.selectedOutputToken || 'TK2');
  
  // Fetch price data based on timeframe
  useEffect(() => {
    if (dispatch && timeframe) {
      // Dispatch action to fetch price data for selected timeframe
      // You'll need to implement this action in your blockchainSlice
      dispatch(fetchPriceHistory({ 
        timeframe, 
        inputToken, 
        outputToken 
      }));
    }
  }, [timeframe, inputToken, outputToken, dispatch]);

  const timeframes = ['1H', '24H', '7D', '1M', 'ALL'];

  // Calculate price change percentage
  const calculatePriceChange = () => {
    if (priceData.length < 2) return { change: 0, isPositive: true };
    const firstPrice = priceData[0].price;
    const lastPrice = priceData[priceData.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    return {
      change: Math.abs(change).toFixed(2),
      isPositive: change >= 0
    };
  };

  const priceChange = calculatePriceChange();

  return (
    <div className="card shadow-lg border-0" 
      style={{ 
        borderRadius: '24px',
        backgroundColor: 'rgba(89, 77, 91, 0.95)',
        backdropFilter: 'blur(10px)',
        height: '420px',
      }}>
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title text-white mb-0">{inputToken}/{outputToken} Price</h5>
          <div className="btn-group">
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`btn btn-sm ${timeframe === tf ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setTimeframe(tf)}
                style={{
                  backgroundColor: timeframe === tf ? '#e3b778' : 'transparent',
                  borderColor: timeframe === tf ? '#e3b778' : '#6c757d',
                  color: timeframe === tf ? 'white' : '#6c757d'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-grow-1">
          {priceData.length === 0 ? (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              Loading price data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={priceData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <XAxis 
                  dataKey="timestamp"
                  stroke="#6c757d"
                  tick={{ fill: '#6c757d' }}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return timeframe === '1H' ? date.toLocaleTimeString() :
                           timeframe === '24H' ? `${date.getHours()}:${date.getMinutes()}` :
                           date.toLocaleDateString();
                  }}
                />
                <YAxis 
                  stroke="#6c757d"
                  tick={{ fill: '#6c757d' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => value.toFixed(4)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(89, 77, 91, 0.95)',
                    borderColor: '#e3b778',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: 'white' }}
                  formatter={(value) => [value.toFixed(6), 'Price']}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#e3b778"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e3b778" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e3b778" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-2 d-flex justify-content-between text-muted">
          <div>
            <div>Current Price</div>
            <div className="h4 mb-0 text-white">
              {priceData.length > 0 ? 
                `${priceData[priceData.length - 1].price.toFixed(6)} ${outputToken}/${inputToken}` : 
                'Loading...'}
            </div>
          </div>
          <div className="text-end">
            <div>{timeframe} Change</div>
            <div className={`h4 mb-0 ${priceChange.isPositive ? 'text-success' : 'text-danger'}`}>
              {priceChange.isPositive ? '+' : '-'}{priceChange.change}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;