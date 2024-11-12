import React from "react";
import { useState, useEffect } from "react";
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
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { namehash } from "viem/ens";
import { Domain } from "../../lib/types";

interface UpdateResolverButtonProps {
  network: string;
  selectedDomain: Domain | undefined;
}

const NAMEWRAPPER = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";

const RESOLVER_ADDRESSES = {
  Sepolia: "0x00f9314C69c3e7C37b3C7aD36EF9FB40d94eDDe1" as Address,
  Mainnet: "0x2A6C785b002Ad859a3BAED69211167C7e998aAeC" as Address,
};

const CHAIN_IDS = {
  Sepolia: 11155111,
  Mainnet: 1,
};

const REGISTRY_ABI = [
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "resolver",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const REGISTRY_ADDRESSES = {
  Sepolia: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as Address,
  Mainnet: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as Address,
};

const UpdateResolverButton: React.FC<UpdateResolverButtonProps> = ({
  network,
  selectedDomain,
}) => {
  const [buttonText, setButtonText] = useState("Checking resolver...");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResolver, setCurrentResolver] = useState<Address | null>(null);

  const { isConnected, address } = useAccount();
  const { chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const { isLoading: isWaitingForTx, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check current resolver
  useEffect(() => {
    const checkResolver = async () => {
      if (!selectedDomain?.name) {
        setButtonText("Update Resolver");
        return;
      }

      try {
        setButtonText("Checking resolver...");
        const registryAddress =
          REGISTRY_ADDRESSES[network as keyof typeof REGISTRY_ADDRESSES];
        const expectedResolver =
          RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];

        // Create a public client for the target network
        const client = createPublicClient({
          chain: network === "Mainnet" ? mainnet : sepolia,
          transport: http(),
        });

        // Get the current resolver
        const node = namehash(selectedDomain.name);
        const resolver = await client.readContract({
          address: registryAddress,
          abi: REGISTRY_ABI,
          functionName: "resolver",
          args: [node],
        });

        setCurrentResolver(resolver);

        if (resolver === expectedResolver) {
          setButtonText("Resolver up to date ✓");
        } else if (resolver === "0x0000000000000000000000000000000000000000") {
          setButtonText("Set Resolver");
        } else {
          setButtonText("Update Resolver");
        }
      } catch (error) {
        console.error("Error checking resolver:", error);
        setButtonText("Update Resolver");
      }
    };

    checkResolver();
  }, [selectedDomain?.name, network]);

  // Handle network switch and resolver update
  useEffect(() => {
    const updateResolver = async () => {
      if (
        !shouldUpdate ||
        !isConnected ||
        !selectedDomain ||
        !walletClient ||
        !address
      )
        return;

      try {
        const targetChainId = CHAIN_IDS[network as keyof typeof CHAIN_IDS];
        if (!targetChainId) {
          throw new Error("Invalid network selected");
        }

        // Only proceed if we're on the correct network
        if (current?.id === targetChainId) {
          setButtonText("Waiting for approval...");

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
            name: selectedDomain.name,
            contract:
              selectedDomain?.owner === NAMEWRAPPER
                ? "nameWrapper"
                : "registry",
            resolverAddress: resolverAddress,
            account: address,
          });

          setHash(txHash);
          setButtonText("Pending...");
          setShouldUpdate(false);
        }
      } catch (error) {
        console.error("Update resolver error:", error);
        setButtonText("Failed");
        setShouldUpdate(false);
        setIsProcessing(false);
        setTimeout(() => {
          setButtonText("Update Resolver");
        }, 1500);
      }
    };

    updateResolver();
  }, [
    current?.id,
    shouldUpdate,
    network,
    selectedDomain,
    walletClient,
    address,
    isConnected,
  ]);

  const handleUpdateResolver = async () => {
    // Don't proceed if resolver is already correct
    const expectedResolver =
      RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];
    if (currentResolver === expectedResolver) {
      return;
    }

    if (!isConnected || !selectedDomain || !walletClient || !address) {
      console.error("Wallet not connected or no domain selected");
      return;
    }

    try {
      setIsProcessing(true);
      setButtonText("Preparing...");

      const targetChainId = CHAIN_IDS[network as keyof typeof CHAIN_IDS];
      if (!targetChainId) {
        throw new Error("Invalid network selected");
      }

      // Check if network switch is needed
      if (current?.id !== targetChainId) {
        setButtonText("Switching network...");
        const targetChain = chains.find((chain) => chain.id === targetChainId);
        if (targetChain) {
          setShouldUpdate(true);
          await switchChain({ chainId: targetChainId });
        } else {
          throw new Error("Selected chain not configured in wagmi");
        }
      } else {
        // If already on correct network, trigger update directly
        setShouldUpdate(true);
      }
    } catch (error) {
      console.error("Update resolver error:", error);
      setButtonText("Failed");
      setIsProcessing(false);
      setShouldUpdate(false);
      setTimeout(() => {
        setButtonText("Update Resolver");
      }, 1500);
    }
  };

  // Reset states on success
  useEffect(() => {
    if (updateSuccess) {
      setButtonText("Success!");
      setIsProcessing(false);
      setShouldUpdate(false);
      setTimeout(() => {
        // Recheck resolver after update
        setButtonText("Checking resolver...");
        setHash(undefined);
      }, 1500);
    }
  }, [updateSuccess]);

  const isDisabled =
    !isConnected ||
    isWaitingForTx ||
    !selectedDomain ||
    isProcessing ||
    currentResolver ===
      RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];

  return (
    <button
      onClick={handleUpdateResolver}
      disabled={isDisabled}
      className={`px-2 py-1 text-sm border rounded text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default UpdateResolverButton;
