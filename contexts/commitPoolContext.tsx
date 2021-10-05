import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, Commitment, DropdownItem } from "../types";
import { useCurrentUser } from "./currentUserContext";
import { useContracts } from "./contractContext";
import {
  formatActivities,
  parseCommitmentFromContract,
  validActivityParameters,
} from "../utils/commitment";

type CommitPoolContextType = {
  activities?: Activity[];
  commitment?: Partial<Commitment>;
  formattedActivities?: DropdownItem[];
  setCommitment: (commitment: Partial<Commitment>) => void;
};

export const CommitPoolContext = createContext<CommitPoolContextType>({
  activities: [],
  commitment: {},
  formattedActivities: [],
  setCommitment: (commitment: Partial<Commitment>) => {},
});

interface CommitPoolProps {
  children: any;
}

export const CommitPoolContextProvider: React.FC<CommitPoolProps> = ({
  children,
}: CommitPoolProps) => {
  const [activities, setActivities] = useState<Activity[]>();
  const [commitment, setCommitment] = useState<Partial<Commitment>>();
  const [formattedActivities, setFormattedActivities] =
    useState<DropdownItem[]>();
  const { currentUser } = useCurrentUser();
  const { spcContract } = useContracts();

  const refreshCommitment = async () => {
    if (currentUser.attributes?.["custom:account_address"] && spcContract) {
      const _address = currentUser.attributes["custom:account_address"];
      console.log(`Checking for commitment for account ${_address}`);
      const commitment = await spcContract.commitments(_address);
      const _commitment: Partial<Commitment> =
        parseCommitmentFromContract(commitment);
      setCommitment(_commitment);
    }
  };

  //Check for commitment when user is logged in
  useEffect(() => {
    refreshCommitment();
  }, [currentUser, spcContract]);

  useEffect(() => {
    if (spcContract) {
      console.log("GETTING ACTIVITIES");
      const buildActivityArray = async () => {
        const _activities: Activity[] = [];
        let loading: boolean = true;
        let index: number = 0;

        while (loading) {
          try {
            const key = await spcContract.activityKeyList(index);
            const activity = await spcContract.activities(key);
            if (activity.exists && activity.allowed) {
              const clone = Object.assign({}, activity);
              clone.key = key;
              clone.name = activity.name;
              _activities.push(clone as Activity);
            }
            index++;
          } catch (error) {
            loading = false;
          }
        }

        return _activities;
      };

      buildActivityArray()
        .then((array) => {
          console.log("ActivityArray: ", array);
          setActivities(array);
        })
        .catch((e) => console.log("Error getting activities: ", e));
    }
  }, [spcContract]);

  //Format activities for dropdown after retrieving from contract
  useEffect(() => {
    console.log("FORMATTING ACTIVITIES");
    if (activities && activities?.length > 0) {
      const _formattedActivities: DropdownItem[] = formatActivities(activities);
      setFormattedActivities(_formattedActivities);
    }
  }, [activities]);

  //Check activity parameters
  useEffect(() => {
    if (activities && commitment) {
      if (
        validActivityParameters(commitment, activities) &&
        !commitment.activitySet
      ) {
        setCommitment({ ...commitment, activitySet: true });
      } else if (
        !validActivityParameters(commitment, activities) &&
        commitment.activitySet
      ) {
        setCommitment({ ...commitment, activitySet: false });
      }
    }
  }, [commitment]);

  return (
    <CommitPoolContext.Provider
      value={{ activities, commitment, formattedActivities, setCommitment }}
    >
      {children}
    </CommitPoolContext.Provider>
  );
};

export const useCommitPool = () => {
  const { activities, commitment, formattedActivities, setCommitment } =
    useContext(CommitPoolContext);
  return { activities, commitment, formattedActivities, setCommitment };
};
