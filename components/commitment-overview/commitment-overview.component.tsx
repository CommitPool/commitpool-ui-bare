import React, { Fragment } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { DateTime } from "luxon";

import {
  Text,
  ActivitySelector,
  DistanceSelector,
  DateFromTo,
} from "../../components";

import strings from "../../resources/strings";
import StakeBox from "../stake-box/stake-box.component";

interface CommitmentOverviewProps {
  editing: boolean;
}

const CommitmentOverview = ({ editing }: CommitmentOverviewProps) => {
  const commitment: Commitment = useSelector(
    (state: RootState) => state.commitpool.commitment
  );

  const activities: Activity[] = useSelector(
    (state: RootState) => state.commitpool.activities
  );

  //TODO refactor into utils
  const getActivityName = (activityKey: string, activities: Activity[]) => {
    const activity = activities.find(
      (activity) => activity.key === activityKey
    );
    return activity?.name;
  };

  const activityName: string =
    getActivityName(commitment.activityKey, activities) || "";

  return (
    <View style={styles.commitment}>
      {editing ? (
        <Fragment>
          <Text text="EDITING" />
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
              } ${DateTime.fromSeconds(commitment.startTime).toFormat(
                "yyyy MMMM dd"
              )}`}
            />
            <Text
              text={`${
                strings.confirmation.commitment.endDate
              } ${DateTime.fromSeconds(commitment.endTime).toFormat(
                "yyyy MMMM dd"
              )}`}
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
