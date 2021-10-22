import React, { useEffect, useState } from "react";
import {
  Box,
  useToast,
  Button,
  ButtonGroup,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  IconButton,
  Link,
  Text,
  Spacer,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer, ProgressBar } from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";
import strings from "../../resources/strings";
import { parseSecondTimestampToFullString } from "../../utils/dateTime";

import { BigNumber, Contract, Transaction } from "ethers";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";
import { useStrava } from "../../contexts/stravaContext";
import { Commitment, TransactionTypes } from "../../types";
import { useCurrentUser } from "../../contexts/currentUserContext";
import usePlausible from "../../hooks/usePlausible";
import { DateTime } from "luxon";

type TrackPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Track"
>;

type TrackPageProps = {
  navigation: TrackPageNavigationProps;
};

const TrackPage = ({ navigation }: TrackPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/track",
  });
  const toast = useToast();
  const [waiting, setWaiting] = useState<boolean>(false);
  const { commitment, refreshCommitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();

  const methodCall: TransactionTypes = "requestActivityDistance";

  //TODO manage URL smart when 'undefined'
  const stravaUrl = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : "";
  const txUrl = latestTransaction?.txReceipt?.hash
    ? `https://polygonscan.com/tx/${latestTransaction?.txReceipt?.hash}`
    : "";

  //to do - move to env and/or activity state
  const oracleAddress: string = "0x0a31078cD57d23bf9e8e8F1BA78356ca2090569E";
  const jobId: string = "692ce2ecba234a3f9a0c579f8bf7a4cb";

  const processCommitmentProgress = async () => {
    if (
      spcContract &&
      currentUser?.attributes?.["custom:account_address"] &&
      oracleAddress
    ) {
      await spcContract
        .requestActivityDistance(
          currentUser.attributes["custom:account_address"],
          oracleAddress,
          jobId,
          { gasLimit: 500000 }
        )
        .then((txReceipt: Transaction) => {
          console.log("requestActivityDistanceTX receipt: ", txReceipt);
          setLatestTransaction({
            methodCall,
            txReceipt,
          });
        });
    }
  };

  // const listenForActivityDistanceUpdate = (
  //   _singlePlayerCommit: Contract,
  //   commitment: Partial<Commitment>
  // ) => {
  //   const now = new Date().getTime() / 1000;

  //   if (commitment?.endTime) {
  //     _singlePlayerCommit.on(
  //       "RequestActivityDistanceFulfilled",
  //       async (id: string, distance: BigNumber, committer: string) => {
  //         if (
  //           committer.toLowerCase() ===
  //           currentUser.attributes?.["custom:account_address"].toLowerCase()
  //         ) {
  //           if (commitment?.endTime && now > commitment.endTime) {
  //             navigation.navigate("Completion");
  //           } else {
  //             toast({
  //               title: "Not there yet!",
  //               description:
  //                 "Keep it up and check back in after your next activity",
  //               status: "warning",
  //               duration: 5000,
  //               isClosable: true,
  //               position: "top",
  //             });
  //           }
  //         }
  //       }
  //     );
  //   }
  // };

  // if (spcContract && commitment) {
  //   listenForActivityDistanceUpdate(spcContract, commitment);
  // }

  useEffect(() => {
    const awaitTransaction = async () => {
      try {
        setWaiting(true);
        toast({
          title: "Awaiting transaction confirmation",
          description: "Please hold on",
          status: "success",
          duration: null,
          isClosable: true,
          position: "top",
        });
        latestTransaction.txReceipt
          .wait()
          .then((txReceipt: any) => {
            setLatestTransaction({ methodCall, txReceipt });
            setWaiting(false);
          })
          .catch((err: any) => {
            console.log(err);
            setLatestTransaction({ methodCall, txReceipt: err.receipt });
            toast({
              title: "Transaction failed",
              description: "Please check your tx on Polygonscan",
              status: "error",
              duration: null,
              isClosable: false,
              position: "top",
            });
            setWaiting(false);
          });
      } catch (err) {
        setWaiting(false);
        toast.closeAll();
        console.log("Error in latestTx: ", err);
      }
    };

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === undefined
    ) {
      awaitTransaction();
    }

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === 0
    ) {
      toast({
        title: "Transaction failed",
        description: "Check your transaction on Polygonscan",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setWaiting(false);
    }

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === 1
    ) {
      toast({
        title: "Activity updated!",
        description: "Let's check your progress",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      refreshCommitment();
      if (commitment?.endTime) {
        const now = DateTime.now();
        const endTime = DateTime.fromSeconds(commitment.endTime);
        const commitmentExpired = now.diff(endTime).as("minutes") > 0;
        if (commitmentExpired || commitment?.met === true) {
          navigation.navigate("Completion");
        } else if (!commitmentExpired && commitment?.met === false) {
          toast({
            title: "Keep it up!",
            description: "You still have some time to make it!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      }
    }
  }, [latestTransaction]);

  const onNext = async () => {
    await processCommitmentProgress();
  };

  return (
    <LayoutContainer>
      <Center h="90%">
        {waiting ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s" />
            <Link href={txUrl} isExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack align="center" w="90%">
            <Heading size="md">{strings.track.tracking.text}</Heading>
            {commitment?.startTime &&
            commitment?.endTime &&
            commitment?.activityName &&
            commitment?.goalValue &&
            commitment?.stake ? (
              <VStack>
                <Text as="em">
                  {`${
                    strings.confirmation.commitment.activity
                  } ${commitment?.activityName?.toLowerCase()} `}
                  {`${strings.confirmation.commitment.distance} ${commitment?.goalValue} miles `}
                  {`${
                    strings.confirmation.commitment.startDate
                  } ${parseSecondTimestampToFullString(
                    commitment?.startTime
                  )} `}
                  {`${
                    strings.confirmation.commitment.endDate
                  } ${parseSecondTimestampToFullString(commitment?.endTime)}`}
                </Text>
                <Spacer />
                <Heading size="md">Your stake</Heading>
                <Text>{`${commitment.stake} DAI`}</Text>
                <Spacer />
                <Heading size="md">Your progression</Heading>
                <CircularProgress
                  value={commitment?.progress || 0}
                  size="100px"
                  thickness="10px"
                >
                  <CircularProgressLabel>
                    {commitment?.progress || 0}
                  </CircularProgressLabel>
                </CircularProgress>
              </VStack>
            ) : undefined}
          </VStack>
        )}
      </Center>

      <Box mb="5">
        {stravaUrl ? (
          <Link href={stravaUrl} isExternal target="_blank">
            Open Strava Profile <ExternalLinkIcon mx="2px" />
          </Link>
        ) : (
          <Button onClick={() => navigation.navigate("ActivitySource")}>
            Login to Strava
          </Button>
        )}
      </Box>

      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>
            {commitment?.met ? "Process commitment" : "Update progress"}{" "}
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

export default TrackPage;
