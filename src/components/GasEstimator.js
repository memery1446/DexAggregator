import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';

const GasEstimator = ({ fromToken, toToken, amount, bestQuote }) => {
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const estimateGas = async () => {
      // Add validation for required props
      if (!bestQuote || !amount || !fromToken || !fromToken.address) {
        console.log("Missing required data:", { bestQuote, amount, fromToken });
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Log the input values
        console.log("Estimation params:", {
          fromTokenAddress: fromToken.address,
          amount: amount.toString(),
          bestQuoteAddress: bestQuote.address
        });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Verify token contract
        if (!ethers.utils.isAddress(fromToken.address)) {
          throw new Error(`Invalid token address: ${fromToken.address}`);
        }

        // Simple ERC20 ABI for approval
        const ERC20_ABI = [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ];

        // Create token contract instance
        const tokenContract = new ethers.Contract(
          fromToken.address,
          ERC20_ABI,
          signer
        );

        // Get fee data for gas calculations
        const feeData = await provider.getFeeData();

        // Estimate approval gas
        try {
          const approvalGas = await tokenContract.estimateGas.approve(
            bestQuote.address,
            amount
          );
          
          // Use a safe default for swap gas
          const swapGasEstimate = ethers.BigNumber.from('250000');
          
          // Calculate total gas estimate
          const totalGasEstimate = approvalGas.add(swapGasEstimate);
          
          // Calculate gas cost in ETH
          const gasCost = totalGasEstimate.mul(feeData.gasPrice);
          
          setGasEstimate({
            eth: ethers.utils.formatEther(gasCost),
            gasLimit: totalGasEstimate.toString(),
            gwei: ethers.utils.formatUnits(feeData.gasPrice, 'gwei'),
            breakdown: {
              approval: approvalGas.toString(),
              swap: swapGasEstimate.toString()
            }
          });
        } catch (estimateError) {
          console.error("Gas estimation failed:", estimateError);
          throw new Error(`Gas estimation failed: ${estimateError.message}`);
        }

      } catch (error) {
        console.error('Gas estimation error:', {
          message: error.message,
          code: error.code,
          data: error.data
        });
        setError(error.message || 'Failed to estimate gas on Sepolia network');
      } finally {
        setIsLoading(false);
      }
    };

    estimateGas();
  }, [fromToken, toToken, amount, bestQuote]);

  if (!bestQuote || !amount) {
    return null;
  }

  return (
    <div className="mt-3 bg-light rounded p-3">
      <div className="d-flex align-items-center mb-2">
        <span className="me-2" role="img" aria-label="gas pump">⛽</span>
        <span className="fw-bold">Network Fee (Sepolia)</span>
      </div>
      
      {isLoading ? (
        <div className="text-center py-2">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Calculating gas fees...</span>
        </div>
      ) : error ? (
        <div className="text-danger small">
          <div>{error}</div>
          <div className="mt-1">
            <small>Please check console for more details</small>
          </div>
        </div>
      ) : gasEstimate && (
        <div className="gas-details">
          <div className="d-flex justify-content-between align-items-center">
            <span>Estimated fee</span>
            <div className="text-end">
              <div>{parseFloat(gasEstimate.eth).toFixed(6)} ETH</div>
              <small className="text-muted">
                ({parseFloat(gasEstimate.gwei).toFixed(2)} Gwei)
              </small>
            </div>
          </div>
          
          <div className="mt-2 small">
            <div className="d-flex justify-content-between text-muted">
              <span>Token Approval:</span>
              <span>{parseInt(gasEstimate.breakdown.approval).toLocaleString()} gas</span>
            </div>
            <div className="d-flex justify-content-between text-muted">
              <span>Swap Execution:</span>
              <span>{parseInt(gasEstimate.breakdown.swap).toLocaleString()} gas</span>
            </div>
            <div className="d-flex justify-content-between text-muted">
              <span>Total Gas:</span>
              <span>{parseInt(gasEstimate.gasLimit).toLocaleString()} gas</span>
            </div>
          </div>

          <div className="mt-2 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Includes token approval and swap execution
          </div>
        </div>
      )}
    </div>
  );
};

export default GasEstimator;
