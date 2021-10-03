import { StackNavigationProp } from "@react-navigation/stack";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "..";
import {
  LayoutContainer,
  Footer,
  Text,
  Button,
  DialogPopUp,
} from "../../components";

import strings from "../../resources/strings";
import { RootState, useAppDispatch } from "../../redux/store";
import { updateCommitment } from "../../redux/commitpool/commitpoolSlice";
import { parseCommitmentFromContract } from "../../utils/commitment";
import useContracts from "../../hooks/useContracts";
import useWeb3 from "../../hooks/useWeb3";
import { ethers } from "ethers";
import useStravaAthlete from "../../hooks/useStravaAthlete";

type LoginPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

type LoginPageProps = {
  navigation: LoginPageNavigationProps;
};

const LoginPage = ({ navigation }: LoginPageProps) => {
  const dispatch = useAppDispatch();

  const { account, provider, requestWallet } = useWeb3();
  const [popUpVisible, setPopUpVisible] = useState(false);

  const { stravaIsLoggedIn } = useStravaAthlete();
  const { spcContract } = useContracts();

  const { activitySet, stakeSet } = useSelector(
    (state: RootState) => state.commitpool
  );

  //When account has an commitment, write to state
  useEffect(() => {
    if (account && ethers.utils.isAddress(account) && spcContract) {
      const getCommitmentAndRoute = async () => {
        console.log(`Checking for commitment for account ${account}`);
        const commitment = await spcContract.commitments(account);
        console.log("Commitment from contract: ", commitment);
        if (commitment.exists) {
          const _commitment: Commitment = parseCommitmentFromContract(commitment);
          if(_commitment){
            dispatch(updateCommitment({ ..._commitment }));
            navigation.navigate("Track");
          }
        }
      };

      getCommitmentAndRoute();
    }
  }, [account, spcContract]);

  const onNext = () => {
    if (account && activitySet && stakeSet && stravaIsLoggedIn) {
      //All parameters set, go to commitment confirmation screen
      navigation.navigate("Confirmation");
    } else if (account && activitySet && stakeSet && !stravaIsLoggedIn) {
      //All parameters set, but need strava account data
      navigation.navigate("ActivitySource");
    } else if (account) {
      //Wallet connected, go to commitment creation flow
      navigation.navigate("ActivityGoal");
    } else if (!account) {
      //Wallet not yet connected
      setPopUpVisible(true);
    }
  };

  return (
    <LayoutContainer>
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.login.alert}
      />
      <View style={styles.loginPage}>
        {account ? (
          <View>
            <Text text={`You're logged in to ${account}`} />
          </View>
        ) : (
          <Fragment>
            <Text text={strings.login.text} />
            <Button text={"Click to connect"} onPress={() => requestWallet()} />
          </Fragment>
        )}
      </View>
      <Footer>
        <Button
          text={strings.footer.back}
          onPress={() => navigation.goBack()}
        />
        <Button text={strings.footer.next} onPress={() => onNext()} />
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
  loginPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default LoginPage;
