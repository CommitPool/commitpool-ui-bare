import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "..";
import { LayoutContainer, Text, Button } from "../../components";
import { useCommitPool } from "../../contexts/commitPoolContext";

import strings from "../../resources/strings";

type TestPageNavigationProps = StackNavigationProp<RootStackParamList, "Test">;

type TestPageProps = {
  navigation: TestPageNavigationProps;
};

const TestPage = ({ navigation }: TestPageProps) => {
  const { setCommitment } = useCommitPool();

  const clearStateAndRoute = () => {
    setCommitment({});
    navigation.navigate("ActivityGoal");
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  };
  return (
    <LayoutContainer>
      <View style={styles.header}>
        <Text style={styles.headerOne} text="Hold Yourself Accountable" />
      </View>
      <View style={styles.content}>
        <Text text={strings.intro.text} />
      </View>
      <View style={styles.footer}>
        <Button
          text={strings.landing.reconnect.button}
          onPress={() => navigation.navigate("Login")}
        />
        <Text text="OR"></Text>
        <Button
          text={strings.landing.getStarted.text}
          onPress={() => clearStateAndRoute()}
        />
      </View>
    </LayoutContainer>
  );
};

const styles = StyleSheet.create({
  headerOne: {
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: 36,
    lineHeight: 42,
    alignItems: "flex-end",
    textAlign: "center",
    color: "#FFFFFF",
  },
  container: {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: 14,
  },
  header: {
    marginBottom: 37,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignSelf: "flex-end",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default TestPage;
