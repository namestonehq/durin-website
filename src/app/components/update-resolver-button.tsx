import React from "react";
import { useState } from "react";
import {
  useChains,
  useSwitchChain,
  useAccount,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { type Address } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { setResolver } from "@ensdomains/ensjs/wallet";
import { addEnsContracts } from "@ensdomains/ensjs";
import { createWalletClient, custom } from "viem";

interface UpdateResolverButtonProps {
  network: string;
  domainInput: string;
}

const RESOLVER_ADDRESSES = {
  Sepolia: "0x00f9314C69c3e7C37b3C7aD36EF9FB40d94eDDe1" as Address,
  Mainnet: "0x2A6C785b002Ad859a3BAED69211167C7e998aAeC" as Address,
};

const CHAIN_IDS = {
  Sepolia: 11155111,
  Mainnet: 1,
};

const UpdateResolverButton: React.FC<UpdateResolverButtonProps> = ({
  network,
  domainInput,
}) => {
  const [buttonText, setButtonText] = useState("Update Resolver");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isConnected, address } = useAccount();
  const { chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Wait for transaction hook
  const { isLoading: isWaitingForTx, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleUpdateResolver = async () => {
    if (!isConnected || !domainInput || !walletClient || !address) {
      console.error("Wallet not connected or no domain selected");
      return;
    }

    try {
      setButtonText("Preparing...");

      // Get target chain ID
      const targetChainId = CHAIN_IDS[network as keyof typeof CHAIN_IDS];
      if (!targetChainId) {
        throw new Error("Invalid network selected");
      }

      // Check if network switch is needed
      if (current?.id !== targetChainId) {
        setButtonText("Switching network...");
        const targetChain = chains.find((chain) => chain.id === targetChainId);
        if (targetChain) {
          await switchChain({ chainId: targetChainId });
          // Small delay to ensure chain switch is processed
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          throw new Error("Selected chain not configured in wagmi");
        }
      }

      setButtonText("Waiting for approval...");

      // Get the correct resolver address based on network
      const resolverAddress =
        RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];
      if (!resolverAddress) {
        throw new Error("Invalid network selected");
      }

      // Create ENS wallet client
      const ensWalletClient = createWalletClient({
        account: address,
        chain: addEnsContracts(network === "Mainnet" ? mainnet : sepolia),
        transport: custom(walletClient.transport),
      });

      // Update resolver using ENS.js
      const txHash = await setResolver(ensWalletClient, {
        name: domainInput,
        contract: "registry", // or "nameWrapper" if wrapped
        resolverAddress: resolverAddress,
        account: address,
      });

      setHash(txHash);
      setButtonText("Pending...");
    } catch (error) {
      console.error("Update resolver error:", error);
      setButtonText("Failed");
      setTimeout(() => {
        setButtonText("Update Resolver");
      }, 1500);
    }
  };

  // Reset button text on success
  React.useEffect(() => {
    if (updateSuccess) {
      setButtonText("Success!");
      setTimeout(() => {
        setButtonText("Update Resolver");
        setHash(undefined);
      }, 1500);
    }
  }, [updateSuccess]);

  return (
    <button
      onClick={handleUpdateResolver}
      disabled={!isConnected || isWaitingForTx || !domainInput}
      className={`px-2 py-1 text-sm border rounded text-stone-900 ${
        !isConnected || isWaitingForTx || !domainInput
          ? "bg-stone-100 cursor-not-allowed"
          : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default UpdateResolverButton;
