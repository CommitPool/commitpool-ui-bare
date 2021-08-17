import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, Image, ActivityIndicator } from "react-native";

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
import { Transaction, providers } from "ethers";
import useTransactions from "../../hooks/useTransactions";

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
  const { account, provider } = useWeb3();
  const { getTransaction, storeTransactionToState, transactions } =
    useTransactions();
  const { dai, singlePlayerCommit } = useContracts();

  const [awaitingTx, setAwaitingTx] = useState<boolean>(true);

  const methodCall: TransactionTypes = "depositAndCommit";
  let tx: any = getTransaction(methodCall);

  //TODO txReceipt had transactionHash instead of hash
  const txUrl: string = tx?.hash ? `https://polygonscan.com/tx/${tx.hash}` : ``;

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
          .then((tx: Transaction) => {
            storeTransactionToState({
              methodCall,
              tx,
            });
            setAwaitingTx(true);
          });
      } else {
        await dai
          .approve(
            singlePlayerCommit.address,
            _commitmentParametersWithUserId._stake
          )
          .then((tx: Transaction) =>
            storeTransactionToState({
              methodCall: "approve",
              tx,
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
          .then((tx: Transaction) => {
            storeTransactionToState({
              methodCall,
              tx,
            });
            setAwaitingTx(true);
          });
      }
    } else {
      setPopUpVisible(true);
    }
  };

  //Check Tx state on chain and if not picked up by miner set to monitor tx
  useEffect(() => {
    const getTxReceiptFromChain = async () => {
      if (awaitingTx && tx?.hash) {
        console.log(
          "depositAndCommit tx found: ",
          tx.hash
        );
        await provider
          .waitForTransaction(
            tx.hash,
            1
          )
          .then((tx) => {
            console.log("TX FOUND: ", tx);
            storeTransactionToState({ methodCall, tx });
          });
      }
    };

    getTxReceiptFromChain();
  }, [awaitingTx, tx]);

  //TODO Tx failed Toast
  useEffect(() => {
    console.log("FOUND UPDATED TX: ", tx);
    const status = tx?.status;
    console.log("STATUS: ", status);
    if (status === 0) {
      console.log("something went wrong: ");
      console.log(`https://polygonscan.com/tx/${tx.transactionHash}`)
      setAwaitingTx(false);
    } else if (status === 1) {
      console.log("tx mined succesfully: ", txUrl);
      setAwaitingTx(false);
      navigation.navigate("Track");
    }
  }, [tx]);

  return (
    <LayoutContainer>
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.confirmation.alert}
      />
      <ProgressBar size={4 / 6} />
      {awaitingTx ? (
        <Fragment>
          <Text text="Awaiting transaction processing" />
          <ActivityIndicator size="large" color="#ffffff" />
          <a
            style={{ color: "white", fontFamily: "OpenSans_400Regular" }}
            href={txUrl}
            target="_blank"
          >
            View transaction on Polygonscan
          </a>
        </Fragment>
      ) : (
        <Fragment>
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
        </Fragment>
      )}
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
