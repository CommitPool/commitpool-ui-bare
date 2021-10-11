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
import { Commitment, TransactionTypes } from "../../types";
import { useCurrentUser } from "../../contexts/currentUserContext";

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
  const { activities, commitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();

  const methodCall: TransactionTypes = "requestActivityDistance";
  const tx: boolean = false;

  //TODO manage URL smart when 'undefined'
  const stravaUrl: string = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : ``;
  const txUrl: string = latestTransaction?.txReceipt?.hash
    ? `https://polygonscan.com/tx/${latestTransaction?.txReceipt?.hash}`
    : "No transaction found";

  //to do - move to env and/or activity state
  const oracleAddress: string = '0x0a31078cD57d23bf9e8e8F1BA78356ca2090569E';
  const jobId: string = '692ce2ecba234a3f9a0c579f8bf7a4cb';

  const processCommitmentProgress = async () => {
    if (
      spcContract &&
      currentUser?.attributes?.["custom:account_address"] &&
      oracleAddress
    ) {
      await spcContract
        .requestActivityDistance(
          currentUser.attributes["custom:account_address"],
          oracleAddress,
          jobId,
          { gasLimit: 500000 }
        )
        .then((txReceipt: Transaction) => {
          console.log("requestActivityDistanceTX receipt: ", txReceipt);
          setLatestTransaction({
            methodCall,
            txReceipt,
          });
        });
    }
  };

  const listenForActivityDistanceUpdate = (
    _singlePlayerCommit: Contract,
    commitment: Partial<Commitment>
  ) => {
    const now = new Date().getTime() / 1000;

    if (commitment?.endTime) {
      _singlePlayerCommit.on(
        "RequestActivityDistanceFulfilled",
        async (id: string, distance: BigNumber, committer: string) => {
          if (
            committer.toLowerCase() ===
            currentUser.attributes?.["custom:account_address"].toLowerCase()
          ) {
            if (commitment?.endTime && now > commitment.endTime) {
              navigation.navigate("Completion");
            } else {
              setPopUpVisible(true);
            }
          }
        }
      );
    }
  };

  if (spcContract && commitment) {
    listenForActivityDistanceUpdate(spcContract, commitment);
  }

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
              // href={txUrl}
              target="_blank"
            >
              View transaction on Polygonscan
            </a>
          </Fragment>
        ) : (
          <Fragment>
            <Text text={strings.track.tracking.text} />
            {commitment?.startTime && commitment?.endTime ? (
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
                  <Text text={`Progression`} />
                  <ProgressCircle progress={commitment?.progress || 0} />
                </View>
              </Fragment>
            ) : undefined}
          </Fragment>
        )}
      </View>

      <View>
        {athlete?.id ? (
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
    justifyContent: "center",
  },
  commitmentValues: {
    flex: 1,
    marginTop: 20,
    alignContent: "center",
    alignItems: "center",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default TrackPage;
