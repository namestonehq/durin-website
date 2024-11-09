"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn, formatEthereumAddress } from "@/lib/utils";
import Image from "next/image";

export function CustomConnectButton({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        let displayName = "Connect";
        if (account?.ensName) {
          displayName = account?.ensName;
        } else if (account?.address) {
          displayName = formatEthereumAddress(account?.address);
        }

        if (!ready) {
          return (
            <button
              className={cn(
                "text-white transition-colors duration-300 rounded-lg bg-stone-900 w-fit hover:bg-stone-700 disabled:opacity-50",
                className
              )}
            />
          );
        }

        return (
          <div
            {...(ready
              ? {}
              : {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openConnectModal();
                    }}
                    className={cn(
                      "text-white transition-colors duration-300 rounded-lg bg-stone-900 w-fit hover:bg-stone-700 disabled:opacity-50",
                      className
                    )}
                  >
                    Connect
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openChainModal();
                    }}
                    className={cn(
                      "text-white transition-colors duration-300 rounded-lg bg-stone-900 w-fit hover:bg-stone-700 disabled:opacity-50",

                      className
                    )}
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openAccountModal();
                  }}
                  className={cn(
                    "text-white transition-colors duration-300 rounded-lg bg-stone-900 w-fit hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  )}
                >
                  <Image
                    src="/logo-small-dark.svg"
                    alt="gon.id Logo"
                    width={20}
                    height={20}
                  />
                  {displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
