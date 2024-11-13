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

interface DeployButtonProps {
  selectedChain: string;
  selectedBaseName: string | undefined;
  onDeploySuccess?: (registryAddress: Address) => void;
}

const chainIdMap: { [key: string]: number } = {
  Base: 8453,
  Optimism: 10,
  Arbitrum: 42161,
  Scroll: 534352,
  Linea: 59144,
};

const DeployButton: React.FC<DeployButtonProps> = ({
  selectedChain,
  selectedBaseName,
  onDeploySuccess,
}) => {
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState<boolean>(false);
  const [shouldDeploy, setShouldDeploy] = useState<boolean>(false);
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
    isSuccess: deploySuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle network switch error
  useEffect(() => {
    if (switchError) {
      console.error("Network switch error:", switchError);
      toast("Network switch cancelled");
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
      toast("Transaction rejected");
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
          toast("Failed to deploy contract");
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
      deploySuccess &&
      receipt &&
      onDeploySuccess &&
      receipt.logs.length > 0
    ) {
      const registryAddress = receipt.logs[0].address as Address;
      onDeploySuccess(registryAddress);
      setIsDeploying(false);
      setShouldDeploy(false);
      setIsNetworkSwitching(false);
    }
  }, [deploySuccess, receipt, onDeploySuccess]);

  const handleDeploy = async (): Promise<void> => {
    try {
      if (!selectedBaseName) {
        toast("Wallet not connected or no domain selected");
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
        // Don't wrap this in try/catch - we'll handle the error in the useEffect
        switchChain({ chainId: targetChainId });
      } else {
        // If we're already on the right network, deploy immediately
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
      }
    } catch (error) {
      console.error(
        "Deployment error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast("Deployment failed");
      setIsDeploying(false);
      setShouldDeploy(false);
      setIsNetworkSwitching(false);
    }
  };

  const buttonText = () => {
    if (isWaitingForTx) return "Deploying...";
    if (isNetworkSwitching) return "Switching Network...";
    if (deploySuccess) return "Deployed!";
    if (isDeploying) return "Confirming...";
    return "Deploy";
  };

  const isDisabled = isWaitingForTx || isDeploying || isNetworkSwitching;

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
