import React from "react";
import { useState } from "react";
import {
  useChains,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseAbi, decodeEventLog } from "viem";
import { type Address } from "viem";

interface DeployButtonProps {
  selectedChain: string;
  selectedBaseName: string;
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
  const { chain: current } = useAccount();
  const chains = useChains();
  const { switchChain } = useSwitchChain();

  const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
  const FACTORY_ABI = parseAbi([
    "function deployRegistry(string name, string symbol, string baseURI) external returns (address)",
    "event RegistryDeployed(address indexed registry, string name, string symbol, string baseURI)",
  ]);

  const { writeContract, data: hash } = useWriteContract();
  const {
    isLoading: isWaitingForTx,
    isSuccess: deploySuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Extract registry address when deployment succeeds
  React.useEffect(() => {
    if (deploySuccess && receipt && onDeploySuccess) {
      try {
        // Find the RegistryDeployed event in the logs
        const log = receipt.logs.find((log) => {
          try {
            const event = decodeEventLog({
              abi: FACTORY_ABI,
              data: log.data,
              topics: log.topics,
            });
            return event.eventName === "RegistryDeployed";
          } catch {
            return false;
          }
        });

        if (log) {
          const event = decodeEventLog({
            abi: FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });

          // The registry address is the first indexed parameter
          const registryAddress = log.topics[1] as Address;
          onDeploySuccess(registryAddress);
        }
      } catch (error) {
        console.error("Error extracting registry address:", error);
      }
    }
  }, [deploySuccess, receipt, onDeploySuccess]);

  const deployRegistry = async (chainId: number) => {
    const contractName = "L2Registry";
    const contractSymbol = selectedBaseName;
    const baseUri = "";

    await writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "deployRegistry",
      args: [contractName, contractSymbol, baseUri],
      chainId,
    });
  };

  const handleDeploy = async (): Promise<void> => {
    try {
      setIsDeploying(true);
      const targetChainId = chainIdMap[selectedChain];

      if (current?.id !== targetChainId) {
        const targetChain = chains.find((chain) => chain.id === targetChainId);
        if (targetChain) {
          await switchChain({ chainId: targetChainId });
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          throw new Error("Selected chain not configured in wagmi");
        }
      }

      await deployRegistry(targetChainId);
    } catch (error) {
      console.error(
        "Deployment error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={isDeploying || isWaitingForTx}
      className={`px-4 py-1 text-sm border rounded text-stone-900 ${
        isDeploying || isWaitingForTx
          ? "bg-stone-100 cursor-not-allowed"
          : "hover:bg-stone-100"
      }`}
    >
      {isDeploying
        ? "Switching Network..."
        : isWaitingForTx
        ? "Deploying..."
        : deploySuccess
        ? "Deployed!"
        : "Deploy"}
    </button>
  );
};

export default DeployButton;
