import React, { Fragment, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import {
  LayoutContainer,
  Footer,
  Text,
  Button,
  ProgressCircle,
  DialogPopUp,
} from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";
import strings from "../../resources/strings";
import { parseSecondTimestampToFullString } from "../../utils/dateTime";

import useActivities from "../../hooks/useActivities";
import { BigNumber, Contract, Transaction } from "ethers";
import useCommitment from "../../hooks/useCommitment";
import useContracts from "../../hooks/useContracts";
import useWeb3 from "../../hooks/useWeb3";
import useStravaAthlete from "../../hooks/useStravaAthlete";
import useStravaData from "../../hooks/useStravaData";
import useTransactions from "../../hooks/useTransactions";

type TrackPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Track"
>;

type TrackPageProps = {
  navigation: TrackPageNavigationProps;
};

const TrackPage = ({ navigation }: TrackPageProps) => {
  // useStravaRefresh();
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const { activities } = useActivities();
  const { commitment, activityName, refreshCommitment } = useCommitment();
  const { singlePlayerCommit } = useContracts();
  const { account } = useWeb3();
  const { athlete, stravaIsLoggedIn } = useStravaAthlete();
  const { progress } = useStravaData();
  const { transactions, getTransaction, storeTransactionToState } = useTransactions();

  const methodCall: TransactionTypes = "requestActivityDistance";
  const tx: Transaction | undefined = getTransaction(methodCall);
  console.log("TX: ", tx)

  //TODO manage URL smart when 'undefined'
  const stravaUrl: string = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : ``;
  const txUrl: string = tx?.hash ? `https://polygonscan.com/tx/${tx.hash}` : ``;

  const oracleAddress: string | undefined = activities.find(
    (activity) => activity.key === commitment.activityKey
  )?.oracle;

  const processCommitmentProgress = async () => {
    if (singlePlayerCommit && account && oracleAddress) {
      await singlePlayerCommit
        .requestActivityDistance(
          account,
          oracleAddress,
          //to do - move to env and/or activity state
          "9ce5c4e09dda4c3687bac7a2f676268f",
          { gasLimit: 500000 }
        )
        .then((tx: Transaction) => {
          console.log("requestActivityDistanceTX receipt: ", tx);
          storeTransactionToState({
            methodCall,
            tx,
          });
        });
    }
  };

  const listenForActivityDistanceUpdate = (
    _singlePlayerCommit: Contract,
    commitment: Commitment
  ) => {
    _singlePlayerCommit.on(
      "RequestActivityDistanceFulfilled",
      async (id: string, distance: BigNumber, committer: string) => {
        const now = new Date().getTime() / 1000;

        if (committer.toLowerCase() === account?.toLowerCase()) {
          if (now > commitment.endTime) {
            refreshCommitment();
            navigation.navigate("Completion");
          } else {
            setPopUpVisible(true);
          }
        }
      }
    );
  };

  listenForActivityDistanceUpdate(singlePlayerCommit, commitment);

  const onContinue = async () => {
    if (!tx) {
      await processCommitmentProgress();
    }
  };

  return (
    <LayoutContainer>
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.track.alert}
      />
      <View style={styles.commitment}>
        {tx ? (
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
            <Text text={strings.track.tracking.text} />
            <View style={styles.commitmentValues}>
              <Text
                text={`${activityName} for ${commitment.goalValue} miles`}
              />
              <Text
                text={`from ${parseSecondTimestampToFullString(
                  commitment.startTime
                )} to ${parseSecondTimestampToFullString(commitment.endTime)}`}
              />
            </View>
            <View style={styles.commitmentValues}>
              <Text
                text={`${strings.track.tracking.stake} ${commitment.stake} DAI`}
              />
            </View>
            <View style={styles.commitmentValues}>
              <Text text={`Progression`} />
              <ProgressCircle progress={progress} />
            </View>
          </Fragment>
        )}
      </View>

      <View>
        {stravaIsLoggedIn && athlete?.id !== undefined ? (
          <a
            style={{ color: "white", fontFamily: "OpenSans_400Regular" }}
            href={stravaUrl}
            target="_blank"
          >
            Open Strava profile
          </a>
        ) : (
          <Button
            text={"Login to Strava"}
            onPress={() => navigation.navigate("ActivitySource")}
          />
        )}
      </View>

      <Footer>
        <Button text={"Back"} onPress={() => navigation.goBack()} />
        <Button text={"Continue"} onPress={() => onContinue()} />
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
  commitment: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  commitmentValues: {
    flex: 1,
    marginTop: 20,
    alignContent: "flex-start",
    alignItems: "center",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default TrackPage;
