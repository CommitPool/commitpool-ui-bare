import { StackNavigationProp } from "@react-navigation/stack";
import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RootStackParamList } from "..";
import { LayoutContainer, Footer, DialogPopUp } from "../../components";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  IconButton,
  Text,
  useToast
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import strings from "../../resources/strings";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";
import { useStrava } from "../../contexts/stravaContext";
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
  const toast = useToast()

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
      commitment?.exists &&
      commitment?.activitySet &&
      commitment?.stakeSet &&
      athlete?.id
    ) {
      //All parameters set, go to commitment confirmation screen
      navigation.navigate("Confirmation");
    } else if (
      address &&
      commitment?.exists &&
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
      toast({
        title: "No wallet",
        description: "It appears you have no connected wallet",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
    }
  };

  return (
    <LayoutContainer>
      <Center h="100%">
        {currentUser?.attributes?.["custom:account_address"] ? (
          <Box>
            <Text>{`You're logged in as ${currentUser.username}`}</Text>
            <Text>{`${Number(currentUser.nativeTokenBalance).toFixed(
              2
            )} MATIC`}</Text>
            <Text>{`${Number(currentUser.daiBalance).toFixed(2)} DAI`}</Text>
          </Box>
        ) : (
          <Button onClick={() => requestWallet()}>{"Click to connect"}</Button>
        )}
      </Center>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>{strings.footer.next} </Button>
          <IconButton
            aria-label="Go to FAQ"
            icon={<QuestionIcon />}
            onClick={() => navigation.navigate("Faq")}
          />
        </ButtonGroup>
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
