import React from "react";
import { useState, useEffect } from "react";
import {
  useChains,
  useSwitchChain,
  useAccount,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { type Address, parseAbi, namehash } from "viem";
import toast from "react-hot-toast";
import { chainIdMap } from "@/lib/utils";
import { RESOLVER_ADDRESSES } from "@/lib/utils";

interface SetRegistryButtonProps {
  network: string;
  domainInput: string | undefined;
  registryAddress: Address;
  selectedChain: string;
  addTransaction: (action: string, chain: string, hash: string) => void;
}

const RESOLVER_ABI = parseAbi([
  "function setL2Registry(bytes32 node, uint64 targetChainId, address targetRegistryAddress) external",
]);

const SetRegistryButton: React.FC<SetRegistryButtonProps> = ({
  network,
  domainInput,
  registryAddress,
  selectedChain,
  addTransaction,
}) => {
  const [buttonText, setButtonText] = useState("Set Registry");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const { isConnected, address, chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { writeContract, data: hash, error: writeError } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Reset states when write contract fails
  useEffect(() => {
    if (writeError) {
      setButtonText("Failed");
      setIsProcessing(false);
      setShouldUpdate(false);
      toast.error("Transaction rejected");
      setTimeout(() => {
        setButtonText("Set Registry");
      }, 1500);
    }
  }, [writeError]);

  // Handle network switch and record update
  useEffect(() => {
    const setRegistry = async () => {
      if (
        !shouldUpdate ||
        !isConnected ||
        !domainInput ||
        !walletClient ||
        !address
      )
        return;

      try {
        const targetChainId = chainIdMap[network as keyof typeof chainIdMap];
        if (!targetChainId) {
          throw new Error("Invalid network selected");
        }

        // Only proceed if we're on the correct network
        if (current?.id === targetChainId) {
          setButtonText("Waiting for approval...");

          const chainId = chainIdMap[selectedChain as keyof typeof chainIdMap];
          if (!chainId) {
            throw new Error("Invalid L2 chain selected");
          }

          // Set the L2 registry using the resolver contract
          const node = namehash(domainInput);
          await writeContract({
            address:
              RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES],
            abi: RESOLVER_ABI,
            functionName: "setL2Registry",
            args: [node, BigInt(chainId), registryAddress],
          });

          setButtonText("Pending...");
          setShouldUpdate(false);
        }
      } catch (error) {
        console.error("Set registry error:", error);
        toast.error("Failed to set registry");
        setButtonText("Failed");
        setShouldUpdate(false);
        setIsProcessing(false);
        setTimeout(() => {
          setButtonText("Set Registry");
        }, 1500);
      }
    };

    setRegistry();
  }, [
    current?.id,
    shouldUpdate,
    network,
    domainInput,
    walletClient,
    address,
    isConnected,
    registryAddress,
    selectedChain,
    writeContract,
  ]);

  const handleSetRegistry = async () => {
    if (!isConnected || !domainInput || !walletClient || !address) {
      toast.error("Please connect your wallet and select a domain");
      return;
    }
    if (!registryAddress) {
      toast.error("Please deploy a registry first");
      return;
    }

    try {
      setIsProcessing(true);
      setButtonText("Preparing...");

      const targetChainId = chainIdMap[network as keyof typeof chainIdMap];
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
      console.error("Set registry error:", error);
      toast.error("Failed to switch network");
      setButtonText("Failed");
      setIsProcessing(false);
      setShouldUpdate(false);
      setTimeout(() => {
        setButtonText("Set Registry");
      }, 1500);
    }
  };

  // Reset states on success
  useEffect(() => {
    if (updateSuccess && hash) {
      setButtonText("Success!");
      setIsProcessing(false);
      setShouldUpdate(false);
      addTransaction("Set Registry", network, hash);
      const toastOptions = {
        id: `record-add-${hash}`, // Prevent duplicate toasts
      };
      toast.success("Registry set", toastOptions);
      setTimeout(() => {
        setButtonText("Set Registry");
      }, 1500);
    }
  }, [updateSuccess, hash, network, addTransaction]);

  const isDisabled = isWaitingForTx || isProcessing;

  return (
    <button
      onClick={handleSetRegistry}
      disabled={isDisabled}
      className={`px-4 shadow border-stone-300 h-9 text-sm border rounded-lg text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default SetRegistryButton;
