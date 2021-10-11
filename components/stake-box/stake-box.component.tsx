import React, { Fragment } from "react";
import {
  StyleSheet,
  StyleProp,
  TextStyle,
  View,
  TextInput,
} from "react-native";

import { Text } from "..";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface StakeBoxProps {
  style?: StyleProp<TextStyle>;
}

const StakeBox = ({ style }: StakeBoxProps) => {
  const { commitment, setCommitment } = useCommitPool();

  //TODO toast on invalid input
  const onStakeInput = (stake: string) => {
    const _stake = Number.parseFloat(stake);
    if (!isNaN(_stake) && validStake(_stake)) {
      setCommitment({ ...commitment, stake: _stake, stakeSet: true });
    } else {
      setCommitment({ ...commitment, stake: undefined, stakeSet: false });
    }
  };

  return (
    <Fragment>
      <View style={styles.container}>
        <Text text={"Your stake amount"} />
        <View style={styles.valueInput}>
          <TextInput
            defaultValue={commitment?.stake?.toString()}
            keyboardType={"number-pad"}
            style={styles.textInput}
            onChangeText={(stake) => onStakeInput(stake)}
          />
          <Text text={`DAI`} />
        </View>
      </View>
      {commitment?.stake && commitment.stake >= 100 ? (
        <Text
          style={styles.textHighAlert}
          text={`You're staking ${commitment.stake.toString()} DAI. That's a big commitment!`}
        />
      ) : undefined}
    </Fragment>
  );
};

const validStake = (stake: number) => {
  return stake > 0;
};

const styles = StyleSheet.create({
  stakeBox: {
    color: "white",
    fontSize: 22,
    letterSpacing: 1,
    textAlign: "left",
    fontFamily: "OpenSans_400Regular",
    paddingRight: 10,
    paddingLeft: 10,
  },
  valueInput: {
    flexDirection: "row",
    marginTop: 20,
  },
  textHighAlert: {
    marginTop: 25,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: "white",
    fontSize: 14,
    height: 28,
    width: 75,
    textAlign: "center",
    borderRadius: 6,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StakeBox;
