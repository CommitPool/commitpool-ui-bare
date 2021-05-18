import React, {useState} from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';

import {
  LayoutContainer,
  Footer,
  Button,
  ProgressBar,
  Text,
  DialogPopUp
} from "../../components";
import { useStravaLogin } from "./hooks";
import { RootState } from "../../redux/store";
import { RootStackParamList } from "..";

import strings from "../../resources/strings";

type ActivitySourcePageNavigationProps = StackNavigationProp<
  RootStackParamList,
  'ActivitySource'
>;

type ActivitySourcePageProps = {
  navigation: ActivitySourcePageNavigationProps;
};

const ActivitySourcePage = ({ navigation }: ActivitySourcePageProps) => {
  const [isLoggedIn, handleLogin] = useStravaLogin();
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const stravaAthlete: Athlete = useSelector((state: RootState) => state.strava.athlete);

  return (
    <LayoutContainer>
      <ProgressBar size={2 / 6} />
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.activitySource.alert}
      />
      <View style={styles.intro}>
        {isLoggedIn ? (
          <Text text={`${strings.activitySource.loggedIn.text} ${stravaAthlete?.firstname}`} />
        ) : (
          <Text text={strings.activitySource.notLoggedIn.text} />
        )}
        {isLoggedIn ? (
          <Button text={strings.activitySource.loggedIn.button} onPress={() => handleLogin()} />
        ) : (
          <Button text={strings.activitySource.notLoggedIn.button} onPress={() => handleLogin()} />
        )}
      </View>
      <Footer>
        <Button text={strings.footer.back} onPress={() => navigation.goBack()} />
        <Button
          text={strings.footer.next}
          onPress={() => isLoggedIn ? navigation.navigate("Staking") : setPopUpVisible(true)}
        />
      </Footer>
    </LayoutContainer>
  );
};

const styles = StyleSheet.create({
  intro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActivitySourcePage;