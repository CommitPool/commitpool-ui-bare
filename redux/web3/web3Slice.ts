import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { chainByNetworkId } from "../../utils/chain";

export interface Web3State {
  provider: any;
  isLoggedIn: boolean;
  account?: string;
  web3Modal?: Web3Modal;
  chain: Network;
}

//Polygon as default network
const defaultChain: Network = chainByNetworkId('137');
const defaultProvider = ethers.getDefaultProvider(defaultChain.rpc_url);
console.log('Default provider :', defaultProvider);

const initialState: Web3State = {
  provider: defaultProvider,
  isLoggedIn: false,
  chain: defaultChain
};

export const web3Slice: Slice = createSlice({
  name: "web3",
  initialState,
  reducers: {
    updateProvider: (state, action) => {
      state.provider = action.payload;
    },
    updateAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    updateChain: (state, action: PayloadAction<Network>) => {
      state.chain = action.payload;
    },
    updateWeb3Modal: (state, action: PayloadAction<Web3Modal>) => {
      state.web3Modal = action.payload;
    },
    reset: () => initialState,
  },
});

export const {
  updateProvider,
  updateAccount,
  updateChain,
  updateWeb3Modal,
  setLoggedIn,
  reset,
} = web3Slice.actions;

export default web3Slice.reducer;
