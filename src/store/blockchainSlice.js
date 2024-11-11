import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { TOKEN_ABI, AMM_ABI, AMM2_ABI, DEX_AGGREGATOR_ABI } from '../contracts/contractABIs';
import { TK1_ADDRESS, TK2_ADDRESS, AMM_ADDRESS, AMM2_ADDRESS, DEX_AGGREGATOR_ADDRESS } from '../contracts/contractAddresses';

export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (_, { dispatch }) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchBalances(address));
        return { address, provider, signer };
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw new Error('Failed to connect wallet: ' + error.message);
      }
    } else {
      throw new Error('Please install MetaMask');
    }
  }
);

export const fetchBalances = createAsyncThunk(
  'blockchain/fetchBalances',
  async (address, { getState, rejectWithValue }) => {
    try {
      const { provider } = getState().blockchain;
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const tk1Contract = new ethers.Contract(TK1_ADDRESS, TOKEN_ABI, provider);
      const tk2Contract = new ethers.Contract(TK2_ADDRESS, TOKEN_ABI, provider);

      console.log('Fetching balances for address:', address);
      console.log('TK1 Address:', TK1_ADDRESS);
      console.log('TK2 Address:', TK2_ADDRESS);

      const [tk1Balance, tk2Balance] = await Promise.all([
        tk1Contract.balanceOf(address),
        tk2Contract.balanceOf(address)
      ]);

      console.log('Raw TK1 Balance:', tk1Balance.toString());
      console.log('Raw TK2 Balance:', tk2Balance.toString());

      const formattedBalances = {
        TK1: ethers.utils.formatUnits(tk1Balance, 18),
        TK2: ethers.utils.formatUnits(tk2Balance, 18)
      };

      console.log('Formatted Balances:', formattedBalances);

      return formattedBalances;
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      return rejectWithValue(`Failed to fetch balances: ${error.message}`);
    }
  }
);

export const performSwap = createAsyncThunk(
  'blockchain/performSwap',
  async ({ inputToken, outputToken, inputAmount }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { signer, address } = getState().blockchain;
      const dexAggregatorContract = new ethers.Contract(DEX_AGGREGATOR_ADDRESS, DEX_AGGREGATOR_ABI, signer);

      const inputAmountWei = ethers.utils.parseUnits(inputAmount, 18);
      const minOutput = 0; // You might want to calculate this based on some slippage tolerance

      // Approve DexAggregator to spend tokens
      const inputTokenContract = new ethers.Contract(
        inputToken === 'TK1' ? TK1_ADDRESS : TK2_ADDRESS,
        TOKEN_ABI,
        signer
      );
      const approveTx = await inputTokenContract.approve(DEX_AGGREGATOR_ADDRESS, inputAmountWei);
      await approveTx.wait();

      // Perform swap
      const swapTx = await dexAggregatorContract.executeSwap(
        inputAmountWei,
        inputToken === 'TK1', // isAtoB
        minOutput
      );
      await swapTx.wait();

      // Fetch updated balances
      await dispatch(fetchBalances(address));

      return { success: true };
    } catch (error) {
      console.error('Swap failed:', error);
      return rejectWithValue(`Swap failed: ${error.message}`);
    }
  }
);


const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    address: null,
    provider: null,
    signer: null,
    balances: { TK1: '0', TK2: '0' },
    isLoading: false,
    error: null,
  },
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
        state.provider = action.payload.provider;
        state.signer = action.payload.signer;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBalances.pending, (state) => {
        state.isLoading = true;
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
      .addCase(performSwap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSwap.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(performSwap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default blockchainSlice.reducer;