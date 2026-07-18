import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import React, { Suspense, ReactNode } from "react";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import {
  mainnet,
  sepolia,
  base,
  optimism,
  arbitrum,
  linea,
  scroll,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  lineaSepolia,
  scrollSepolia,
  polygon,
  polygonAmoy,
  celo,
  celoSepolia,
  worldchain,
  worldchainSepolia,
} from "wagmi/chains";
import { drpc, DrpcChain } from "evm-providers";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const drpcApiKey = import.meta.env.VITE_DRPC_API_KEY_FRONTEND;

function getChainTransport(chainId: DrpcChain) {
  return http(drpc(chainId, drpcApiKey));
}

const config = getDefaultConfig({
  appName: "Durin",
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "",
  chains: [
    mainnet,
    sepolia,
    base,
    optimism,
    arbitrum,
    linea,
    scroll,
    baseSepolia,
    optimismSepolia,
    arbitrumSepolia,
    lineaSepolia,
    scrollSepolia,
    polygon,
    polygonAmoy,
    celo,
    celoSepolia,
    worldchain,
    worldchainSepolia,
  ],
  transports: {
    [mainnet.id]: getChainTransport(mainnet.id),
    [sepolia.id]: getChainTransport(sepolia.id),
    [base.id]: getChainTransport(base.id),
    [optimism.id]: getChainTransport(optimism.id),
    [arbitrum.id]: getChainTransport(arbitrum.id),
    [linea.id]: getChainTransport(linea.id),
    [scroll.id]: getChainTransport(scroll.id),
    [baseSepolia.id]: getChainTransport(baseSepolia.id),
    [optimismSepolia.id]: getChainTransport(optimismSepolia.id),
    [arbitrumSepolia.id]: getChainTransport(arbitrumSepolia.id),
    [lineaSepolia.id]: getChainTransport(lineaSepolia.id),
    [scrollSepolia.id]: getChainTransport(scrollSepolia.id),
    [polygon.id]: getChainTransport(polygon.id),
    [polygonAmoy.id]: getChainTransport(polygonAmoy.id),
    [celo.id]: getChainTransport(celo.id),
    [celoSepolia.id]: getChainTransport(celoSepolia.id),
    // evm-providers doesn't support Worldchain for DRPC, so using default RPC for now
    [worldchain.id]: http(),
    [worldchainSepolia.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<></>}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={midnightTheme({
              accentColor: "#000",

              accentColorForeground: "#ffffff",
              borderRadius: "medium",
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Suspense>
  );
};

export default Providers;
