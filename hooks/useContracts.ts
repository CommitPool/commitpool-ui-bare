import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import useWeb3 from "./useWeb3";

import daiAbi from "../resources/contracts/DaiToken.json";
import abi from "../resources/contracts/SinglePlayerCommit.json";

const useContracts = () => {
  const { chain, provider } = useWeb3();
  const [daiContract, setDaiContract] = useState<Contract>();
  const [spcContract, setSpcContract] = useState<Contract>();
  
  useEffect(() => {
    if (chain?.spcAddress && chain?.daiAddress) {
      const dai: Contract = new ethers.Contract(chain.daiAddress, daiAbi, provider);
      const spc: Contract = new ethers.Contract(chain.spcAddress, abi, provider);

      setDaiContract(dai);
      setSpcContract(spc);
    }
  }, [chain]);

  useEffect(() => {
    if (provider?.getSigner() && daiContract && spcContract) {
      const dai: Contract = daiContract.connect(provider.getSigner());
      const spc: Contract = spcContract.connect(provider.getSigner());

      setDaiContract(dai);
      setSpcContract(spc);
    }
  }, [provider]);

  return { daiContract, spcContract };
};

export default useContracts;
