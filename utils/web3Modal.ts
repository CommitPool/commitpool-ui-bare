import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { chainByID, chainByNetworkId } from "./chain";

const isInjected = () => {
  const id = window.ethereum?.chainId;
  console.log("ID: ", id);
  return id;
};

export const attemptInjectedChainData = () =>
  isInjected() ? chainByID(window.ethereum.chainId) : chainByID("0x1");

const addNetworkProviders = (chainData: Network) => {
  const allProviders: any = {};
  if (!chainData) {
    // this will fire if window.ethereum exists, but the user is on the wrong chain
    return false;
  }
  const providersToAdd = chainData.providers;
  if (providersToAdd.includes("walletconnect")) {
    allProviders.walletconnect = {
      network: chainData.network,
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: `https://mainnet.infura.io/v3/3c072dd341bb4e45858038e146195ae1`,
          4: `https://rinkeby.infura.io/v3/3c072dd341bb4e45858038e146195ae1`,
          42: `https://kovan.infura.io/v3/3c072dd341bb4e45858038e146195ae1`,
          137: "https://polygon-mumbai.infura.io/v3/3c072dd341bb4e45858038e146195ae1",
        },
      },
    };
  }

  if (providersToAdd.includes("torus")) {
    console.log("chainData for Torus provider: ", chainData);
    allProviders.torus = {
      // network: chainData.network,
      package: Torus,
      options: {
        networkParams: {
          host: chainData.rpc_url,
          chainId: chainData.chain_id,
          networkId: chainData.network_id,
        },
        config: {
          buildEnv: "production",

          showTorusButton: true,
        },
      },
    };
  }

  return allProviders;
};

export const getProviderOptions = () =>
  addNetworkProviders(attemptInjectedChainData());

export const deriveChainId = async (provider: any) => {
  console.log("Deriving chain ID from: ", provider);
  if (provider.isMetaMask || provider.isTorus) {
    return provider.chainId;
  }
  if (provider.wc) {
    return chainByNetworkId(provider.chainId).chain_id;
  }

};

export const deriveSelectedAddress = async (provider: any) => {
  console.log("Provider for address: ", provider);
  if (provider.isMetaMask) {
    return await provider.selectedAddress;
  }

  if (provider.isTorus) {
    return await provider.selectedAddress;
  }

  if (provider.wc) {
    return provider.accounts[0];
  }
  return null;
};
