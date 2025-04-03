"use client";

import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";
import React, { Suspense, ReactNode } from "react";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
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
