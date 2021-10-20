import React, { useState } from "react";

import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Image,
  Text,
  useToast,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
  DialogPopUp,
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

type ConfirmationPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Confirmation"
>;

type ConfirmationPageProps = {
  navigation: ConfirmationPageNavigationProps;
};

const ConfirmationPage = ({ navigation }: ConfirmationPageProps) => {
  const toast = useToast();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { commitment, activities } = useCommitPool();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();
  const { daiContract, spcContract } = useContracts();

  const createCommitment = async () => {
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
              methodCall: "depositAndCommit",
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
              methodCall: "depositAndCommit",
              txReceipt: receipt,
            })
          )
          .then(() => {
            navigation.navigate("Track");
          });
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
