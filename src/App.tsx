import { ChakraProvider } from "@chakra-ui/react";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import * as chain from "wagmi/chains";
import Content from "./components/Content";
import "./App.css";

const { chains, publicClient } = configureChains(
  [
    chain.goerli,
    chain.mainnet,
    chain.bscTestnet,
    chain.bsc,
    chain.arbitrum,
    chain.polygon,
    chain.optimism,
  ],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

function App() {
  return (
    <WagmiConfig config={config}>
      <ChakraProvider>
        <div className="App">
          {/* <Header></Header> */}
          <Content></Content>
        </div>
      </ChakraProvider>
    </WagmiConfig>
  );
}

export default App;
