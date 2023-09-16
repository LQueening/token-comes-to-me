import { useConnect, useAccount } from "wagmi";
import { Container, Image, Box } from "@chakra-ui/react";
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
          >
            {connectors.map((connector, connectorIndex) => (
              <Image
                key={connectorIndex}
                animation="rotate 60s linear infinite"
                cursor="pointer"
                _hover={{
                  transform: "scale(1.05)",
                }}
                src={taroLogo}
                onClick={() => connect({ connector })}
              ></Image>
            ))}
          </Box>
        </Box>
      )}
      {/* Show token sending part when the wallet is connected */}
      {address && <SendToken></SendToken>}
    </Container>
  );
};

export default Content;
