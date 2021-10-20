import React from "react";
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

type TrackPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Track"
>;

type TrackPageProps = {
  navigation: TrackPageNavigationProps;
};

const TrackPage = ({ navigation }: TrackPageProps) => {
  // useStravaRefresh();
  const toast = useToast();
  const { commitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();

  const methodCall: TransactionTypes = "requestActivityDistance";
  const tx: boolean = false;

  //TODO manage URL smart when 'undefined'
  const stravaUrl = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : undefined;
  const txUrl = latestTransaction?.txReceipt?.hash
    ? `https://polygonscan.com/tx/${latestTransaction?.txReceipt?.hash}`
    : undefined;

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

  const listenForActivityDistanceUpdate = (
    _singlePlayerCommit: Contract,
    commitment: Partial<Commitment>
  ) => {
    const now = new Date().getTime() / 1000;

    if (commitment?.endTime) {
      _singlePlayerCommit.on(
        "RequestActivityDistanceFulfilled",
        async (id: string, distance: BigNumber, committer: string) => {
          if (
            committer.toLowerCase() ===
            currentUser.attributes?.["custom:account_address"].toLowerCase()
          ) {
            if (commitment?.endTime && now > commitment.endTime) {
              navigation.navigate("Completion");
            } else {
              toast({
                title: "Not there yet!",
                description:
                  "Keep it up and check back in after your next activity",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
              });
            }
          }
        }
      );
    }
  };

  if (spcContract && commitment) {
    listenForActivityDistanceUpdate(spcContract, commitment);
  }

  const onNext = async () => {
    if (!tx) {
      await processCommitmentProgress();
    }
  };

  return (
    <LayoutContainer>
      <Center h="90%">
        {latestTransaction?.methodCall === methodCall ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s"/>
            <Link href={txUrl} ISExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack align="center">
            <Text>{strings.track.tracking.text}</Text>
            {commitment?.startTime &&
            commitment?.endTime &&
            commitment?.activityName &&
            commitment?.goalValue &&
            commitment?.stake ? (
              <VStack>
                <VStack>
                  <Text>{`${commitment.activityName} for ${commitment?.goalValue} miles`}</Text>
                  <Text>
                    {`from ${parseSecondTimestampToFullString(
                      commitment.startTime
                    )} to ${parseSecondTimestampToFullString(
                      commitment.endTime
                    )}`}
                  </Text>
                </VStack>

                <Box justify="center">
                  <Text>{`${strings.track.tracking.stake} ${commitment.stake} DAI`}</Text>
                  <Text>Progression</Text>
                  <CircularProgress
                    value={commitment?.progress || 0}
                    size="100px"
                    thickness="10px"
                  >
                    <CircularProgressLabel>
                      {commitment?.progress || 0}
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>
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

export default TrackPage;
