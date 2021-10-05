import React, { Fragment, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  LayoutContainer,
  Footer,
  Button,
  ProgressBar,
  Text,
  DialogPopUp,
} from "../../components";
import { RootStackParamList } from "..";

import globalStyles from "../../resources/styles/styles.js";
import strings from "../../resources/strings";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import { useCurrentUser } from "../../contexts/currentUserContext";

type ActivitySourcePageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "ActivitySource"
>;

type ActivitySourcePageProps = {
  navigation: ActivitySourcePageNavigationProps;
};

const ActivitySourcePage = ({ navigation }: ActivitySourcePageProps) => {
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);

  const { athlete, handleStravaLogin} = useStrava();
  const { commitment } = useCommitPool();
  const { currentUser } = useCurrentUser();

  return (
    <LayoutContainer>
      <ProgressBar size={3} />
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.activitySource.alert}
      />
      <Text style={globalStyles.headerOne} text={strings.activitySource.notLoggedIn.text} />
      <View style={styles.intro}>
        {athlete?.id ? (
          <Fragment>
            <Text
              text={`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}
            />
            <Image
              style={styles.tinyAvatar}
              source={{ uri: athlete?.profile_medium }}
            />
            <Button
              text={strings.activitySource.loggedIn.button}
              onPress={() => handleStravaLogin()}
            />
          </Fragment>
        ) : (
          <Fragment>
            <Button
              text={strings.activitySource.notLoggedIn.button}
              onPress={() => handleStravaLogin()}
            />
          </Fragment>
        )}
      </View>
      <Footer>
        <Button
          text={strings.footer.back}
          onPress={() => navigation.goBack()}
        />
        <Button
          text={strings.footer.next}
          onPress={() => {
            if(commitment?.exists && athlete?.id && currentUser.attributes?.["custom:account_address"]) {
              navigation.navigate("Track");
            } else if (athlete?.id && currentUser.attributes?.["custom:account_address"]) {
              navigation.navigate("Confirmation");
            } else if (athlete?.id && !currentUser.attributes?.["custom:account_address"]) {
              navigation.navigate("Login");
            } else {
              setPopUpVisible(true);
            }
          }}
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
  intro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tinyAvatar: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default ActivitySourcePage;
