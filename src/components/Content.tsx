import { useConnect, useAccount } from "wagmi";
import { Container, Image, Box, Alert } from "@chakra-ui/react";
import SendToken from "./SendToken";
import taroBg from "../assets/taro-bg.png";
import taroLogo from "../assets/taro-logo.png";

const Content = () => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    // Container box, limit the Dapp size
    <Container
      position="absolute"
      padding="0"
      overflow="auto"
      borderRadius="5"
      left={{ base: "0", md: "50%" }}
      top={{ base: "0", md: "10%" }}
      transform={{
        base: "",
        md: "translateX(-50%)",
      }}
      w={{ base: "100%", md: "375px" }}
      h={{ base: "100%", md: "667px" }}
      boxShadow="0px 6px 20px rgba(0, 0, 0, 0.25)"
    >
      {/* Show connect wallet page when there's no address reading */}
      {!address && (
        <Box
          position="relative"
          h="100%"
          backgroundImage={taroBg}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
        >
          <Box
            w="60%"
            position="absolute"
            left="50.5%"
            top="47.2%"
            transform="translate(-50%, -50%)"
            _hover={{
              transform: "translate(-50%, -50%) scale(1.05)",
            }}
            transition="all ease 0.5s"
          >
            {connectors.map((connector, connectorIndex) => (
              <Image
                animation="rotate 60s linear infinite"
                cursor="pointer"
                draggable={false}
                key={connectorIndex}
                src={taroLogo}
                onClick={() => connect({ connector })}
              ></Image>
            ))}
          </Box>
          <Alert
            status="info"
            position="absolute"
            bottom="0"
            size="sm"
            padding="2"
            justifyContent="center"
            fontSize="14px"
            colorScheme="facebook"
            color="rgba(0,0,0,.7)"
          >
            🪄 Click Tarot to connect your wallet.
          </Alert>
        </Box>
      )}
      {/* Show token sending part when the wallet is connected */}
      {address && <SendToken></SendToken>}
    </Container>
  );
};

export default Content;
