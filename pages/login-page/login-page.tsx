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
import { useInjectedProvider } from "../../contexts/injectedProviderContext";
import { useStrava } from "../../contexts/stravaContext";
import { useContracts } from "../../contexts/contractContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useCurrentUser } from "../../contexts/currentUserContext";

type LoginPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

type LoginPageProps = {
  navigation: LoginPageNavigationProps;
};

const LoginPage = ({ navigation }: LoginPageProps) => {
  const { injectedProvider, requestWallet } = useInjectedProvider();
  const [popUpVisible, setPopUpVisible] = useState(false);

  const { athlete } = useStrava();
  const { spcContract } = useContracts();
  const { currentUser } = useCurrentUser();
  const { commitment } = useCommitPool();

  //When account has an commitment, write to state
  useEffect(() => {
    console.log("Account in login page: ", currentUser?.username);
    console.log("spcContract in login page: ", spcContract);

    if (currentUser && commitment) {
      const getCommitmentAndRoute = async () => {
        console.log("Commitment from contract: ", commitment);
        if (commitment.exists) {
          navigation.navigate("Track");
        }
      };

      getCommitmentAndRoute();
    }
  }, [currentUser, spcContract]);

  const onNext = () => {
    if (currentUser && commitment?.activitySet && commitment?.stakeSet && athlete?.id) {
      //All parameters set, go to commitment confirmation screen
      navigation.navigate("Confirmation");
    } else if (currentUser && commitment?.activitySet && commitment?.stakeSet && !athlete?.id) {
      //All parameters set, but need strava account data
      navigation.navigate("ActivitySource");
    } else if (currentUser) {
      //Wallet connected, go to commitment creation flow
      navigation.navigate("ActivityGoal");
    } else if (!currentUser) {
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
        {currentUser?.username ? (
          <View>
            <Text text={`You're logged in to ${currentUser.username}`} />
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
