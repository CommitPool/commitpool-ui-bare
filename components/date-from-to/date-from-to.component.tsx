import React, { Fragment, useEffect, useState } from "react";

import { StyleSheet, View, TextInput } from "react-native";

import { Text } from "..";

import { DateTime } from "luxon";

import { parseSecondTimestampToFullString } from "../../utils/dateTime";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface DateFromTo {
  children?: React.ReactNode;
}

const DateFromTo = ({ children }: DateFromTo) => {
  const [startIn, setStartIn] = useState<string>("0");
  const [endIn, setEndIn] = useState<string>("7");

  const { commitment, setCommitment } = useCommitPool();

  useEffect(() => {
    const updateDates = () => {
      const [startTime, endTime] = calculateStartAndEnd(startIn, endIn);
      console.log("Setting commitment: ", {
        ...commitment,
        startTime,
        endTime,
      });
      setCommitment({ ...commitment, startTime, endTime });
    };

    updateDates();
  }, [startIn, endIn]);

  const calculateStartAndEnd = (
    _start: string,
    _end: string
  ): [number, number] => {
    const start: number = Number(_start);
    const end: number = Number(_end);
    let startTimestamp: number;
    let endTimestamp: number;
    if (start === 0) {
      startTimestamp = DateTime.now().toSeconds();
      endTimestamp = DateTime.now()
        .plus({ days: Number(_end) })
        .startOf("day")
        .toSeconds();
    } else if (start > 0) {
      startTimestamp = DateTime.now()
        .plus({ days: start })
        .startOf("day")
        .toSeconds();
      endTimestamp = DateTime.fromSeconds(startTimestamp)
        .plus({ days: end })
        .endOf("day")
        .toSeconds();
    } else if (commitment?.startTime && commitment?.endTime) {
      startTimestamp = commitment.startTime;
      endTimestamp = commitment.endTime;
    } else {
      startTimestamp = DateTime.now().toSeconds();
      endTimestamp = DateTime.fromSeconds(startTimestamp)
        .plus({ days: 7 })
        .set({ hour: 23, minute: 59 })
        .toSeconds();
    }

    return [startTimestamp, endTimestamp];
  };

  return (
    <Fragment>
      <View style={styles.dateInput}>
        <Text text={"Starting in"} />
        <TextInput
          defaultValue={startIn}
          keyboardType={"number-pad"}
          style={styles.textInput}
          onChangeText={(value) => setStartIn(value)}
        />
        <Text text={"days for"} />
        <TextInput
          defaultValue={endIn}
          keyboardType={"number-pad"}
          style={styles.textInput}
          onChangeText={(value) => setEndIn(value)}
        />
        <Text text={"days"} />
      </View>
      <View>
        <Text
          text={`Starts on: ${parseSecondTimestampToFullString(
            commitment?.startTime
          )} `}
          style={styles.dateView}
        />
        <Text
          text={`Ends on:  ${parseSecondTimestampToFullString(
            commitment?.endTime
          )}`}
          style={styles.dateView}
        />
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  dateInput: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dateView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    backgroundColor: "white",
    fontSize: 14,
    height: 28,
    width: 75,
    textAlign: "center",
    borderRadius: 6,
  },
});

export default DateFromTo;
