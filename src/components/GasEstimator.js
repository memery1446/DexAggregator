import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const GasEstimator = ({ fromToken, toToken, amount, onEstimateComplete }) => {
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const estimateGas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        
        // This is a placeholder. In a real scenario, you'd use your actual swap contract here.
        const swapContractAddress = '0x...'; // Your swap contract address
        const swapContract = new ethers.Contract(swapContractAddress, ['function swap(address,address,uint256)'], provider);
        
        // Estimate gas for the swap
        const gasLimit = await swapContract.estimateGas.swap(fromToken, toToken, ethers.utils.parseUnits(amount, 18));
        
        // Get current gas price
        const gasPrice = await provider.getGasPrice();
        
        // Calculate total gas cost
        const gasCost = gasLimit.mul(gasPrice);
        
        // Convert Wei to Ether for display
        const gasCostEther = ethers.utils.formatEther(gasCost);
        
        setGasEstimate(parseFloat(gasCostEther).toFixed(6));
        onEstimateComplete(gasCostEther); // Pass the estimate back to the parent component
      } catch (error) {
        console.error('Failed to estimate gas:', error);
        setError('Failed to estimate gas. Please check your inputs and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (fromToken && toToken && amount) {
      estimateGas();
    }
  }, [fromToken, toToken, amount, onEstimateComplete]);

  return (
    <div className="mt-3 p-2 bg-light rounded">
      <div className="d-flex align-items-center">
        <span className="me-2" role="img" aria-label="gas pump">⛽</span>
        <span className="font-weight-bold">Estimated Gas Cost:</span>
        <span className="ms-2">
          {isLoading ? 'Calculating...' : 
           error ? error :
           `${gasEstimate} ETH`}
        </span>
      </div>
    </div>
  );
};

export default GasEstimator;