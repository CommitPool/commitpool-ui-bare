import React from "react";

import { StyleSheet, View, TextInput } from "react-native";
import { Text } from "..";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface DistanceSelector {
  text: string;
}

const DistanceSelector = ({ text }: DistanceSelector) => {
  const { commitment, setCommitment } = useCommitPool();

  const onDistanceInput = (value: string) => {
    const distance: number = Number.parseFloat(value);
    if (!isNaN(distance) && distance > 0) {
      setCommitment({ ...commitment, goalValue: distance });
    }
  };

  return (
    <View style={styles.distanceSelector}>
      <Text text={text} />
      <View style={styles.unitInput}>
        <TextInput
          defaultValue={commitment?.goalValue?.toString()}
          keyboardType={"number-pad"}
          style={styles.textInput}
          onChangeText={(value) => onDistanceInput(value)}
        />
        <Text text="miles" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  distanceSelector: {
    flex: 1,
    flexDirection: "column",
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
  unitInput: {
    margin: 15,
    flexDirection: "row"
  }
});

export default DistanceSelector;
