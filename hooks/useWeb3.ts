import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppDispatch } from "../redux/store";
import {
  reset,
  setLoggedIn,
  updateAccount,
  updateChain,
  updateContracts,
  updateProvider,
  updateWeb3Modal,
  Web3State,
} from "../redux/web3/web3Slice";
import {
  updateTransactions,
  TransactionState,
} from "../redux/transactions/transactionSlice";
import { ethers, Transaction } from "ethers";
import Web3Modal from "web3modal";
import { supportedChains } from "../utils/chain";
import {
  deriveChainId,
  deriveSelectedAddress,
  getProviderOptions,
} from "../utils/web3Modal";

const Web3Instance = () => {
  const dispatch = useAppDispatch();
  const { account, provider, isLoggedIn, chain } = useSelector(
    (state: RootState) => state.web3
  );
  const transactions: TransactionState = useSelector(
    (state: RootState) => state.transactions
  );
  // const { account, provider, isLoggedIn, chain } = web3;

  const hasListeners: any = useRef(null);

  const connectProvider = async () => {
    const providerOptions = getProviderOptions();

    const defaultModal: Web3Modal = new Web3Modal({
      network: "matic", // optional
      cacheProvider: true, // optional
      providerOptions, // required
      theme: "dark",
    });

    console.log("defaultModal: ", defaultModal);
    console.log("providerOption: ", providerOptions);

    //Provideroptions will be false when e.g. MetaMask is connected to an unsupported network
    if (!providerOptions) {
      dispatch(reset({}));
      window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      return;
    }

    const web3Modal = new Web3Modal({
      providerOptions,
      cacheProvider: true,
      theme: "dark",
    });

    const provider = await web3Modal.connect();
    const chainId = await deriveChainId(provider);
    console.log("ChainId: ", chainId);

    const chain = {
      ...supportedChains[chainId],
      chainId,
    };
    console.log("connecting provider");
    const web3: any = new ethers.providers.Web3Provider(provider);
    console.log("web3: ", web3);

    console.log("Dispatching updated Web3 config");
    console.log("Provider: ", web3);
    console.log("Address: ", web3.provider.selectedAddress);
    dispatch(updateProvider(web3));
    dispatch(updateAccount(web3.provider.selectedAddress));
    dispatch(updateChain(chain));
    dispatch(updateWeb3Modal(web3Modal));
    dispatch(setLoggedIn(true));

    // //TODO Timeout for Torus provider to populate the selectedAddress
    // setTimeout(() => {
    //   if (web3?.provider?.selectedAddress) {
    //     console.log("Dispatching updated Web3 config");
    //     console.log("Provider: ", web3);
    //     console.log("Address: ", web3.provider.selectedAddress);
    //     dispatch(updateProvider(web3));
    //     dispatch(updateAccount(web3.provider.selectedAddress));
    //     dispatch(updateChain(chain));
    //     dispatch(updateWeb3Modal(web3Modal));
    //     dispatch(setLoggedIn(true));
    //   }
    // }, 2000);
  };

  useEffect(() => {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      connectProvider();
    }
  }, []);

  useEffect(() => {
    const handleChainChange = () => {
      console.log("CHAIN CHANGE");
      connectProvider();
    };
    const accountsChanged = () => {
      console.log("ACCOUNT CHANGE");
      connectProvider();
    };

    const unsub = () => {
      if (provider?.currentProvider) {
        provider.currentProvider.removeListener(
          "accountsChanged",
          handleChainChange
        );
        provider.currentProvider.removeListener(
          "chainChanged",
          accountsChanged
        );
      }
    };

    if (provider?.currentProvider && !hasListeners.current) {
      provider.currentProvider
        .on("accountsChanged", accountsChanged)
        .on("chainChanged", handleChainChange);
      hasListeners.current = true;
    }
    return () => unsub();
  }, [provider]);

  const requestWallet = async () => {
    connectProvider();
  };

  const storeTransactionToState = (txDetails: TransactionDetails) => {
    dispatch(updateTransactions(txDetails));
  };

  const getTransaction = (
    methodCall: TransactionTypes
  ): Transaction | undefined => {
    return transactions.transactions[methodCall]?.txReceipt || undefined;
  };

  return {
    account,
    chain,
    isLoggedIn,
    provider,
    transactions,
    getTransaction,
    requestWallet,
    storeTransactionToState,
  };
};

const useWeb3 = () => {
  const {
    account,
    chain,
    isLoggedIn,
    provider,
    transactions,
    getTransaction,
    requestWallet,
    storeTransactionToState,
  } = Web3Instance();

  return {
    account,
    chain,
    isLoggedIn,
    provider,
    transactions,
    getTransaction,
    requestWallet,
    storeTransactionToState,
  };
};

export default useWeb3;
