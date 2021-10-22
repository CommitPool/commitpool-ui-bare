import React, { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import {
  Box,
  useToast,
  Button,
  ButtonGroup,
  Center,
  CircularProgress,
  CircularProgressLabel,
  IconButton,
  Link,
  Text,
  Spacer,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer } from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";
import { Transaction } from "ethers";
import { TransactionTypes } from "../../types";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import usePlausible from "../../hooks/usePlausible";

type CompletionPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Completion"
>;

type CompletionPageProps = {
  navigation: CompletionPageNavigationProps;
};

const CompletionPage = ({ navigation }: CompletionPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/completion",
  });

  const { commitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);

  const methodCall: TransactionTypes = "processCommitmentUser";
  const txUrl = latestTransaction?.txReceipt?.hash
    ? `https://polygonscan.com/tx/${latestTransaction?.txReceipt?.hash}`
    : "";

  //Check is commitment was met
  useEffect(() => {
    if (loading && commitment?.reportedValue && commitment?.goalValue) {
      const _success =
        commitment.reportedValue > 0 &&
        commitment.reportedValue >= commitment.goalValue;
      setSuccess(_success);
      setLoading(false);
    }
  }, [commitment, loading]);

  const achievement = `You managed to ${commitment?.activityName?.toLowerCase()} for ${commitment?.reportedValue} miles. You committed to ${commitment?.goalValue} miles`;

  const onProcess = async () => {
    if (currentUser?.username && spcContract) {
      console.log("Web3 logged in, calling processCommitmentUser()");
      await spcContract
        .processCommitmentUser()
        .then((txReceipt: Transaction) => {
          console.log("processCommitmentUserTX receipt: ", txReceipt);
          setLatestTransaction({
            methodCall,
            txReceipt,
          });
        });
    } else {
      console.log("Web3 not logged in, routing to login");
      navigation.navigate("Login");
    }
  };

  const listenForCommitmentSettlement = () => {
    if (spcContract) {
      spcContract.on(
        "CommitmentEnded",
        async (committer: string, met: boolean, amountPenalized: number) => {
          if (
            committer.toLowerCase() === currentUser?.username?.toLowerCase()
          ) {
            navigation.navigate("ActivityGoal");
          }
        }
      );
    }
  };

  listenForCommitmentSettlement();

  return (
    <LayoutContainer>
      {loading ? <Text>Loading</Text> : undefined}

      {success && !loading ? (
        <Box>
          <ConfettiCannon
            count={100}
            origin={{ x: 100, y: 0 }}
            fadeOut={true}
          />
          <Text>{strings.completion.success}</Text>
        </Box>
      ) : undefined}

      {!success && !loading ? (
        <Text>{strings.completion.fail}</Text>
      ) : undefined}

      <Text>{achievement}</Text>

      {latestTransaction.methodCall === methodCall ? (
        <VStack spacing={15} h="60%">
          <Text>Awaiting transaction processing</Text>
          <Spinner size="xl" thickness="5px" speed="1s" />
          <Link href={txUrl} isExternal target="_blank">
            View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
          </Link>
        </VStack>
      ) : (
        <Button onClick={() => onProcess()}>Process commitment</Button>
      )}
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => navigation.navigate("ActivityGoal")}>
            Restart
          </Button>
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
  completionPage: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  helpButton: {
    width: 50,
    maxWidth: 50,
  },
});

export default CompletionPage;
