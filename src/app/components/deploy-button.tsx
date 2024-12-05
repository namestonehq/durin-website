import React from "react";
import { useState, useEffect } from "react";
import {
  useChains,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseAbi, type Address } from "viem";
import toast from "react-hot-toast";
import { chainIdMap } from "@/lib/utils";

interface DeployButtonProps {
  selectedChain: string;
  selectedBaseName: string | undefined;
  onDeploySuccess?: (registryAddress: Address) => void;
  addTransaction: (action: string, chain: string, hash: string) => void;
}

const DeployButton: React.FC<DeployButtonProps> = ({
  selectedChain,
  selectedBaseName,
  onDeploySuccess,
  addTransaction,
}) => {
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState<boolean>(false);
  const [shouldDeploy, setShouldDeploy] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);
  const { chain: current } = useAccount();
  const chains = useChains();
  const { switchChain, error: switchError } = useSwitchChain();

  const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
  const FACTORY_ABI = parseAbi([
    "function deployRegistry(string name, string symbol, string baseURI) external returns (address)",
  ]);

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const {
    isLoading: isWaitingForTx,
    isSuccess: txDeploySuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // @notice This useEffect hook is used to set the deploySuccess state to true when the transaction is successful
  // @dev We can't use the txDeploySuccess state directly because waitForTransactionReceipt resets when reused in other places
  useEffect(() => {
    if (txDeploySuccess) {
      setDeploySuccess(true);
    }
  }, [txDeploySuccess]);

  // Handle network switch error
  useEffect(() => {
    if (switchError) {
      console.error("Network switch error:", switchError);
      toast.error("Network switch cancelled");
      setIsDeploying(false);
      setShouldDeploy(false);
      setIsNetworkSwitching(false);
    }
  }, [switchError]);

  // Reset states when write contract fails
  useEffect(() => {
    if (writeError) {
      setIsDeploying(false);
      setShouldDeploy(false);
      setIsNetworkSwitching(false);
      toast.error("Transaction rejected");
    }
  }, [writeError]);

  // Watch for network changes and deploy when ready
  useEffect(() => {
    const targetChainId = chainIdMap[selectedChain];

    if (shouldDeploy && current?.id === targetChainId) {
      setIsNetworkSwitching(false);
      const deploy = async () => {
        try {
          if (!selectedBaseName) return;

          const contractName = "L2Registry";
          const contractSymbol = selectedBaseName;
          const baseUri = "";

          await writeContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: "deployRegistry",
            args: [contractName, contractSymbol, baseUri],
            chainId: targetChainId,
          });
        } catch (error) {
          console.error("Deploy error:", error);
          toast.error("Failed to deploy contract");
          setIsDeploying(false);
          setShouldDeploy(false);
          setIsNetworkSwitching(false);
        }
      };

      deploy();
    }
  }, [
    current?.id,
    shouldDeploy,
    selectedChain,
    selectedBaseName,
    writeContract,
  ]);

  // Handle deployment success
  useEffect(() => {
    if (
      !isDeploying || // Add this check to prevent double handling
      !deploySuccess ||
      !receipt ||
      !onDeploySuccess ||
      receipt.logs.length === 0
    ) {
      return;
    }

    const registryAddress = receipt.logs[0].address as Address;
    onDeploySuccess(registryAddress);
    setIsDeploying(false);
    setShouldDeploy(false);
    setIsNetworkSwitching(false);
    toast.success("Registry deployed");
    addTransaction("Deployed Registry", selectedChain, receipt.transactionHash);
  }, [
    deploySuccess,
    receipt,
    onDeploySuccess,
    isDeploying,
    selectedChain,
    addTransaction,
  ]);

  const handleDeploy = async (): Promise<void> => {
    try {
      if (!selectedBaseName) {
        toast.error("Wallet not connected or no domain selected");
        return;
      }
      setIsDeploying(true);
      const targetChainId = chainIdMap[selectedChain];

      if (current?.id !== targetChainId) {
        const targetChain = chains.find((chain) => chain.id === targetChainId);
        if (!targetChain) {
          throw new Error("Selected chain not configured in wagmi");
        }
        setShouldDeploy(true);
        setIsNetworkSwitching(true);
        switchChain({ chainId: targetChainId });
      } else {
        const contractName = selectedBaseName;
        const contractSymbol = selectedBaseName;
        const baseUri = "";

        await writeContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "deployRegistry",
          args: [contractName, contractSymbol, baseUri],
          chainId: targetChainId,
        });
      }
    } catch (error) {
      console.error(
        "Deployment error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast.error("Deployment failed");
      setIsDeploying(false);
      setShouldDeploy(false);
      setIsNetworkSwitching(false);
    }
  };

  const buttonText = () => {
    if (deploySuccess) return "Deployed!";
    if (isWaitingForTx) return "Deploying...";
    if (isNetworkSwitching) return "Switching Network...";
    if (isDeploying) return "Confirming...";
    return "Deploy";
  };

  const isDisabled =
    isWaitingForTx || isDeploying || isNetworkSwitching || deploySuccess;

  return (
    <button
      onClick={handleDeploy}
      disabled={isDisabled}
      className={`px-4 py-1 text-sm border rounded text-stone-900 ${
        isDisabled ? "bg-stone-100 cursor-not-allowed" : "hover:bg-stone-100"
      }`}
    >
      {buttonText()}
    </button>
  );
};

export default DeployButton;
