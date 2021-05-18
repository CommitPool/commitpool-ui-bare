import React, { useState, useEffect } from "react";
import {useAppDispatch} from "../../redux/store";
import {
  updateDistance,
  updateUnit,
} from "../../redux/commitment/commitmentSlice";

import { StyleSheet, View, TextInput } from "react-native";
import { Text, ValueToggle } from "..";

interface DistanceSelector {
  text: string
}

const DistanceSelector = ({ text }: DistanceSelector) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const dispatch = useAppDispatch();

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
  };
  const toggleOptions: string[] = ["km", "mi"];

  useEffect(() => {
    isEnabled ? dispatch(updateUnit("mi")) : dispatch(updateUnit("km"));
  }, [isEnabled]);

  return (
    <View style={styles.distanceSelector}>
      <Text text={text} />
      <TextInput
        keyboardType={"number-pad"}
        style={styles.textInput}
        onChangeText={(value) => dispatch(updateDistance(value))}
      />
      <ValueToggle toggleOptions={toggleOptions} onToggle={toggleSwitch} />
    </View>
  );
};

const styles = StyleSheet.create({
  distanceSelector: {
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
    borderRadius: 20,
  },
});

export default DistanceSelector;