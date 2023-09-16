import { useConnect } from "wagmi";
import { Container } from "@chakra-ui/react";

const Header = () => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  return (
    <Container h="80px">
      <div>
        {connectors.map((connector) => (
          <button
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
            {!connector.ready && " (unsupported)"}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              " (connecting)"}
          </button>
        ))}

        {error && <div>{error.message}</div>}
      </div>
    </Container>
  );
};

export default Header;
