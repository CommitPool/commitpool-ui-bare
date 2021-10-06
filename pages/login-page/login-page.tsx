import { StackNavigationProp } from "@react-navigation/stack";
import React, { Fragment, useEffect, useState } from "react";
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
  const { requestWallet } = useInjectedProvider();
  const [popUpVisible, setPopUpVisible] = useState(false);

  const { athlete } = useStrava();
  const { currentUser } = useCurrentUser();
  const { commitment } = useCommitPool();

  //When account has an commitment, write to state
  useEffect(() => {
    if (commitment?.exists) {
      navigation.navigate("Track");
    }
  }, [commitment]);

  const onNext = () => {
    const address = currentUser.attributes?.["custom:account_address"];
    if (
      address &&
      commitment?.activitySet &&
      commitment?.stakeSet &&
      athlete?.id
    ) {
      //All parameters set, go to commitment confirmation screen
      navigation.navigate("Confirmation");
    } else if (
      address &&
      commitment?.activitySet &&
      commitment?.stakeSet &&
      !athlete?.id
    ) {
      //All parameters set, but need strava account data
      navigation.navigate("ActivitySource");
    } else if (address) {
      //Wallet connected, go to commitment creation flow
      navigation.navigate("ActivityGoal");
    } else if (!address) {
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
        {currentUser?.attributes?.["custom:account_address"] ? (
          <View>
            <Text text={`You're logged in as ${currentUser.username}`} />
            <Text
              text={`${Number(currentUser.nativeTokenBalance).toFixed(
                2
              )} MATIC`}
            />
            <Text text={`${Number(currentUser.daiBalance).toFixed(2)} DAI`} />
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
