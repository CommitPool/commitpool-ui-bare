import React, { createContext, useContext, useEffect, useState } from "react";
import { useInjectedProvider } from "./injectedProviderContext";
import { Contract } from "web3-eth-contract";
import daiAbi from "../resources/contracts/DaiToken.json";
import spcAbi from "../resources/contracts/SinglePlayerCommit.json";

type ContractContextType = {
  spcContract?: Contract;
  daiContract?: Contract;
  setSpcContract: (contract: Contract) => void;
  setDaiContract: (contract: Contract) => void;
};

export const ContractContext = createContext<ContractContextType>({
  spcContract: undefined,
  daiContract: undefined,
  setSpcContract: (contract: Contract) => {},
  setDaiContract: (contract: Contract) => {},
});

interface ContractProps {
  children: any;
}

const spcAddrs: any = {
  matic: "0x91E17f2A995f7EB830057a2F83ADa3A50a37F20d",
  mumbai: "0x6B6FD55b224b25B2F56A10Ce670B097e66Fca136",
};

const daiAddrs: any = {
  matic: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  mumbai: "0x70d1F773A9f81C852087B77F6Ae6d3032B02D2AB",
};

export const ContractContextProvider: React.FC<ContractProps> = ({
  children,
}: ContractProps) => {
  const [spcContract, setSpcContract] = useState<Contract>();
  const [daiContract, setDaiContract] = useState<Contract>();

  const { injectedChain, web3Modal, injectedProvider } = useInjectedProvider();

  useEffect(() => {
    console.log("Loading contract");
    console.log("web3Modal", web3Modal);
    console.log("injectedChain", injectedChain);

    const initContract = async () => {
      console.log("network name", injectedChain.network);
      try {
        const _daiContract: Contract = await new injectedProvider.eth.Contract(
          daiAbi,
          daiAddrs[injectedChain.network]
        );

        const _spcContract: Contract = await new injectedProvider.eth.Contract(
          spcAbi,
          spcAddrs[injectedChain.network]
        );
        setDaiContract(_daiContract);
        setSpcContract(_spcContract);
      } catch (e) {
        console.error(`Could not init contract`);
      }
    };

    if (injectedProvider?.eth && injectedChain?.network) {
      initContract();
    }
  }, [injectedChain, web3Modal.web3]);

  return (
    <ContractContext.Provider
      value={{ daiContract, spcContract, setSpcContract, setDaiContract }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const { spcContract, setSpcContract, daiContract, setDaiContract } =
    useContext(ContractContext);
  return { spcContract, daiContract, setSpcContract, setDaiContract };
};
