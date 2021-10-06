import React from "react";
import { StyleSheet, View } from "react-native";

import DropDownPicker from "react-native-dropdown-picker";
import { DropdownItem } from "../../types";

interface Picker {
  itemsToSelect: DropdownItem[];
  onSelect: any;
  children?: React.ReactNode;
}

//TODO set value of picker based on commitment in state
const Picker = ({ itemsToSelect , onSelect, children }: Picker) => {
  return (
    <View style={styles.container}>
      <DropDownPicker
        items={itemsToSelect}
        placeholder={"Click to select"}
        arrowStyle={styles.arrowStyle}
        containerStyle={styles.containerStyle}
        labelStyle={styles.labelStyle}
        itemStyle={styles.itemStyle}
        globalTextStyle={styles.textStyle}
        onChangeItem={(item) => onSelect(item.value)}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    margin: 15
  },
  arrowStyle: {
    marginRight: 5,
    marginLeft: 5,
  },
  containerStyle: {
    maxHeight: 40,
    minHeight: 50,
    minWidth: 149,
  },
  itemStyle: {
    justifyContent: "center",
  },
  labelStyle: {
    fontSize: 14,
    textAlign: "left",
    color: "#000",
  },
  textStyle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
  },
});

export default Picker;
