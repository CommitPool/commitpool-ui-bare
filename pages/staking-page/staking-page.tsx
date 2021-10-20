import React from "react";
import {
  Text,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  IconButton,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
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
  const toast = useToast();
  const { commitment } = useCommitPool();

  const onNext = () => {
    commitment?.stakeSet
      ? navigation.navigate("ActivitySource")
      : toast({
          title: "Stake not set",
          description: "It appears you have no connected wallet",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
  };

  return (
    <LayoutContainer>
      <ProgressBar size={2} />
      <Heading size="md" m="2em">
        {strings.staking.text}
      </Heading>

      <VStack h="90%">
        <Text>{strings.staking.body1}</Text>
        <Text>{strings.staking.body2}</Text>
        <Divider mt="3em" mb="3em"/>
        <StakeBox />
      </VStack>

      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>{strings.footer.next}</Button>
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

export default StakingPage;
