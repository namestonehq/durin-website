"use client";

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
  celoAlfajores,
  worldchain,
  worldchainSepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!alchemyApiKey) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

const config = getDefaultConfig({
  appName: "Durin",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
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
    celoAlfajores,
    worldchain,
    worldchainSepolia,
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [optimism.id]: http(
      `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [linea.id]: http(`https://linea-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [scroll.id]: http(
      `https://scroll-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [optimismSepolia.id]: http(
      `https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [arbitrumSepolia.id]: http(
      `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [lineaSepolia.id]: http(
      `https://linea-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [scrollSepolia.id]: http(
      `https://scroll-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [polygonAmoy.id]: http(
      `https://polygon-amoy.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [celo.id]: http(`https://celo-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [celoAlfajores.id]: http(
      `https://celo-alfajores.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [worldchain.id]: http(
      `https://worldchain-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [worldchainSepolia.id]: http(
      `https://worldchain-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
  },
  ssr: true,
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
