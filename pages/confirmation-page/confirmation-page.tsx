import React, { Fragment, useState } from "react";
import { StyleSheet, View, Image } from "react-native";

import {
  LayoutContainer,
  Footer,
  Text,
  Button,
  ProgressBar,
  DialogPopUp,
  CommitmentOverview,
} from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";

import {
  validCommitmentRequest,
  getCommitmentRequestParameters,
} from "../../utils/commitment";
import { Transaction } from "ethers";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";

type ConfirmationPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Confirmation"
>;

type ConfirmationPageProps = {
  navigation: ConfirmationPageNavigationProps;
};

const ConfirmationPage = ({ navigation }: ConfirmationPageProps) => {
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const { commitment, activities } = useCommitPool();
  const { athlete } = useStrava();
  // const { storeTransactionToState } = useWeb3();
  const { currentUser} = useCurrentUser();
  const { daiContract, spcContract } = useContracts();

  const createCommitment = async () => {
    if (validCommitmentRequest(commitment, activities) && spcContract && daiContract) {
      const allowance = await daiContract.allowance(
        currentUser?.username,
        spcContract.address
      );

      const _commitmentParameters = getCommitmentRequestParameters(commitment);
      const _commitmentParametersWithUserId = {
        ..._commitmentParameters,
        _userId: String(athlete.id),
      };

      console.log(
        "Commitment request with user ID: ",
        _commitmentParametersWithUserId
      );

      if (allowance.gte(_commitmentParameters._stake)) {
        console.log("Submitting D&C tx")
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((receipt: Transaction) =>
            storeTransactionToState({
              methodCall: "depositAndCommit",
              txReceipt: receipt,
            })
          );
      } else {
        console.log("Getting allowance with DAI contract: ", daiContract)

        await daiContract
          .approve(
            spcContract.address,
            _commitmentParametersWithUserId._stake
          )
          .then((receipt: Transaction) =>
            storeTransactionToState({
              methodCall: "approve",
              txReceipt: receipt,
            })
          );

        console.log("Calling D&C with SPC contract: ", spcContract)
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((receipt: Transaction) =>
            storeTransactionToState({
              methodCall: "depositAndCommit",
              txReceipt: receipt,
            })
          )
          .then(() => {
            navigation.navigate("Track");
          });
      }
    } else {
      setPopUpVisible(true);
    }
  };

  return (
    <LayoutContainer>
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.confirmation.alert}
      />
      <ProgressBar size={4 / 6} />
      <Fragment>
        <Text
          text={`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}
        />
        <Image
          style={styles.tinyAvatar}
          source={{ uri: athlete?.profile_medium }}
        />
      </Fragment>
      <View style={styles.commitmentOverview}>
        <CommitmentOverview editing={editMode} />
        {editMode ? (
          <Button
            text="Set"
            onPress={() => {
              setEditMode(false);
            }}
          />
        ) : (
          <Button
            text="Edit"
            onPress={() => {
              setEditMode(true);
            }}
          />
        )}
      </View>
      <Footer>
        <Button
          text={strings.footer.back}
          onPress={() => navigation.goBack()}
        />
        <Button text={"Confirm"} onPress={async () => createCommitment()} />
        <Button
          text={strings.footer.help}
          onPress={() => navigation.navigate("Faq")}
          style={styles.helpButton}
        />
      </Footer>
    </LayoutContainer>
  );
};

const styles = StyleSheet.create({
  commitmentOverview: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tinyAvatar: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default ConfirmationPage;
