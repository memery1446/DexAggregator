import React, { useState } from 'react';
import { ethers } from 'ethers';

const AccountVerify = () => {
  const [status, setStatus] = useState('');

  const verifyAccount = async () => {
    try {
      // Get provider and accounts
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Expected Hardhat test account
      const expectedAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      
      setStatus(`
        Current Account: ${address}
        Is Expected Account: ${address.toLowerCase() === expectedAccount.toLowerCase()}
        All Accounts: ${accounts.join(', ')}
        Selected in MetaMask: ${window.ethereum.selectedAddress}
      `);
      
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const importHardhatAccount = async () => {
    try {
      // Default Hardhat private key
      const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      
      // Request account import
      await window.ethereum.request({
        method: 'wallet_importAccount',
        params: [privateKey]
      });
      
      setStatus('Account import requested. Please check MetaMask.');
    } catch (error) {
      setStatus('Import Error: ' + error.message);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-4">Account Verification</h3>
      <div className="space-y-4">
        <button
          onClick={verifyAccount}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Verify Current Account
        </button>
        
        <button
          onClick={importHardhatAccount}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Import Hardhat Account
        </button>
        
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {status}
        </pre>
      </div>
    </div>
  );
};

export default AccountVerify;
