import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../redux/store";

import { formatActivities } from "../utils/commitment";
import { Contract } from "ethers";

import { updateActivities } from "../redux/commitpool/commitpoolSlice";
import useContracts from "./useContracts";

const useActivities = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const activities: Activity[] = useSelector(
    (state: RootState) => state.commitpool.activities
  );

  const { spcContract } = useContracts();

  const [formattedActivities, setFormattedActivities] = useState<
    DropdownItem[]
  >([]);

  console.log("spcContract: ", spcContract);

  const dispatch = useAppDispatch();

  // Get activities from contract
  useEffect(() => {
    if (spcContract && loading) {
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

      buildActivityArray().then((array) => {
        console.log("ActivityArray: ", array);
        dispatch(updateActivities(array));
        setLoading(false);
      });
    }
  }, [spcContract]);

  //Format activities for dropdown after retrieving from contract
  useEffect(() => {
    if (activities.length > 0) {
      const _formattedActivities: DropdownItem[] = formatActivities(activities);
      setFormattedActivities(_formattedActivities);
    }
  }, [activities]);

  return { activities, formattedActivities };
};

export default useActivities;
