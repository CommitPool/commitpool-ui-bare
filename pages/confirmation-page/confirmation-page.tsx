import React, { Fragment, useEffect, useState } from "react";
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
import useCommitment from "../../hooks/useCommitment";
import useActivities from "../../hooks/useActivities";
import useContracts from "../../hooks/useContracts";
import useWeb3 from "../../hooks/useWeb3";
import useStravaAthlete from "../../hooks/useStravaAthlete";
import { ethers, Transaction, providers } from "ethers";

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
  const { commitment } = useCommitment();
  const { activities } = useActivities();

  const { athlete } = useStravaAthlete();

  const { account, provider, storeTransactionToState, transactions } =
    useWeb3();
  const { dai, singlePlayerCommit } = useContracts();
  const [tx, setTx] = useState(null);

  console.log("Connected SPC contract: ", singlePlayerCommit);
  console.log('Deposit And Commit TX in local sate: ', tx)

  const createCommitment = async () => {
    if (validCommitmentRequest(commitment, activities)) {
      const allowance = await dai.allowance(
        account,
        singlePlayerCommit.address
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
        await singlePlayerCommit
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
        await dai
          .approve(
            singlePlayerCommit.address,
            _commitmentParametersWithUserId._stake
          )
          .then((receipt: Transaction) =>
            storeTransactionToState({
              methodCall: "approve",
              txReceipt: receipt,
            })
          );
        await singlePlayerCommit
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

  useEffect(() => {
    const getTxFromChain = async () => {
      // if (transactions.transactions.depositAndCommit) {
      console.log(
        "depositAndCommit tx found: ",
        "0x521877a3bf0503a3c8044dce544e4e69b647a94b302b8cde4666f722a4f54b5e"
      );
      await provider
        .getTransactionReceipt(
          "0x521877a3bf0503a3c8044dce544e4e69b647a94b302b8cde4666f722a4f54b5e"
        )
        .then(setTx);
    };
    getTxFromChain();
  }, [transactions]);

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
