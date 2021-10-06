import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CustomProgressBar {
  size: number
}

const CustomProgressBar = ({ size }: CustomProgressBar) => {
  const steps = [
    'Activity & Goal',
    'Set Stake',
    'Connect Data Source',
    'Deposit Funds',
    'Review & Commit',
    'Commited!'
  ]
  return (
    <View style={styles.progressBar}>
      {steps.map((item, index) => {
        return (
          <View key={index} style={styles.progressItem}>
            <Text style={[styles.progressText, size === (index + 1) ? styles.active : null]}>{item}</Text>
          </View>
        )
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxHeight: 52,
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(27px)",
    borderRadius: 10,
    margin: 10,
    top: -65
  },
  progressItem: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    padding: 7
  },
  progressText: {
    color: 'white',
    fontSize: 16
  },
  active: {
    textDecorationLine: 'underline'
  }
});

export default CustomProgressBar;
