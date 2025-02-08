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
import { createWalletClient, custom } from "viem";
import { setRecords } from "@ensdomains/ensjs/wallet";
import { addEnsContracts } from "@ensdomains/ensjs";
import toast from "react-hot-toast";
import { chainIdMap } from "@/lib/utils";

interface AddRecordButtonProps {
  network: string;
  domainInput: string | undefined;
  registryAddress: Address;
  selectedChain: string;
  addTransaction: (action: string, chain: string, hash: string) => void;
}

const RESOLVER_ADDRESSES = {
  Sepolia: "0x00f9314C69c3e7C37b3C7aD36EF9FB40d94eDDe1" as Address,
  Mainnet: "0x2A6C785b002Ad859a3BAED69211167C7e998aAeC" as Address,
};

const AddRecordButton: React.FC<AddRecordButtonProps> = ({
  network,
  domainInput,
  registryAddress,
  selectedChain,
  addTransaction,
}) => {
  const [buttonText, setButtonText] = useState("Add Record");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const { isConnected, address, chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const { isLoading: isWaitingForTx, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle network switch and record update
  useEffect(() => {
    const addRecord = async () => {
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

          // Create the record value string
          const recordValue = `${chainId}:${registryAddress}`;

          // Create ENS wallet client
          const ensWalletClient = createWalletClient({
            account: address,
            chain: addEnsContracts(network === "Mainnet" ? mainnet : sepolia),
            transport: custom(walletClient.transport),
          });

          // Set the record using ENS.js
          const txHash = await setRecords(ensWalletClient, {
            name: domainInput,
            resolverAddress:
              RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES],
            texts: [
              {
                key: "registry",
                value: recordValue,
              },
            ],
          });

          setHash(txHash);
          setButtonText("Pending...");
          setShouldUpdate(false);
        }
      } catch (error) {
        console.error("Add record error:", error);
        toast.error("Failed to add record");
        setButtonText("Failed");
        setShouldUpdate(false);
        setIsProcessing(false);
        setTimeout(() => {
          setButtonText("Add Record");
        }, 1500);
      }
    };

    addRecord();
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
  ]);

  const handleAddRecord = async () => {
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
      console.error("Add record error:", error);
      toast.error("Failed to switch network");
      setButtonText("Failed");
      setIsProcessing(false);
      setShouldUpdate(false);
      setTimeout(() => {
        setButtonText("Add Record");
      }, 1500);
    }
  };

  // Reset states on success
  useEffect(() => {
    if (updateSuccess) {
      setButtonText("Success!");
      setIsProcessing(false);
      setShouldUpdate(false);
      addTransaction("Added Record", network, hash as string);
      const toastOptions = {
        id: `record-add-${hash}`, // Prevent duplicate toasts
      };
      toast.success("Record added ", toastOptions);
      setTimeout(() => {
        setButtonText("Add Record");
        setHash(undefined);
      }, 1500);
    }
  }, [updateSuccess, hash, network, addTransaction]);

  const isDisabled = isWaitingForTx || isProcessing;

  return (
    <button
      onClick={handleAddRecord}
      disabled={isDisabled}
      className={`px-4 shadow border-stone-300 h-9 text-sm border rounded-lg text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default AddRecordButton;
