import React, { useEffect } from 'react';
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

const ContractDebug = () => {
  useEffect(() => {
    const checkContracts = async () => {
      try {
        // Log all contract addresses
        console.log('Contract Addresses:', {
          TK1: TK1_ADDRESS,
          TK2: TK2_ADDRESS,
          AMM: AMM_ADDRESS,
          AMM2: AMM2_ADDRESS,
          DEX: DEX_AGGREGATOR_ADDRESS
        });

        // Check if we have a provider
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          console.log('Provider connected');

          // Check token contracts
          const tk1 = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
          const tk2 = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);
          
          const [name1, name2] = await Promise.all([
            tk1.name(),
            tk2.name()
          ]);
          
          console.log('Token Names:', {
            TK1: name1,
            TK2: name2
          });

          // Check AMM contracts
          const amm1 = new ethers.Contract(AMM_ADDRESS, AMM_ABI, provider);
          const amm2 = new ethers.Contract(AMM2_ADDRESS, AMM2_ABI, provider);
          
          const [reserveA1, reserveB1] = await Promise.all([
            amm1.reserveA(),
            amm1.reserveB()
          ]);
          
          console.log('AMM1 Reserves:', {
            A: ethers.utils.formatUnits(reserveA1, 18),
            B: ethers.utils.formatUnits(reserveB1, 18)
          });

        } else {
          console.log('No Ethereum provider found');
        }
      } catch (error) {
        console.error('Contract Debug Error:', error);
      }
    };

    checkContracts();
  }, []);

  return null; // This component doesn't render anything
};

export default ContractDebug;
