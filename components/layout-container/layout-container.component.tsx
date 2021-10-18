import React from "react";
import { Center, Flex, Container } from "@chakra-ui/react";

interface LayoutContainer {
  children?: React.ReactNode;
}

const LayoutContainer = ({ children }: LayoutContainer) => {
  return (
    <Center
      backgroundImage="url('https://i.imgur.com/Q1NCXvz.png')"
      backgroundPosition="50% 50%"
      backgroundSize="auto 100%"
      height="100%"
    >
      <Container color="white">
        <Flex flexDir="column" align="center" h="90%" mt="5">
          {children}
        </Flex>
      </Container>
    </Center>
  );
};

export default LayoutContainer;
