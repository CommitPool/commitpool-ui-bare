import { useEffect, useState } from "react";
import { useCommitPool } from "../contexts/commitPoolContext";
import useStravaAthlete from "./useStravaAthlete";

const useStravaData = () => {
    
    const [progress, setProgress] = useState<number>(0) 
    const { commitment } = useCommitPool();
    const { accessToken } = useStrava();

    useEffect(() => {
        const getActivity = async (
          commitment: Commitment,
          accessToken: string,
          activityName: string
        ) => {
          return fetch(
            "https://test2.dcl.properties/activities?startTime=" +
              commitment.startTime +
              "&endTime=" +
              commitment.endTime +
              "&type=" +
              activityName +
              "&accessToken=" +
              accessToken,
            {
              method: "GET",
              headers: {
                // "Content-Type": "application/json",
                Authorization: "Bearer: " + accessToken,
              },
            }
          )
            .then((res) => res.json())
            .then((json) => {
              return json.total;
            });
        };
    
        if (accessToken && commitment && activityName !== "") {
          getActivity(commitment, accessToken, activityName).then((total) => {
            console.log(total, commitment.goalValue, total / commitment.goalValue);
            const _progress = (((total / 100) / commitment.goalValue) * 100) | 0;
            setProgress(_progress);
          });
        }
      }, [commitment, accessToken]);

return { progress }}

export default useStravaData;