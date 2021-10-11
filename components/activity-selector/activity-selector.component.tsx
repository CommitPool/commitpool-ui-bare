import React from "react";

import { StyleSheet, View } from "react-native";
import { Text, DropDownPicker } from "..";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { DropdownItem } from "../../types";

interface ActivitySelectorProps {
  text: string;
}

const ActivitySelector = ({ text }: ActivitySelectorProps) => {
  const { formattedActivities, commitment, setCommitment } = useCommitPool();

  const onSelect = (activityKey: string) => {
    console.log("Setting commitment: ", { ...commitment, activityKey });
    setCommitment({ ...commitment, activityKey });
  };

  return (
    <View style={styles.activitySelector}>
      <Text text={text} />
      <DropDownPicker
        itemsToSelect={formattedActivities as DropdownItem[]}
        onSelect={onSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  activitySelector: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    margin: 18,
  },
});

export default ActivitySelector;
