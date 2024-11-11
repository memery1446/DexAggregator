import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { 
  TOKEN_ABI,
  AMM_ABI,
  AMM2_ABI,
  DEX_AGGREGATOR_ABI 
} from '../contracts/contractABIs';
import {
  TK1_ADDRESS,
  TK2_ADDRESS,
  AMM_ADDRESS,
  AMM2_ADDRESS,
  DEX_AGGREGATOR_ADDRESS
} from '../contracts/contractAddresses';

const ConnectionTest = () => {
  const [status, setStatus] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnections = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask not installed");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        // Initialize contracts
        const tk1 = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
        const tk2 = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);
        const amm1 = new ethers.Contract(AMM_ADDRESS, AMM_ABI, provider);
        const amm2 = new ethers.Contract(AMM2_ADDRESS, AMM2_ABI, provider);
        const dexAgg = new ethers.Contract(DEX_AGGREGATOR_ADDRESS, DEX_AGGREGATOR_ABI, provider);

        // Get balances and info
        const [
          tk1Balance,
          tk2Balance,
          amm1ReserveA,
          amm1ReserveB,
          amm2ReserveA,
          amm2ReserveB
        ] = await Promise.all([
          tk1.balanceOf(address),
          tk2.balanceOf(address),
          amm1.reserveA(),
          amm1.reserveB(),
          amm2.reserveA(),
          amm2.reserveB()
        ]);

        // Test quote
        const testAmount = ethers.utils.parseUnits("1", 18);
        const [bestAMM, bestOutput] = await dexAgg.getBestQuote(testAmount, true);

        setStatus({
          address,
          balances: {
            TK1: ethers.utils.formatUnits(tk1Balance, 18),
            TK2: ethers.utils.formatUnits(tk2Balance, 18)
          },
          amm1: {
            reserveA: ethers.utils.formatUnits(amm1ReserveA, 18),
            reserveB: ethers.utils.formatUnits(amm1ReserveB, 18)
          },
          amm2: {
            reserveA: ethers.utils.formatUnits(amm2ReserveA, 18),
            reserveB: ethers.utils.formatUnits(amm2ReserveB, 18)
          },
          quote: {
            bestAMM,
            output: ethers.utils.formatUnits(bestOutput, 18)
          }
        });

      } catch (err) {
        console.error('Connection test error:', err);
        setError(err.message);
      }
    };

    testConnections();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-bold text-red-700">Connection Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Connection Test Results</h3>
      
      {Object.keys(status).length > 0 ? (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Wallet</h4>
            <p className="font-mono text-sm">{status.address}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Balances</h4>
            <p>TK1: {status.balances?.TK1}</p>
            <p>TK2: {status.balances?.TK2}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">AMM1 Reserves</h4>
            <p>A: {status.amm1?.reserveA}</p>
            <p>B: {status.amm1?.reserveB}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">AMM2 Reserves</h4>
            <p>A: {status.amm2?.reserveA}</p>
            <p>B: {status.amm2?.reserveB}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Test Quote (1 TK1)</h4>
            <p>Best AMM: {status.quote?.bestAMM}</p>
            <p>Output: {status.quote?.output} TK2</p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ConnectionTest;
