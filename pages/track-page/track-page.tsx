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

import { BigNumber, Contract, Transaction } from "ethers";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";
import { useStrava } from "../../contexts/stravaContext";
import useStravaData from "../../hooks/useStravaData";
import { Commitment, TransactionTypes } from "../../types";
import { useCurrentUser } from "../../contexts/currentUserContext";

type TrackPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Track"
>;

type TrackPageProps = {
  navigation: TrackPageNavigationProps;
};

//TODO Contr
const TrackPage = ({ navigation }: TrackPageProps) => {
  // useStravaRefresh();
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const { activities, commitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { storeTransactionToState, getTransaction } = useWeb3();
  const { athlete, isLoggedIn } = useStrava();
  const { currentUser } = useCurrentUser();
  const { progress } = useStravaData();

  const methodCall: TransactionTypes = "requestActivityDistance";
  const tx: Transaction | undefined = getTransaction(methodCall);

  //TODO manage URL smart when 'undefined'
  const stravaUrl: string = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : ``;
  const txUrl: string = tx?.hash ? `https://polygonscan.com/tx/${tx.hash}` : ``;

  const oracleAddress: string | undefined = activities?.find(
    (activity) => activity.key === commitment?.activityKey
  )?.oracle;

  const processCommitmentProgress = async () => {
    if (spcContract && currentUser?.username && oracleAddress) {
      await spcContract
        .requestActivityDistance(
          currentUser.username,
          oracleAddress,
          //to do - move to env and/or activity state
          "9ce5c4e09dda4c3687bac7a2f676268f",
          { gasLimit: 500000 }
        )
        .then((txReceipt: Transaction) => {
          console.log("requestActivityDistanceTX receipt: ", txReceipt);
          storeTransactionToState({
            methodCall,
            txReceipt,
          });
        });
    }
  };

  const listenForActivityDistanceUpdate = (
    _singlePlayerCommit: Contract | undefined,
    commitment: Commitment
  ) => {
    if (_singlePlayerCommit && commitment) {
      _singlePlayerCommit.on(
        "RequestActivityDistanceFulfilled",
        async (id: string, distance: BigNumber, committer: string) => {
          const now = new Date().getTime() / 1000;

          if (committer.toLowerCase() === currentUser?.username?.toLowerCase()) {
            if (now > commitment.endTime) {
              navigation.navigate("Completion");
            } else {
              setPopUpVisible(true);
            }
          }
        }
      );
    }
  };

  listenForActivityDistanceUpdate(spcContract, commitment);

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
            {commitment?.startTime &&
            commitment?.endTime &&
            commitment?.activityName ? (
              <Fragment>
                <View style={styles.commitmentValues}>
                  <Text
                    text={`${commitment.activityName} for ${commitment?.goalValue} miles`}
                  />
                  <Text
                    text={`from ${parseSecondTimestampToFullString(
                      commitment.startTime
                    )} to ${parseSecondTimestampToFullString(
                      commitment.endTime
                    )}`}
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
            ) : undefined}
          </Fragment>
        )}
      </View>

      <View>
        {isLoggedIn && athlete?.id ? (
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
