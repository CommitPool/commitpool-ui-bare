import React from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import { Text } from "../../components/";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface CustomProgressCircle {
  progress: number;
}

const CustomProgressCircle = () => {
  const { commitment } = useCommitPool();
  return (
      <AnimatedCircularProgress
        size={180}
        width={15}
        rotation={0}
        fill={commitment?.progress || 0}
        tintColor="white"
        onAnimationComplete={() => console.log("onAnimationComplete")}
        backgroundColor="#D45353"
      >
        {() => <Text text={`${commitment?.progress?.toFixed(1) || 0} %`} />}
      </AnimatedCircularProgress>
  );
};

export default CustomProgressCircle;
