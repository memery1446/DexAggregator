import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const NetworkTest = () => {
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          setNetworkInfo({
            chainId: parseInt(chainId, 16),
            networkName: network.name,
            isConnected: accounts.length > 0,
            account: accounts[0] || null,
            provider: provider ? 'Available' : 'Not Available'
          });

          console.log('Network Details:', {
            chainId: parseInt(chainId, 16),
            networkName: network.name,
            account: accounts[0],
            provider: provider ? 'Available' : 'Not Available'
          });
        }
      } catch (error) {
        console.error('Network check failed:', error);
      }
    };

    checkNetwork();
  }, []);

  if (!networkInfo) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Network Status</h3>
      <p>Chain ID: {networkInfo.chainId}</p>
      <p>Network: {networkInfo.networkName}</p>
      <p>Connected: {networkInfo.isConnected ? 'Yes' : 'No'}</p>
      <p>Account: {networkInfo.account || 'None'}</p>
      <p>Provider: {networkInfo.provider}</p>
    </div>
  );
};

export default NetworkTest;
