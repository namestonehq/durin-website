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
import { createWalletClient, custom } from "viem";
import { setRecords } from "@ensdomains/ensjs/wallet";
import { addEnsContracts } from "@ensdomains/ensjs";
import toast from "react-hot-toast";

interface AddRecordButtonProps {
  network: string;
  domainInput: string | undefined;
  registryAddress: Address;
  selectedChain: string;
  addTransaction: (action: string, chain: string, hash: string) => void;
}

const CHAIN_IDS = {
  Sepolia: 11155111,
  Mainnet: 1,
  Base: 8453,
  Optimism: 10,
  Arbitrum: 42161,
  Scroll: 534352,
  Linea: 59144,
};

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

  const handleAddRecord = async () => {
    if (!isConnected || !domainInput || !walletClient || !address) {
      console.error("Wallet not connected, no domain selected");
      toast("Please connect your wallet and select a domain");
      return;
    }
    if (!registryAddress) {
      console.error("Invalid registry address");
      toast("Invalid registry address");
      return;
    }

    try {
      setButtonText("Preparing...");

      // Get target chain ID for ENS network
      const targetChainId = CHAIN_IDS[network as keyof typeof CHAIN_IDS];
      if (!targetChainId) {
        throw new Error("Invalid network selected");
      }

      // Get L2 chain ID
      const l2ChainId = CHAIN_IDS[selectedChain as keyof typeof CHAIN_IDS];
      if (!l2ChainId) {
        throw new Error("Invalid L2 chain selected");
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

      // Create the record value string
      const recordValue = `${l2ChainId}:${registryAddress}`;

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
    } catch (error) {
      console.error("Add record error:", error);
      toast("Failed to add record");
      setButtonText("Failed");
      setTimeout(() => {
        setButtonText("Add Record");
      }, 1500);
    }
  };

  // Reset button text on success
  React.useEffect(() => {
    if (updateSuccess) {
      setButtonText("Success!");
      addTransaction("Added Record", network, hash as string);
      setTimeout(() => {
        setButtonText("Add Record");
        setHash(undefined);
      }, 1500);
    }
  }, [updateSuccess]);

  const isDisabled = isWaitingForTx;
  return (
    <button
      onClick={handleAddRecord}
      disabled={isDisabled}
      className={`px-2 py-1 text-sm border rounded text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default AddRecordButton;
