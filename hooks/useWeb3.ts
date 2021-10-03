import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppDispatch } from "../redux/store";
import {
  updateTransactions,
  TransactionState,
} from "../redux/transactions/transactionSlice";
import { ethers, Transaction } from "ethers";
import Web3Modal from "web3modal";
import {
  deriveChainId,
  deriveSelectedAddress,
  getProviderOptions,
} from "../utils/web3Modal";
import { chainByNetworkId, chainByID } from "../utils/chain";


const Web3Instance = () => {
  const [provider, setProvider] = useState<any>();
  const [chain, setChain] = useState<Network>();
  const [account, setAccount] =  useState<string>();
  const transactions: TransactionState = useSelector(
    (state: RootState) => state.transactions
  );

  const hasListeners: any = useRef(null);
  const dispatch = useAppDispatch();


  const connectProvider = async () => {
    const providerOptions = getProviderOptions();

    //Provideroptions will be false when e.g. MetaMask is connected to an unsupported network
    if (!providerOptions) {
      window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      return;
    }

    const web3Modal = new Web3Modal({
      network: "matic",
      providerOptions,
      cacheProvider: true,
      theme: "dark",
    });

    const provider: any = await web3Modal.connect();
    const chainId = await deriveChainId(provider);
    console.log("CHAIN ID: ", chainId)
    const chain = chainByID(chainId)
    console.log("Chain: ", chain)
    setChain(chain)
    
    console.log("connecting provider");
    const web3: any = new ethers.providers.Web3Provider(provider);
    console.log("web3: ", web3);
    setProvider(web3)
    setAccount(web3.provider.selectedAddress)

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
        provider?.currentProvider.removeListener(
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
    provider,
    transactions,
    getTransaction,
    requestWallet,
    storeTransactionToState,
  } = Web3Instance();

  return {
    account,
    chain,
    provider,
    transactions,
    getTransaction,
    requestWallet,
    storeTransactionToState,
  };
};

export default useWeb3;
