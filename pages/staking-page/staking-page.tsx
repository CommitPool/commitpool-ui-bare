import React, { useState } from "react";

import { StyleSheet, View } from "react-native";
import {
  LayoutContainer,
  Footer,
  Button,
  Text,
  ProgressBar,
  DialogPopUp,
  StakeBox,
} from "../../components";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "..";

import globalStyles from "../../resources/styles/styles";
import strings from "../../resources/strings";
import { useCommitPool } from "../../contexts/commitPoolContext";

type StakingPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Staking"
>;

type StakingPageProps = {
  navigation: StakingPageNavigationProps;
};

const StakingPage = ({ navigation }: StakingPageProps) => {
  const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
  const { commitment } = useCommitPool();

  return (
    <LayoutContainer>
      <DialogPopUp
        visible={popUpVisible}
        onTouchOutside={() => setPopUpVisible(false)}
        text={strings.staking.alert}
      />
      
      <ProgressBar size={2} />
      <View style={styles.text}>
        <Text style={globalStyles.headerOne} text={strings.staking.text} />
        <View style={styles.content}>
          <Text style={styles.body} text={strings.staking.body1}/>
          <Text style={styles.body} text={strings.staking.body2}/>
        </View>
        <StakeBox />
      </View>

      <Footer>
        <Button
          text={strings.footer.back}
          onPress={() => navigation.goBack()}
        />
        <Button
          text={strings.footer.next}
          onPress={() => {
            commitment?.stakeSet
              ? navigation.navigate("ActivitySource")
              : setPopUpVisible(true)
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
  text: {
    flex: 1,
    alignItems: "center",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
  content: {
    flex: 0.7,
    justifyContent: "space-around",
  },
  body: {
    textAlign: "center"
  }
});

export default StakingPage;
