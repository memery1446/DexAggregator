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
  swapStatus: null,
  priceHistory: [],
  isPriceLoading: false,
  priceError: null,
  transactions: [],
  isTransactionsLoading: false,
  transactionsError: null
};


const connectWallet = createAsyncThunk(
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
      console.error('Wallet connection error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const fetchBalances = createAsyncThunk(
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

const getSwapQuote = createAsyncThunk(
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

const executeSwap = createAsyncThunk(
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
      const receipt = await swapTx.wait();
      console.log('Swap completed');

      // Add the new transaction to the store
      const newTransaction = {
        hash: swapTx.hash,
        timestamp: Date.now(),
        inputAmount: inputAmount,
        inputToken: isAtoB ? 'TK1' : 'TK2',
        outputAmount: minOutput,
        outputToken: isAtoB ? 'TK2' : 'TK1',
        status: 'confirmed'
      };
      dispatch(addTransaction(newTransaction));

      dispatch(fetchBalances());
      return { success: true };
    } catch (error) {
      console.error('Swap execution error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const fetchPriceHistory = createAsyncThunk(
  'blockchain/fetchPriceHistory',
  async ({ timeframe }, { rejectWithValue }) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const aggregatorContract = new ethers.Contract(
        DEX_AGGREGATOR_ADDRESS,
        DEX_AGGREGATOR_ABI,
        provider
      );

      // For now, generate sample data while contract method is implemented
      const generateSampleData = (count) => {
        const data = [];
        const basePrice = 1.5;
        let currentPrice = basePrice;
        const now = Date.now();
        
        for (let i = count; i >= 0; i--) {
          currentPrice = currentPrice * (1 + (Math.random() * 0.1 - 0.05));
          data.push({
            timestamp: now - (i * 3600000), // hourly points
            price: currentPrice
          });
        }
        return data;
      };

      // Generate appropriate number of data points based on timeframe
      const dataPoints = 
        timeframe === '1H' ? 60 :    // minute intervals
        timeframe === '24H' ? 24 :   // hourly intervals
        timeframe === '7D' ? 168 :   // hourly intervals
        timeframe === '1M' ? 30 :    // daily intervals
        90;                          // daily intervals for ALL

      return generateSampleData(dataPoints);
    } catch (error) {
      console.error('Price history fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const fetchRecentTransactions = createAsyncThunk(
  'blockchain/fetchRecentTransactions',
  async (_, { getState, rejectWithValue }) => {
    const { blockchain } = getState();
    if (!blockchain.address) {
      return rejectWithValue('Wallet not connected');
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const aggregatorContract = new ethers.Contract(
        DEX_AGGREGATOR_ADDRESS,
        DEX_AGGREGATOR_ABI,
        provider
      );

     
      const recentTxs = await aggregatorContract.getRecentTransactions(blockchain.address);

      // Process and format the transactions
      const formattedTxs = recentTxs.map(tx => ({
        hash: tx.hash,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        inputAmount: ethers.utils.formatUnits(tx.inputAmount, 18),
        inputToken: tx.inputToken === TK1_ADDRESS ? 'TK1' : 'TK2',
        outputAmount: ethers.utils.formatUnits(tx.outputAmount, 18),
        outputToken: tx.outputToken === TK1_ADDRESS ? 'TK1' : 'TK2',
        status: tx.status
      }));

      return formattedTxs;
    } catch (error) {
      console.error('Recent transactions fetch error:', error);
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
    },
    clearSwapStatus: (state) => {
      state.swapStatus = null;
      state.error = null;
    },
    clearBestQuote: (state) => {
      state.bestQuote = null;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      state.transactions = state.transactions.slice(0, 10); // Keep only the 10 most recent transactions
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchBalances.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload;
        state.error = null;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getSwapQuote.pending, (state) => {
        state.error = null;
      })
      .addCase(getSwapQuote.fulfilled, (state, action) => {
        state.bestQuote = action.payload;
        state.error = null;
      })
      .addCase(getSwapQuote.rejected, (state, action) => {
        state.error = action.payload;
        state.bestQuote = null;
      })
      .addCase(executeSwap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.swapStatus = 'pending';
      })
      .addCase(executeSwap.fulfilled, (state) => {
        state.isLoading = false;
        state.swapStatus = 'success';
        state.bestQuote = null;
      })
      .addCase(executeSwap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.swapStatus = 'failed';
      })
      .addCase(fetchPriceHistory.pending, (state) => {
        state.isPriceLoading = true;
        state.priceError = null;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.isPriceLoading = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.isPriceLoading = false;
        state.priceError = action.payload;
      })
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.isTransactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.isTransactionsLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.isTransactionsLoading = false;
        state.transactionsError = action.payload;
      });
  },
});

export const {
  resetLoading,
  resetError,
  clearSwapStatus,
  clearBestQuote,
  addTransaction
} = blockchainSlice.actions;

// Export everything in a single export statement
export {
  connectWallet,
  fetchBalances,
  getSwapQuote,
  executeSwap,
  fetchPriceHistory,
  fetchRecentTransactions
};

export default blockchainSlice.reducer;