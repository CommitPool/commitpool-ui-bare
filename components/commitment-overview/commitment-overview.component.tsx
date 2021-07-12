import React, { Fragment } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

import {
  Text,
  ActivitySelector,
  DistanceSelector,
  DateFromTo,
} from "../../components";

import strings from "../../resources/strings";
import StakeBox from "../stake-box/stake-box.component";
import { getActivityName } from "../../utils/commitment";
import { parseSecondTimestampToFullString} from "../../utils/dateTime"
import useActivities from "../../hooks/useActivities";

interface CommitmentOverviewProps {
  editing: boolean;
}

//TODO Activity selector to front, now disappears behind distance field
const CommitmentOverview = ({ editing }: CommitmentOverviewProps) => {
  const { activities } = useActivities();
  const commitment: Commitment = useSelector(
    (state: RootState) => state.commitpool.commitment
  );

  const activityName: string =
    getActivityName(commitment.activityKey, activities) || "";

  return (
    <View style={styles.commitment}>
      {editing ? (
        <Fragment>
          <ActivitySelector
            text={strings.activityGoal.setUp.activitySelector}
          />
          <DistanceSelector
            text={strings.activityGoal.setUp.distanceSelector}
          />
          <DateFromTo />
          <StakeBox />
        </Fragment>
      ) : (
        <Fragment>
          <Text text={strings.confirmation.commitment.text} />
          <View style={styles.commitmentValues}>
            <Text
              text={`${strings.confirmation.commitment.activity} ${activityName}`}
            />
            <Text
              text={`${strings.confirmation.commitment.distance} ${commitment.goalValue} miles`}
            />
            <Text
              text={`${
                strings.confirmation.commitment.startDate
              } ${parseSecondTimestampToFullString(commitment.startTime)}`}
            />
            <Text
              text={`${
                strings.confirmation.commitment.endDate
              } ${parseSecondTimestampToFullString(commitment.endTime)}`}
            />
          </View>
          <View style={styles.commitmentValues}>
            <Text text={strings.confirmation.commitment.stake} />

            <Text text={`${commitment.stake} DAI`} />
          </View>
        </Fragment>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commitment: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  commitmentValues: {
    flex: 1,
    marginTop: 20,
    alignContent: "flex-start",
    alignItems: "center",
  },
});

export default CommitmentOverview;
