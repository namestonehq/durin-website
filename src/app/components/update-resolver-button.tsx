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
import { createWalletClient, custom } from "viem";
import { Domain } from "../../lib/types";
import toast from "react-hot-toast";
import { RESOLVER_ADDRESSES } from "@/lib/utils";

// Component props interface
interface UpdateResolverButtonProps {
  network: string; // Current network (Mainnet or Sepolia)
  selectedDomain: Domain | undefined; // Selected ENS domain details
  addTransaction: (action: string, chain: string, hash: string) => void; // Callback to track transactions
}

// Constants for NameWrapper contract addresses
const NAMEWRAPPER = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";
const NAMEWRAPPER_SEPOLIA = "0x0635513f179D50A207757E05759CbD106d7dFcE8";

// Chain IDs for supported networks
const CHAIN_IDS = {
  Sepolia: 11155111,
  Mainnet: 1,
};

const UpdateResolverButton: React.FC<UpdateResolverButtonProps> = ({
  network,
  selectedDomain,
  addTransaction,
}) => {
  // State management
  const [buttonText, setButtonText] = useState("Update Resolver"); // Button text that changes based on state
  const [hash, setHash] = useState<`0x${string}` | undefined>(); // Transaction hash
  const [shouldUpdate, setShouldUpdate] = useState(false); // Flag to trigger resolver update
  const [isProcessing, setIsProcessing] = useState(false); // Processing state flag
  const [currentResolver, setCurrentResolver] = useState<Address | null>(null); // Current resolver address

  // Wagmi hooks for wallet interaction
  const { isConnected, address } = useAccount();
  const { chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { isLoading: isWaitingForTx, isSuccess: updateSuccess } =
    useWaitForTransactionReceipt({ hash });

  // useEffect to setCurrentResolver when selectedDomain changes
  useEffect(() => {
    setCurrentResolver(selectedDomain?.resolver as `0x${string}`);
  }, [selectedDomain]);

  // Check resolver when domain changes and on
  useEffect(() => {
    try {
      const expectedResolver =
        RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];

      // Update button text based on resolver status
      console.log("Checking resolver:", currentResolver, expectedResolver);
      if (currentResolver === expectedResolver) {
        setButtonText("Resolver up to date ✓");
      } else if (
        currentResolver === "0x0000000000000000000000000000000000000000"
      ) {
        setButtonText("Set Resolver");
      } else {
        setButtonText("Update Resolver");
      }
    } catch (error) {
      console.error("Error checking resolver:", error);
      setButtonText("Update Resolver");
    }
  }, [selectedDomain?.name, network, currentResolver]);

  // Handle button click
  const handleUpdateResolver = async () => {
    const expectedResolver =
      RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];
    if (currentResolver === expectedResolver) return;

    if (!isConnected || !selectedDomain || !walletClient || !address) {
      toast.error("Wallet not connected or no domain selected");
      return;
    }

    try {
      setIsProcessing(true);
      setButtonText("Preparing...");

      // Handle network switching if needed
      const targetChainId = CHAIN_IDS[network as keyof typeof CHAIN_IDS];
      if (!targetChainId) throw new Error("Invalid network selected");

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
        setShouldUpdate(true);
      }
    } catch (error) {
      console.error("Update resolver error:", error);
      setButtonText("Failed");
      setIsProcessing(false);
      setShouldUpdate(false);
      setTimeout(() => setButtonText("Update Resolver"), 1500);
    }
  };

  // Handle resolver update process
  // Actually swiches the resolver
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
        if (!targetChainId) throw new Error("Invalid network selected");

        if (current?.id === targetChainId) {
          setButtonText("Waiting for approval...");

          const resolverAddress =
            RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];
          if (!resolverAddress) throw new Error("Invalid network selected");

          // Create ENS wallet client
          const ensWalletClient = createWalletClient({
            account: address,
            chain: addEnsContracts(network === "Mainnet" ? mainnet : sepolia),
            transport: custom(walletClient.transport),
          });

          // Set resolver using ENS.js
          const txHash = await setResolver(ensWalletClient, {
            name: selectedDomain.name,
            contract:
              selectedDomain?.owner === NAMEWRAPPER ||
              selectedDomain?.owner === NAMEWRAPPER_SEPOLIA
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
        setTimeout(() => setButtonText("Update Resolver"), 1500);
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

  // Handle successful update
  useEffect(() => {
    if (updateSuccess && hash) {
      setButtonText("Success!");
      setIsProcessing(false);
      setShouldUpdate(false);
      addTransaction("Updated Resolver", network, hash);
      setCurrentResolver(
        RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES]
      );

      const toastOptions = {
        id: `resolver-update-${hash}`, // Prevent duplicate toasts
      };
      toast.success("Resolver successfully updated!", toastOptions);

      setTimeout(() => {
        setHash(undefined);
        setButtonText("Resolver up to date ✓");
      }, 2000);
    }
  }, [updateSuccess, hash, network, addTransaction]);

  // Disable button conditions
  const isDisabled =
    isWaitingForTx ||
    isProcessing ||
    currentResolver ===
      RESOLVER_ADDRESSES[network as keyof typeof RESOLVER_ADDRESSES];

  return (
    <button
      onClick={handleUpdateResolver}
      disabled={isDisabled}
      className={`px-4 shadow border-stone-300 h-9 text-sm border rounded-lg text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default UpdateResolverButton;
