import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import useWeb3 from "./useWeb3";

import daiAbi from "../resources/contracts/DaiToken.json";
import abi from "../resources/contracts/SinglePlayerCommit.json";

//TODO contracts keep refreshing
const useContracts = () => {
  const { chain, provider } = useWeb3();
  const [daiContract, setDaiContract] = useState<Contract>();
  const [spcContract, setSpcContract] = useState<Contract>();

  useEffect(() => {
    if (chain && provider) {
      const dai: Contract = new ethers.Contract(
        chain.daiAddress,
        daiAbi,
        provider.getSigner()
      );
      const spc: Contract = new ethers.Contract(
        chain.spcAddress,
        abi,
        provider.getSigner()
      );

      console.log("SPC contract: ", spc);

      setDaiContract(dai);
      setSpcContract(spc);
    }
  }, [provider]);

  // useEffect(() => {
  //   if (daiContract && spcContract) {
  //     console.log("ADDING SIGNER TO CONTRACTS: ", provider.getSigner());
  //     const dai: Contract = daiContract.connect(provider);
  //     const spc: Contract = spcContract.connect(provider);

  //     console.log("SIGNERS CONNECTED: ", dai);
  //     setDaiContract(dai);
  //     setSpcContract(spc);
  //   }
  // }, [provider]);

  return { daiContract, spcContract };
};

export default useContracts;
