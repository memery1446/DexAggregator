import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { 
  TOKEN_ABI 
} from '../contracts/contractABIs';
import { 
  TK1_ADDRESS, 
  TK2_ADDRESS
} from '../contracts/contractAddresses';
import { connectWallet, fetchBalances } from '../store/blockchainSlice';

const WalletDebug = () => {
  const dispatch = useDispatch();
  const [localState, setLocalState] = useState({});
  const reduxState = useSelector(state => state.blockchain);

  const checkDirectConnection = async () => {
    try {
      if (!window.ethereum) {
        setLocalState(prev => ({ ...prev, error: 'No MetaMask found' }));
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Get balances directly
      const tk1 = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
      const tk2 = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);
      
      const [tk1Balance, tk2Balance] = await Promise.all([
        tk1.balanceOf(address),
        tk2.balanceOf(address)
      ]);

      setLocalState({
        directAddress: address,
        directBalances: {
          TK1: ethers.utils.formatUnits(tk1Balance, 18),
          TK2: ethers.utils.formatUnits(tk2Balance, 18)
        },
        provider: provider ? 'Connected' : 'Not Connected',
        chainId: await provider.getNetwork().then(net => net.chainId)
      });
    } catch (error) {
      setLocalState(prev => ({ ...prev, error: error.message }));
    }
  };

  const forceConnect = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      await dispatch(fetchBalances());
    } catch (error) {
      console.error('Force connect error:', error);
    }
  };

  useEffect(() => {
    checkDirectConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkDirectConnection);
      window.ethereum.on('chainChanged', checkDirectConnection);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', checkDirectConnection);
        window.ethereum.removeListener('chainChanged', checkDirectConnection);
      };
    }
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <h3 className="text-lg font-bold mb-4">Wallet Debug Info</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Direct Connection</h4>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(localState, null, 2)}
          </pre>
        </div>
        
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Redux State</h4>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(reduxState, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 space-x-4">
        <button
          onClick={checkDirectConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Direct Connection
        </button>
        
        <button
          onClick={forceConnect}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Force Connect & Fetch
        </button>
      </div>
    </div>
  );
};

export default WalletDebug;
