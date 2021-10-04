import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "..";
import { LayoutContainer, Text, Button } from "../../components";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";
import strings from "../../resources/strings";

type LandingPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Landing"
>;

type LandingPageProps = {
  navigation: LandingPageNavigationProps;
};

const LandingPage = ({ navigation }: LandingPageProps) => {
  const { currentUser } = useCurrentUser();
  const { requestWallet } = useInjectedProvider();

  return (
    <LayoutContainer>
      {console.log("Act: " + currentUser?.username)}
      {currentUser?.username ? (
        <View style={styles.landingPage}>
          <Text text={strings.landing.intro} />
          <Button
            text={strings.landing.loggedIn.button}
            onPress={() => navigation.navigate("Intro")}
          />
        </View>
      ) : (
        <View style={styles.landingPage}>
          <Text text={strings.landing.intro} />
          <Button
            text={strings.landing.new.button}
            onPress={() => navigation.navigate("Intro")}
          />
          <Button
            text={strings.landing.reconnect.button}
            onPress={() => requestWallet()}
          />
        </View>
      )}
    </LayoutContainer>
  );
};

const styles = StyleSheet.create({
  landingPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LandingPage;
