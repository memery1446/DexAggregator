import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { TOKEN_ABI } from '../contracts/contractABIs';
import { TK1_ADDRESS, TK2_ADDRESS } from '../contracts/contractAddresses';

const initialState = {
  address: null,
  balances: {},
  isLoading: false,
  error: null,
};

export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
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
      return rejectWithValue('Wallet not connected');
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tk1Contract = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
      const tk2Contract = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);

      const [tk1Balance, tk2Balance] = await Promise.all([
        tk1Contract.balanceOf(blockchain.address),
        tk2Contract.balanceOf(blockchain.address),
      ]);

      return {
        TK1: ethers.utils.formatUnits(tk1Balance, 18),
        TK2: ethers.utils.formatUnits(tk2Balance, 18),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload.address;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload;
      })
      .addCase(fetchBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default blockchainSlice.reducer;