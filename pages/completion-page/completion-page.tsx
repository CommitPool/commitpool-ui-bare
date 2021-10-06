import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import { LayoutContainer, Footer, Text, Button } from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";
import { Contract, Transaction } from "ethers";
import { TransactionTypes } from "../../types";
import { useContracts } from "../../contexts/contractContext";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";

type CompletionPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Completion"
>;

type CompletionPageProps = {
  navigation: CompletionPageNavigationProps;
};

const CompletionPage = ({ navigation }: CompletionPageProps) => {
  const { commitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { currentUser, latestTransaction, setLatestTransaction } = useCurrentUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);

  const methodCall: TransactionTypes = "processCommitmentUser";
  const txUrl: string = latestTransaction.txReceipt?.hash ? `https://polygonscan.com/tx/${latestTransaction.txReceipt?.hash}` : "No Transaction found";

  //Check is commitment was met
  useEffect(() => {
    if (loading && commitment?.reportedValue && commitment?.goalValue) {
      const _success: boolean =
        commitment.reportedValue > 0 &&
        commitment.reportedValue >= commitment.goalValue;
      setSuccess(_success);
      setLoading(false);
    }
  }, [commitment, loading]);

  const achievement: string = `You managed to ${commitment?.activityName} for ${commitment?.reportedValue} miles. You committed to ${commitment?.goalValue} miles`;

  const onProcess = async () => {
    if (currentUser?.username && spcContract) {
      console.log("Web3 logged in, calling processCommitmentUser()");
      await spcContract
        .processCommitmentUser()
        .then((txReceipt: Transaction) => {
          console.log("processCommitmentUserTX receipt: ", txReceipt);
          setLatestTransaction({
            methodCall,
            txReceipt,
          });
        });
    } else {
      console.log("Web3 not logged in, routing to login");
      navigation.navigate("Login");
    }
  };

  const listenForCommitmentSettlement = () => {
    if (spcContract) {
      spcContract.on(
        "CommitmentEnded",
        async (committer: string, met: boolean, amountPenalized: number) => {
          if (committer.toLowerCase() === currentUser?.username?.toLowerCase()) {
            navigation.navigate("ActivityGoal");
          }
        }
      );
    }
  };

  listenForCommitmentSettlement();

  return (
    <LayoutContainer>
      {success ? (
        <ConfettiCannon count={100} origin={{ x: 100, y: 0 }} />
      ) : undefined}
      {loading ? (
        <View style={styles.completionPage}>
          <Text text="Loading" />
        </View>
      ) : (
        <View style={styles.completionPage}>
          {success ? (
            <Fragment>
              <Text text={strings.completion.success} />
            </Fragment>
          ) : (
            <Text text={strings.completion.fail} />
          )}
          <Text text={achievement} />
        </View>
      )}
      {latestTransaction.methodCall === methodCall ? (
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
        <Button text="Process commitment" onPress={() => onProcess()} />
      )}
      <Footer>
        <Button
          text={strings.footer.back}
          onPress={() => navigation.goBack()}
        />
        <Button
          text={strings.footer.restart}
          onPress={() => navigation.navigate("ActivityGoal")}
        />
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
  completionPage: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default CompletionPage;
