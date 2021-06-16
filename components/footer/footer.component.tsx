import React from "react";
import { StyleSheet, View } from "react-native";

interface Footer {
  children?: React.ReactNode;
}

const Footer = ({ children }: Footer) => {
  return <View style={styles.footer}>{children}
  </View>;
};

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    maxHeight: 72,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
});

export default Footer;
