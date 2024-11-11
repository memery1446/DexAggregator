import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { 
  TOKEN_ABI,
  DEX_AGGREGATOR_ABI 
} from '../contracts/contractABIs';
import { 
  TK1_ADDRESS, 
  TK2_ADDRESS,
  DEX_AGGREGATOR_ADDRESS 
} from '../contracts/contractAddresses';

const initialState = {
  address: null,
  balances: {},
  isLoading: false,
  error: null,
  bestQuote: null,
  swapStatus: null
};

export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        console.log('Connected to wallet:', address);
        return { address };
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBalances = createAsyncThunk(
  'blockchain/fetchBalances',
  async (_, { getState, rejectWithValue }) => {
    const { blockchain } = getState();
    if (!blockchain.address) {
      console.log('No address found, skipping balance fetch');
      return rejectWithValue('Wallet not connected');
    }

    try {
      console.log('Fetching balances for:', blockchain.address);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tk1Contract = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
      const tk2Contract = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);
      
      const [tk1Balance, tk2Balance] = await Promise.all([
        tk1Contract.balanceOf(blockchain.address),
        tk2Contract.balanceOf(blockchain.address),
      ]);

      const formattedBalances = {
        TK1: ethers.utils.formatUnits(tk1Balance, 18),
        TK2: ethers.utils.formatUnits(tk2Balance, 18),
      };

      console.log('Fetched balances:', formattedBalances);
      return formattedBalances;
    } catch (error) {
      console.error('Balance fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getSwapQuote = createAsyncThunk(
  'blockchain/getSwapQuote',
  async ({ inputAmount, isAtoB }, { rejectWithValue }) => {
    try {
      console.log('Getting swap quote:', { inputAmount, isAtoB });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const aggregatorContract = new ethers.Contract(
        DEX_AGGREGATOR_ADDRESS,
        DEX_AGGREGATOR_ABI,
        provider
      );

      const amountIn = ethers.utils.parseUnits(inputAmount.toString(), 18);
      const [bestAMM, bestOutput] = await aggregatorContract.getBestQuote(amountIn, isAtoB);
      
      const result = {
        bestAMM,
        expectedOutput: ethers.utils.formatUnits(bestOutput, 18),
        inputAmount,
        isAtoB
      };
      
      console.log('Swap quote result:', result);
      return result;
    } catch (error) {
      console.error('Swap quote error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const executeSwap = createAsyncThunk(
  'blockchain/executeSwap',
  async ({ inputAmount, isAtoB, minOutput }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Executing swap:', { inputAmount, isAtoB, minOutput });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const aggregatorContract = new ethers.Contract(
        DEX_AGGREGATOR_ADDRESS,
        DEX_AGGREGATOR_ABI,
        signer
      );
      
      const inputToken = new ethers.Contract(
        isAtoB ? TK1_ADDRESS : TK2_ADDRESS,
        TOKEN_ABI,
        signer
      );

      const amountIn = ethers.utils.parseUnits(inputAmount.toString(), 18);
      const minOutputWei = ethers.utils.parseUnits(minOutput.toString(), 18);

      console.log('Approving token spend...');
      const approveTx = await inputToken.approve(DEX_AGGREGATOR_ADDRESS, amountIn);
      await approveTx.wait();
      console.log('Approval confirmed');

      console.log('Executing swap transaction...');
      const swapTx = await aggregatorContract.executeSwap(amountIn, isAtoB, minOutputWei);
      await swapTx.wait();
      console.log('Swap completed');

      dispatch(fetchBalances());
      return { success: true };
    } catch (error) {
      console.error('Swap execution error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {
    resetLoading: (state) => {
      state.isLoading = false;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload.address;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Balances
      .addCase(fetchBalances.pending, (state) => {
        state.error = null;
        // Don't set isLoading here to prevent spinner
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload;
        state.error = null;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});


export const { clearSwapStatus, clearBestQuote } = blockchainSlice.actions;
export default blockchainSlice.reducer;