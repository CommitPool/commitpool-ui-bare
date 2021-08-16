import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { DateTime } from "luxon";

interface CommitpoolState {
  commitment: Commitment;
  activities: Activity[];
  activitySet: boolean;
  stakeSet: boolean;
}

const initialState: CommitpoolState = {
  commitment: {
    activityKey: "",
    goalValue: 0,
    unit: "mi",
    startTime: DateTime.now().toSeconds(),
    endTime: DateTime.now().toSeconds(),
    stake: 0,
    reportedValue: 0,
    met: false,
    exists: false,
  },
  activities: [],
  activitySet: false,
  stakeSet: false,
};

export const commitpoolSlice: Slice = createSlice({
  name: "commitpool",
  initialState,
  reducers: {
    updateCommitment: (state, action: PayloadAction<Partial<Commitment>>) => {
      state.commitment = {
        ...state.commitment,
        ...action.payload,
      };
    },
    updateActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    updateActivitySet: (state, action: PayloadAction<boolean>) => {
      state.activitySet = action.payload;
    },
    updateStakeSet: (state, action: PayloadAction<boolean>) => {
      state.stakeSet = action.payload;
    },
    reset: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  updateCommitment,
  updateActivities,
  updateActivitySet,
  updateStakeSet,
  reset,
} = commitpoolSlice.actions;

export default commitpoolSlice.reducer;
