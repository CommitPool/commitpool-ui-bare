import React from "react";
import { Image } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  IconButton,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer, ProgressBar } from "../../components";
import { RootStackParamList } from "..";

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
  const toast = useToast();
  const { athlete, handleStravaLogin } = useStrava();
  const { commitment } = useCommitPool();
  const { currentUser } = useCurrentUser();

  const onNext = () => {
    {
      if (
        commitment?.exists &&
        athlete?.id &&
        currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Track");
      } else if (
        athlete?.id &&
        currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Confirmation");
      } else if (
        athlete?.id &&
        !currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Login");
      } else {
        toast({
          title: "No source",
          description: "It appears you haven't connected your Strava account",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  return (
    <LayoutContainer>
      <ProgressBar size={3} />
      <Center dir="vertical" h="100%">
        {athlete?.id ? (
          <VStack spacing={6}>
            <Text>{`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}</Text>
            <Image source={{ uri: athlete?.profile_medium }} />
            <Button onClick={() => handleStravaLogin()}>
              {strings.activitySource.loggedIn.button}
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6}>
            <Text>{strings.activitySource.notLoggedIn.text}</Text>
            <Button onClick={() => handleStravaLogin()}>
              {strings.activitySource.notLoggedIn.button}
            </Button>
          </VStack>
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

export default ActivitySourcePage;
