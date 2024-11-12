import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';

const GasEstimator = ({ fromToken, toToken, amount, bestQuote }) => {
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const estimateGas = async () => {
      if (!bestQuote || !amount) return;

      setIsLoading(true);
      setError(null);
      
      try {
        // Hardhat's default provider
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
        
        // Get gas price (Hardhat's default is often 8000000000 (8 gwei))
        const gasPrice = await provider.getGasPrice();
        
        // For Hardhat testing, we can use a simpler gas estimation
        // Typical DEX swap gas ranges from 150,000 to 250,000
        const estimatedGasLimit = ethers.BigNumber.from('200000');
        
        // Calculate total gas cost
        const gasCost = estimatedGasLimit.mul(gasPrice);
        
        // Convert to ETH
        const gasCostEth = ethers.utils.formatEther(gasCost);
        
        setGasEstimate({
          eth: parseFloat(gasCostEth).toFixed(6),
          gasLimit: estimatedGasLimit.toString(),
          gwei: ethers.utils.formatUnits(gasPrice, 'gwei')
        });

      } catch (error) {
        console.error('Gas estimation error:', error);
        setError('Failed to estimate gas on Hardhat network');
      } finally {
        setIsLoading(false);
      }
    };

    if (bestQuote && amount) {
      estimateGas();
    }
  }, [bestQuote, amount]);

  // Don't render if no quote or amount
  if (!bestQuote || !amount) {
    return null;
  }

  return (
    <div className="mt-3 bg-light rounded p-3">
      <div className="d-flex align-items-center mb-2">
        <span className="me-2" role="img" aria-label="gas pump">⛽</span>
        <span className="fw-bold">Network Fee (Hardhat)</span>
      </div>
      
      {isLoading ? (
        <div className="text-center py-2">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Calculating...</span>
        </div>
      ) : error ? (
        <div className="text-danger small">{error}</div>
      ) : gasEstimate && (
        <div className="gas-details">
          <div className="d-flex justify-content-between align-items-center">
            <span>Estimated fee</span>
            <div className="text-end">
              <div>{gasEstimate.eth} ETH</div>
              <small className="text-muted">
                ({gasEstimate.gwei} Gwei)
              </small>
            </div>
          </div>
          <div className="mt-2 text-muted small">
            Estimated gas units: {parseInt(gasEstimate.gasLimit).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GasEstimator;