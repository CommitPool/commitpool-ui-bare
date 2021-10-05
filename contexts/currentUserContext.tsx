import { Contract } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Network, User } from "../types";
import { useContracts } from "./contractContext";
import { useInjectedProvider } from "./injectedProviderContext";

type CurrentUserContextType = {
  currentUser: Partial<User>;
  setCurrentUser: (user: Partial<User>) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  currentUser: {},
  setCurrentUser: (user: Partial<User>) => {},
});

interface CurrentUserProps {
  children: any;
}

//TODO User network vs. Provider network
export const CurrentUserContextProvider: React.FC<CurrentUserProps> = ({
  children,
}: CurrentUserProps) => {
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const { injectedChain, address, injectedProvider } = useInjectedProvider();
  const { daiContract } = useContracts();

  useEffect(() => {
    const user: Partial<User> = createWeb3User(address, injectedChain);

    setCurrentUser(user);
  }, [injectedProvider, injectedChain, address]);

  useEffect(() => {
    if (currentUser && daiContract) {
      addUserBalances(currentUser, daiContract);
    }
  }, [currentUser]);

  const addUserBalances = async (
    currentUser: Partial<User>,
    daiContract: Contract
  ) => {
    const address: string | undefined =
      currentUser.attributes?.["custom:account_address"];

    if (injectedProvider && daiContract && address) {
      const nativeTokenBalance = await injectedProvider.getBalance(address);
      const daiBalance = await daiContract.balanceOf(address);
      setCurrentUser({ ...currentUser, nativeTokenBalance, daiBalance });
    }
  };

  const createWeb3User = (
    accountAddress: string | "",
    network: Network
  ): Partial<User> => {
    return {
      type: "web3",
      attributes: { "custom:account_address": accountAddress },
      network: network,
      username: accountAddress,
    };
  };

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  return { currentUser, setCurrentUser };
};
