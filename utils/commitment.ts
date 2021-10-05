import { ethers } from "ethers";
import { Activity, Commitment, DropdownItem } from "../types";

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

const parseCommitmentFromContract = (commitment: any): Partial<Commitment> => {
  const _commitment: Partial<Commitment> = {
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

const validCommitmentRequest = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  return (
    validActivityParameters(commitment, activities) && validStake(commitment)
  );
};

const validActivityParameters = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  return (
    validActivityKey(commitment, activities) &&
    validStartEndTimestamps(commitment) &&
    validGoalValue(commitment)
  );
};

const validActivityKey = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  if (commitment?.activityKey) {
    return (
      activities.find((activity) => activity.key === commitment.activityKey) !==
      undefined
    );
  }

  return false;
};

const validStartEndTimestamps = (commitment: Partial<Commitment>): boolean => {
  const nowInSeconds = new Date().getTime() / 1000;

  if (commitment.endTime && commitment.startTime) {
    return (
      commitment.endTime > commitment.startTime &&
      commitment.endTime > nowInSeconds
    );
  }

  return false;
};

const validGoalValue = (commitment: Partial<Commitment>): boolean => {
  if (commitment.goalValue) {
    return commitment.goalValue > 0;
  }

  return false;
};

const validStake = (commitment: Partial<Commitment>): boolean => {
  if (commitment.stake) {
    return commitment.stake > 0;
  }

  return false;
};

const getCommitmentRequestParameters = (commitment: Commitment) => {
  const _activityKey: string = commitment.activityKey;
  const _goalValue: number = Math.floor(commitment.goalValue) * 100 || 0;
  const _startTime: number = Math.ceil(commitment.startTime) | 0;
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
