import { ethers } from "ethers";

const getActivityName = (
  activityKey: string,
  activities: Activity[]
): string => {
  const activity = activities.find((activity) => activity.key === activityKey);
  return activity?.name || "";
};

const formatActivities = (activities: Activity[]): DropdownItem[] => {
  const formattedActivities = activities.map((act: Activity) => {
    if (act.name === "Run") {
      return {
        label: "Run 🏃‍♂️",
        value: act.key,
      };
    } else if (act.name === "Ride") {
      return {
        label: "Ride 🚲",
        value: act.key,
      };
    } else {
      return {
        label: act.name,
        value: act.key,
      };
    }
  });

  return formattedActivities;
};

const parseCommitmentFromContract = (
  commitment: any
): Commitment => {
  const _commitment: Commitment = {
    activityKey: commitment.activityKey,
    goalValue: Number.parseFloat(commitment.goalValue) / 100,
    reportedValue: Number.parseFloat(commitment.reportedValue) / 100,
    endTime: Number.parseFloat(commitment.endTime.toString()),
    startTime: Number.parseFloat(commitment.startTime.toString()),
    stake: Number.parseFloat(ethers.utils.formatEther(commitment.stake)),
    exists: commitment.exists,
    met: commitment.met,
    unit: "mi",
  };
  console.log("Parsed commitment: ", _commitment);
  return _commitment;
};

const validActivityKey = (
  commitment: Commitment,
  activities: Activity[]
): boolean => {
  return (
    activities.find((activity) => activity.key === commitment.activityKey) !==
    undefined
  );
};

const validActivityParameters = (
  commitment: Commitment,
  activities: Activity[]
): boolean => {
  return (
    validActivityKey(commitment, activities) &&
    validStartEndTimestamps(commitment) &&
    commitment.goalValue > 0
  );
};

const validStartEndTimestamps = (commitment: Commitment): boolean => {
  const nowInSeconds = new Date().getTime() / 1000;

  return (
    commitment.endTime > commitment.startTime &&
    commitment.endTime > nowInSeconds
  );
};

const validCommitmentRequest = (
  commitment: Commitment,
  activities: Activity[]
): boolean => {
  return (
    validActivityParameters(commitment, activities) && commitment.stake > 0
  );
};

const getCommitmentRequestParameters = (commitment: Commitment) => {
  const _activityKey: string = commitment.activityKey;
  const _goalValue: number = Math.floor(commitment.goalValue);
  const _startTime: number = Math.ceil(commitment.startTime);
  const _endTime: number = Math.ceil(commitment.endTime);
  const _stake = ethers.utils.parseEther(commitment.stake.toString());
  const _depositAmount = _stake;
  return {
    _activityKey,
    _goalValue,
    _startTime,
    _endTime,
    _stake,
    _depositAmount,
  };
};

export {
  formatActivities,
  getActivityName,
  getCommitmentRequestParameters,
  parseCommitmentFromContract,
  validCommitmentRequest,
  validActivityParameters,
};
