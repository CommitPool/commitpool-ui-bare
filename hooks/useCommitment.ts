import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  updateCommitment,
  updateActivitySet,
} from "../redux/commitpool/commitpoolSlice";
import { RootState, useAppDispatch } from "../redux/store";
import { parseCommitmentFromContract } from "../utils/commitment";

import { getActivityName, validActivityParameters } from "../utils/commitment";

import useActivities from "./useActivities";
import useContracts from "./useContracts";
import useWeb3 from "./useWeb3";

const useCommitment = () => {
  const dispatch = useAppDispatch();
  const { activities } = useActivities();
  const { spcContract } = useContracts();
  const { account } = useWeb3();

  const commitment: Commitment = useSelector(
    (state: RootState) => state.commitpool.commitment
  );

  const activitySet: boolean = useSelector(
    (state: RootState) => state.commitpool.activitySet
  );

  const activityName: string =
    getActivityName(commitment.activityKey, activities) || "";

  const refreshCommitment = async () => {
    if (account && spcContract) {
      const commitment = await spcContract.commitments(account);
      const _commitment: Commitment = parseCommitmentFromContract(commitment);
      dispatch(updateCommitment({ ..._commitment }));
    }
  };

  useEffect(() => {
    if (activities.length > 0) {
      if (validActivityParameters(commitment, activities) && !activitySet) {
        dispatch(updateActivitySet(true));
      } else if (
        !validActivityParameters(commitment, activities) &&
        activitySet
      ) {
        dispatch(updateActivitySet(false));
      }
    }
  }, [commitment]);

  return { commitment, activityName, refreshCommitment };
};

export default useCommitment;
