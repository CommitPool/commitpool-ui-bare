import React from "react";
import { Text, HStack } from "@chakra-ui/react";

import { DropDownPicker } from "..";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { DropdownItem } from "../../types";

interface ActivitySelectorProps {
  text: string;
}

const ActivitySelector = ({ text }: ActivitySelectorProps) => {
  const { formattedActivities, commitment, setCommitment } = useCommitPool();

  const onSelect = (activityKey: string) => {
    console.log("Setting commitment: ", { ...commitment, activityKey });
    setCommitment({ ...commitment, activityKey });
  };

  return (
    <HStack>
      <Text>{text}</Text>
      <DropDownPicker
        itemsToSelect={formattedActivities as DropdownItem[]}
        onSelect={onSelect}
      />
    </HStack>
  );
};

export default ActivitySelector;
