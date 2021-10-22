import React, { useEffect, useState } from "react";

import {
  Button,
  ButtonGroup,
  IconButton,
  Image,
  Text,
  useToast,
  VStack,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
  CommitmentOverview,
} from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";

import {
  validCommitmentRequest,
  getCommitmentRequestParameters,
} from "../../utils/commitment";
import { Transaction } from "ethers";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import usePlausible from "../../hooks/usePlausible";
import { TransactionTypes } from "../../types";

type ConfirmationPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Confirmation"
>;

type ConfirmationPageProps = {
  navigation: ConfirmationPageNavigationProps;
};

const ConfirmationPage = ({ navigation }: ConfirmationPageProps) => {
  const { trackPageview, trackEvent } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/confirmation",
  });

  const toast = useToast();
  const [waiting, setWaiting] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const { commitment, activities } = useCommitPool();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();
  const { daiContract, spcContract } = useContracts();
  const methodCall: TransactionTypes = "depositAndCommit";

  const txUrl = latestTransaction?.txReceipt?.hash
    ? `https://polygonscan.com/tx/${latestTransaction?.txReceipt?.hash}`
    : "";

  useEffect(() => {
    const awaitTransaction = async () => {
      try {
        setWaiting(true);
        latestTransaction.txReceipt
          .wait()
          .then((txReceipt: any) => {
            setLatestTransaction({ methodCall, txReceipt });
            navigation.navigate("Track");
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
      } catch {
        setWaiting(false);
        console.log("Got error on latest Tx: ", latestTransaction);
      }
    };

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === undefined
    ) {
      awaitTransaction();
      toast({
        title: "Awaiting transaction confirmation",
        description: "Please hold on",
        status: "success",
        duration: null,
        isClosable: false,
        position: "top",
      });
    }

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === 0
    ) {
      awaitTransaction();
      toast({
        title: "Transaction failed",
        description: "Check your transaction on Polygonscan",
        status: "error",
        duration: null,
        isClosable: true,
        position: "top",
      });
    }

    if (
      latestTransaction.methodCall === methodCall &&
      latestTransaction.txReceipt.status === 1
    ) {
      awaitTransaction();
      toast({
        title: "You're committed!",
        description: "Let's check your progress",
        status: "success",
        duration: null,
        isClosable: true,
        position: "top",
      });
    }
  }, [latestTransaction]);

  const createCommitment = async () => {
    trackEvent("spc_create_commitment");
    if (
      commitment &&
      activities &&
      validCommitmentRequest(commitment, activities) &&
      spcContract &&
      daiContract &&
      athlete &&
      currentUser.attributes?.["custom:account_address"]
    ) {
      const allowance = await daiContract.allowance(
        currentUser.attributes["custom:account_address"],
        spcContract.address
      );

      const _commitmentParameters = getCommitmentRequestParameters(commitment);
      const _commitmentParametersWithUserId = {
        ..._commitmentParameters,
        _userId: String(athlete.id),
      };

      console.log(
        "Commitment request with user ID: ",
        _commitmentParametersWithUserId
      );

      if (allowance.gte(_commitmentParameters._stake)) {
        console.log("Submitting D&C tx");
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((receipt: Transaction) =>
            setLatestTransaction({
              methodCall,
              txReceipt: receipt,
            })
          );
      } else {
        console.log("Getting allowance with DAI contract: ", daiContract);

        await daiContract
          .approve(spcContract.address, _commitmentParametersWithUserId._stake)
          .then((receipt: Transaction) =>
            setLatestTransaction({
              methodCall: "approve",
              txReceipt: receipt,
            })
          );

        console.log("Calling D&C with SPC contract: ", spcContract);
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((receipt: Transaction) =>
            setLatestTransaction({
              methodCall,
              txReceipt: receipt,
            })
          );
      }
    } else {
      toast({
        title: "Activity not complete",
        description: "Please check your values and try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <LayoutContainer>
      <ProgressBar size={5} />
      <VStack mt={10}>
        <Text>
          {`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}
        </Text>
        <Image
          borderRadius="full"
          boxSize="50px"
          src={athlete?.profile_medium}
        />
      </VStack>
      <VStack mt="2em" h="80%">
        {waiting ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s" />
            <Link href={txUrl} isExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack>
            <CommitmentOverview editing={editMode} />
            {editMode ? (
              <Button
                onClick={() => {
                  setEditMode(false);
                }}
              >
                Set
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditMode(true);
                }}
              >
                Edit
              </Button>
            )}
          </VStack>
        )}
      </VStack>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={async () => createCommitment()}>
            {strings.footer.next}
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

export default ConfirmationPage;
