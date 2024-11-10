import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { TK1_ABI, TK2_ABI, AMM_ABI, AMM2_ABI } from '../contracts/contractABIs';
import { TK1_ADDRESS, TK2_ADDRESS, AMM_ADDRESS, AMM2_ADDRESS } from '../contracts/contractAddresses';
import { getHardhatSigner, getHardhatAccounts } from '../utils/hardhatHelper';

export const connectWallet = createAsyncThunk(
  'blockchain/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      const signer = await getHardhatSigner();
      const address = await signer.getAddress();
      const accounts = await getHardhatAccounts();
      return { address, signer, accounts };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBalances = createAsyncThunk(
  'blockchain/getBalances',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { signer } = getState().blockchain;
      const tk1Contract = new ethers.Contract(TK1_ADDRESS, TK1_ABI, signer);
      const tk2Contract = new ethers.Contract(TK2_ADDRESS, TK2_ABI, signer);
      const tk1Balance = await tk1Contract.balanceOf(await signer.getAddress());
      const tk2Balance = await tk2Contract.balanceOf(await signer.getAddress());
      return {
        TK1: ethers.utils.formatUnits(tk1Balance, 18),
        TK2: ethers.utils.formatUnits(tk2Balance, 18)
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const swapTokens = createAsyncThunk(
  'blockchain/swapTokens',
  async ({ inputToken, outputToken, inputAmount, useAMM2 }, { getState, rejectWithValue }) => {
    try {
      const { signer } = getState().blockchain;
      const ammContract = new ethers.Contract(useAMM2 ? AMM2_ADDRESS : AMM_ADDRESS, useAMM2 ? AMM2_ABI : AMM_ABI, signer);
      const inputTokenContract = new ethers.Contract(
        inputToken === 'TK1' ? TK1_ADDRESS : TK2_ADDRESS,
        inputToken === 'TK1' ? TK1_ABI : TK2_ABI,
        signer
      );

      // Approve AMM to spend tokens
      const approveTx = await inputTokenContract.approve(useAMM2 ? AMM2_ADDRESS : AMM_ADDRESS, ethers.utils.parseUnits(inputAmount, 18));
      await approveTx.wait();

      // Perform swap
      const swapTx = await ammContract.swap(
        inputToken === 'TK1' ? TK1_ADDRESS : TK2_ADDRESS,
        outputToken === 'TK1' ? TK1_ADDRESS : TK2_ADDRESS,
        ethers.utils.parseUnits(inputAmount, 18)
      );
      await swapTx.wait();

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    address: null,
    signer: null,
    accounts: [],
    balances: { TK1: '0', TK2: '0' },
    isLoading: false,
    error: null,
    useAMM2: false
  },
  reducers: {
    toggleAMM: (state) => {
      state.useAMM2 = !state.useAMM2;
    },
    setSelectedAccount: (state, action) => {
      state.address = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload.address;
        state.signer = action.payload.signer;
        state.accounts = action.payload.accounts;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        state.balances = action.payload;
      })
      .addCase(swapTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(swapTokens.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(swapTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { toggleAMM, setSelectedAccount } = blockchainSlice.actions;
export default blockchainSlice.reducer;
