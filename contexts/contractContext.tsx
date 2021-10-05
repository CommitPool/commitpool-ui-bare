import React, { createContext, useContext, useEffect, useState } from "react";
import { useInjectedProvider } from "./injectedProviderContext";
import daiAbi from "../resources/contracts/DaiToken.json";
import spcAbi from "../resources/contracts/SinglePlayerCommit.json";
import { Contract, ethers } from "ethers";

type ContractContextType = {
  spcContract?: Contract;
  daiContract?: Contract;
};

export const ContractContext = createContext<ContractContextType>({
  spcContract: undefined,
  daiContract: undefined,
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

  const { injectedChain, injectedProvider } = useInjectedProvider();

  console.log("DAI contract: ", daiContract);
  console.log("SPC contract: ", spcContract);

  useEffect(() => {
    console.log("Loading contract");

    const initContract = async () => {
      try {
        const _daiContract: Contract = new ethers.Contract(
          daiAddrs[injectedChain.network],
          daiAbi,
          injectedProvider
        );

        const _spcContract: Contract = new ethers.Contract(
          spcAddrs[injectedChain.network],
          spcAbi,
          injectedProvider
        );
        setDaiContract(_daiContract);
        setSpcContract(_spcContract);
      } catch (e) {
        console.error(`Could not init contract`);
      }
    };

    if (injectedProvider && injectedChain?.network) {
      initContract();
    }
  }, [injectedProvider, injectedChain]);

  useEffect(() => {
    if (injectedProvider && daiContract && spcContract) {
      console.log(
        "Updating contract with signer from: ",
        injectedProvider
      );
      const _daiContract = daiContract.connect(injectedProvider.provider);
      const _spcContract = spcContract.connect(injectedProvider.provider);
      setDaiContract(_daiContract);
      setSpcContract(_spcContract);
    }
  }, [injectedProvider]);

  return (
    <ContractContext.Provider
      value={{ daiContract, spcContract}}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const { spcContract, daiContract } =
    useContext(ContractContext);
  return { spcContract, daiContract };
};
