"use client";
import Image from "next/image";
import { Gelasio } from "next/font/google";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import DeployButton from "./components/deploy-button";
import { type Address } from "viem";
import UpdateResolverButton from "./components/update-resolver-button";
import AddRecordButton from "./components/add-record-button";
import { Domain } from "../lib/types";
import { Copy, Check, ExternalLink, ScrollText } from "lucide-react";
import toast from "react-hot-toast";
import { RESOLVER_ADDRESSES, chainIdMap } from "@/lib/utils";

const gelasio = Gelasio({
  weight: ["500", "400", "700"],
  subsets: ["latin"],
});

interface Transactionn {
  action: string;
  chain: string;
  hash: string;
}

const chainScanMap = {
  Sepolia: "https://sepolia.etherscan.io/",
  Mainnet: "https://etherscan.io/",
  Base: "https://basescan.org/",
  "Base Sepolia": "https://sepolia.basescan.org/",
  Optimism: "https://optimistic.etherscan.io/",
  "Optimism Sepolia": "https://sepolia-optimism.etherscan.io/",
  Arbitrum: "https://arbiscan.io/",
  "Arbitrum Sepolia": "https://sepolia.arbiscan.io/",
  Scroll: "https://scrollscan.com/",
  "Scroll Sepolia": "https://sepolia-blockscout.scroll.io/",
  Linea: "https://linea.scan.io/",
  "Linea Sepolia": "https://sepolia.lineascan.build/",
};

export default function Home() {
  const [network, setNetwork] = useState("Sepolia");
  const [chain, setChain] = useState("Base");
  const [chainName, setChainName] = useState("Base");
  const [chainModifier, setChainModifier] = useState("Sepolia");

  const [selectedDomain, setSelectedDomain] = useState<Domain | undefined>();
  const [registryAddress, setRegistryAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [txHistory, setTxHistory] = useState<Transactionn[]>([]);
  const [recordInput, setRecordInput] = useState("");

  const handleDeploySuccess = (registryAddress: Address) => {
    console.log("New registry deployed at:", registryAddress);
    setRegistryAddress(registryAddress);
    setRecordInput(registryAddress);
  };

  //function to add a transction to the history if it is not already there
  const addTransaction = (action: string, chain: string, hash: string) => {
    if (!txHistory.some((tx) => tx.hash === hash)) {
      console.log("Adding transaction to history:", action, chain, hash);
      setTxHistory((prev) => [
        ...prev,
        {
          action,
          chain,
          hash,
        },
      ]);
    }
  };

  // useEffect to update chain when chainName or chainModifier changes
  useEffect(() => {
    if (chainModifier === "") {
      setChain(chainName);
    } else {
      setChain(`${chainName} ${chainModifier}`);
    }
  }, [chainName, chainModifier]);

  return (
    <div className="flex flex-col h-screen font-sans text-stone-900 relative">
      <div className="flex items-center justify-between h-16 px-4 md:px-10 mt-4">
        <Image
          alt="logo"
          src="durin-logo-with-arch.svg"
          width={115}
          height={30}
        ></Image>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex flex-col flex-grow w-full max-w-5xl gap-6 mx-auto">
        <Image
          className="rounded-lg mt-4"
          src="/banner.svg"
          alt="durin"
          width={1024}
          height={1024}
        ></Image>
        <div className="relative">
          <h1 className={`self-start ${gelasio.className} text-3xl`}>
            Issue onchain ENS subnames on an L2
          </h1>
          <div className="flex">
            <div className="self-start mt-4 w-[calc(100%-340px)] text-stone-600 mr-12">
              Durin is an opinionated approach to issuing ENS L2 subnames. Durin
              is{" "}
              <Link
                target="_blank"
                href={"https://github.com/namestonehq/durin"}
                className="underline underline-offset-4"
              >
                open source
              </Link>{" "}
              and PRs are welcomed. For support reach out to Slobo on{" "}
              <Link
                target="_blank"
                href={"https://t.me/superslobo"}
                className="underline underline-offset-4"
              >
                Telegram
              </Link>
              .
            </div>
            <div className="absolute right-4 -top-20 bg-stone-100 p-6 w-80 rounded-lg shadow-md">
              <div className="text-stone-900 font-bold mb-2">
                What you&apos;ll need
              </div>
              <ul className="list-disc text-sm list-inside text-stone-600 space-y-2 pl-2">
                <li>ENS name (Sepolia or Mainnet)</li>
                <li>Etherscan API key for verification</li>
                <li>Familiarity with solidity</li>
                <li>RPC URL for the chosen chain</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <span className="font-bold">Objective: </span>Launch an onchain ENS
            subname project on an L2 with mintable subname NFTs
          </div>
          <hr className="bg-stone-100 my-6" />
          <h2 className={`${gelasio.className} mb-3 text-xl`}>
            1. Deploy the L2 Registry
          </h2>
          <div className="flex gap-20">
            <div className="bg-stone-100 w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <ScrollText /> Key Contract:{" "}
                <span className="font-bold">L2 Registry</span>
              </div>
              <div className="text-sm text-stone-700">
                The <span className="font-bold">L2 registry</span> tracks
                ownership of ENS subnames. These names are represented as
                ERC-721 NFTs. Durin&apos;s implementation of the registry stores
                text records, cointypes, and contenthash that can be associated
                with a subname.
              </div>
            </div>
            {/* Name & Chain Box*/}
            <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
              <div className="flex items-end justify-between">
                <div className="font-light">Choose an ENS Name</div>

                {/* Toggle Network */}
                <div className="flex p-1 mt-2 text-sm bg-gray-100 rounded">
                  <button
                    onClick={() => setNetwork("Sepolia")}
                    className={`px-4 rounded transition ${
                      network === "Sepolia"
                        ? "bg-white shadow text-black py-1"
                        : "text-gray-500"
                    }`}
                  >
                    Sepolia
                  </button>
                  <button
                    onClick={() => setNetwork("Mainnet")}
                    className={`px-4  rounded transition ${
                      network === "Mainnet"
                        ? "bg-white shadow text-stone-900  py-1"
                        : "text-stone-500"
                    }`}
                  >
                    Mainnet
                  </button>
                </div>
              </div>

              {/* ENS Search & Drop Down */}
              <DomainSelector
                network={network}
                setSelectedDomain={setSelectedDomain}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <div className="font-light">Choose a Chain</div>
                  {/* Toggle testnet or mainnet */}
                  <div className="flex p-1 mt-2 text-sm bg-gray-100 rounded">
                    <button
                      onClick={() => setChainModifier("Sepolia")}
                      className={`px-4 rounded transition ${
                        chainModifier === "Sepolia"
                          ? "bg-white shadow text-black py-1"
                          : "text-gray-500"
                      }`}
                    >
                      Sepolia
                    </button>
                    <button
                      onClick={() => {
                        // Set chainModifier to empty string meaining mainnet
                        setChainModifier("");
                      }}
                      className={`px-4  rounded transition ${
                        chainModifier === ""
                          ? "bg-white shadow text-stone-900  py-1"
                          : "text-stone-500"
                      }`}
                    >
                      Mainnet
                    </button>
                  </div>
                </div>
                <div className="text-sm text-stone-600 ">
                  This is where L2 registry contract will be deployed.{" "}
                </div>
                {/* Toggle Chain */}
                <div className="flex justify-between p-1 mt-2 text-sm bg-gray-100 rounded">
                  <button
                    onClick={() => setChainName("Base")}
                    className={`px-4 rounded transition ${
                      chainName === "Base"
                        ? "bg-white shadow text-black"
                        : "opacity-50"
                    }`}
                  >
                    <Image
                      src="/base.svg"
                      alt="Base"
                      width={28}
                      height={28}
                      className="py-1"
                    />
                  </button>
                  <button
                    onClick={() => setChainName("Scroll")}
                    className={`px-4  rounded transition ${
                      chainName === "Scroll"
                        ? "bg-white shadow text-stone-900"
                        : "opacity-50"
                    }`}
                  >
                    <Image
                      src="/scroll.svg"
                      alt="scroll"
                      width={28}
                      height={28}
                      className="inline-block"
                    />
                  </button>
                  <button
                    onClick={() => setChainName("Optimism")}
                    className={`px-4 rounded transition ${
                      chainName === "Optimism"
                        ? "bg-white shadow text-stone-900"
                        : "opacity-50"
                    }`}
                  >
                    <Image
                      src="/optimism.svg"
                      alt="optimism"
                      width={28}
                      height={28}
                      className="inline-block"
                    />
                  </button>
                  <button
                    onClick={() => setChainName("Arbitrum")}
                    className={`px-4 rounded transition ${
                      chainName === "Arbitrum"
                        ? "bg-white shadow text-stone-900"
                        : "opacity-50"
                    } `}
                  >
                    <Image
                      src="/arbitrum.svg"
                      alt="arbitrum"
                      width={28}
                      height={28}
                      className="inline-block"
                    />
                  </button>

                  <button
                    onClick={() => setChainName("Linea")}
                    className={`px-4 rounded transition ${
                      chainName === "Linea"
                        ? "bg-white shadow text-stone-900"
                        : "opacity-50"
                    } `}
                  >
                    <Image
                      src="/linea.svg"
                      alt="Linea"
                      width={28}
                      height={28}
                      className="inline-block"
                    />
                  </button>
                </div>
                <div className="font-light mt-6">
                  Deploy L2{" "}
                  <Link
                    target="_blank"
                    className="underline underline-offset-4"
                    href={
                      "https://github.com/namestonehq/durin/blob/main/src/L2Registry.sol"
                    }
                  >
                    Registry
                  </Link>{" "}
                  on {chainName} {chainModifier}
                </div>
                <div className="text-sm text-stone-600 ">
                  This will use your connected wallet to deploy the L2 Registry.
                </div>
                <DeployButton
                  selectedBaseName={selectedDomain?.name}
                  selectedChain={chain}
                  onDeploySuccess={handleDeploySuccess}
                  addTransaction={addTransaction}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Deploy Registry Box*/}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          <div className="flex items-center justify-between">
            <div className={`${gelasio.className} text-xl`}>
              Deploy L2 Registry
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center w-5 h-5 text-sm text-stone-500 border border-stone-300 rounded-full cursor-help">
                ?
              </div>
              <div className="absolute z-50 invisible w-72 p-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg shadow-lg group-hover:visible right-0 top-6">
                Deploy a registry contract to store your subname NFTs on the L2
                chain. This is the core contract that tracks subname ownership.
                <br />
                <br />
                You can customize how these subnames work in later steps.
              </div>
            </div>
          </div>
          <hr className="mb-2 bg-stone-100"></hr>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between">
                <div className="font-light">Registry</div>
                <DeployButton
                  selectedBaseName={selectedDomain?.name}
                  selectedChain={chain}
                  onDeploySuccess={handleDeploySuccess}
                  addTransaction={addTransaction}
                />
              </div>
              <div className="text-sm text-stone-500">
                This contract stores subnames as ERC-721 NFTs on the L2 chain
                you selected above.
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="mb-2 font-light text-stone-900">
              <div className="flex items-center gap-2">
                Registry Address
                <button
                  onClick={() => {
                    if (registryAddress) {
                      navigator.clipboard
                        .writeText(registryAddress)
                        .then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                    } else {
                      toast.error("Waiting for deploy...");
                    }
                  }}
                  className="p-1 hover:bg-stone-200 rounded-md transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-stone-600" />
                  )}
                </button>
                {/* Link to blockscan if registry deployed */}
                {registryAddress && (
                  <Image
                    src={"etherscan-logo.svg"}
                    alt="etherscan"
                    width={24}
                    height={24}
                    className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1"
                    onClick={() => {
                      window.open(
                        chainScanMap[chain as keyof typeof chainScanMap] +
                          "address/" +
                          registryAddress,
                        "_blank"
                      );
                    }}
                  />
                )}
              </div>
              <div
                className={`w-full mt-2 h-8 px-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-stone-100 text-stone-400`}
              >
                {registryAddress ? registryAddress : "Waiting for Deploy..."}
              </div>
            </div>
          </div>
        </div>
        {/* Update Records Box */}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          <div className="flex items-center justify-between">
            <div className={`${gelasio.className} text-xl`}>
              Configure L1 Name
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center w-5 h-5 text-sm text-stone-500 border border-stone-300 rounded-full cursor-help">
                ?
              </div>
              <div className="absolute z-50 invisible w-72 p-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg shadow-lg group-hover:visible right-0 top-6">
                Connect your ENS name to the L2 registry by updating its
                resolver and adding a pointer to your registry contract. Your
                new resolver allows your subnames to resolve.
                <br />
                <br />
                You can always revert this by changing the resolver back on
                app.ens.domains.
              </div>
            </div>
          </div>
          <hr className="mb-2 bg-stone-100"></hr>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between">
                <div className="font-light">Change Resolver</div>
                <UpdateResolverButton
                  network={network}
                  selectedDomain={selectedDomain}
                  addTransaction={addTransaction}
                />
              </div>
              <div className="text-sm text-stone-500">
                Update the resolver to:
                <div className="flex gap-2 mt-2">
                  <div className="inline-flex items-center gap-2.5 px-2 py-1 relative bg-stone-50 rounded-lg border border-solid border-stone-200">
                    <div className="relative w-fit font-inline-code text-[12px] text-stone-500 whitespace-nowrap ">
                      {
                        RESOLVER_ADDRESSES[
                          network as keyof typeof RESOLVER_ADDRESSES
                        ]
                      }
                    </div>
                  </div>
                  <Image
                    src={"etherscan-logo.svg"}
                    alt="etherscan"
                    width={24}
                    height={24}
                    className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1"
                    onClick={() => {
                      window.open(
                        network === "Sepolia"
                          ? `https://sepolia.etherscan.io/address/${
                              RESOLVER_ADDRESSES[
                                network as keyof typeof RESOLVER_ADDRESSES
                              ]
                            }`
                          : `https://etherscan.io/address/${
                              RESOLVER_ADDRESSES[
                                network as keyof typeof RESOLVER_ADDRESSES
                              ]
                            }`,
                        "_blank"
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between">
                <div className="font-light">Set L2 Target Info</div>
                <AddRecordButton
                  network={network}
                  domainInput={selectedDomain?.name}
                  registryAddress={recordInput as Address}
                  selectedChain={chain}
                  addTransaction={addTransaction}
                />
              </div>
              <div className="text-sm text-stone-500">
                This connects the L2 registry to your L1 name.
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center rounded-md border border-stone-200 overflow-hidden">
                {/* Left section */}
                <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 border-r border-stone-200 rounded-l-md">
                  <Image
                    src={`/${chainName.toLowerCase()}.svg`}
                    alt={chain}
                    width={16}
                    height={16}
                    className="py-1"
                  />
                  <div className="text-stone-500 font-p whitespace-nowrap">
                    {chainIdMap[chain]} :
                  </div>
                </div>

                {/* Right section */}
                <input
                  className="flex-1 px-3 py-3 bg-stone-100 text-stone-500 text-xs"
                  value={recordInput}
                  onChange={(e) => setRecordInput(e.target.value)}
                  placeholder="Waiting for registry deploy..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-sans text-stone-500">Record format</div>
              <div className="flex px-2 py-1 bg-stone-50 rounded-lg border border-stone-200 gap-2 w-min text-nowrap flex-nowrap">
                <div className="font-mono text-xs font-bold text-stone-500">
                  registry
                </div>
                <div className="font-mono text-xs text-stone-500">
                  {"{"}chain_id{"}"}:{"{"}registry_contract{"}"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Configure Registrar Box*/}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          <div className="flex items-center justify-between">
            <div className={`${gelasio.className} text-xl`}>
              Customize L2 Registrar
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center w-5 h-5 text-sm text-stone-500 border border-stone-300 rounded-full cursor-help">
                ?
              </div>
              <div className="absolute z-50 invisible w-72 p-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg shadow-lg group-hover:visible right-0 top-6">
                Customize how users can mint subnames by modifying the registrar
                contract. You can set prices, expiration times, and other rules.
                The GitHub link below has instructions on how to mint your
                registrar and example code.
                <br />
                <br />
                You&apos;ll need your registry address for some of the steps
                which is why it&apos;s included below.
              </div>
            </div>
          </div>
          <hr className="mb-2 bg-stone-100"></hr>
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <div className="font-light ">Registrar</div>
              <button
                onClick={() => {
                  window.open(
                    "https://github.com/namestonehq/durin?tab=readme-ov-file#3-customize-registrar-template",
                    "_blank"
                  );
                }}
                className="flex items-center gap-2 px-2 py-1 text-sm border rounded text- text-stone-900 hover:bg-stone-100"
              >
                <Image
                  alt="github"
                  src="/github.svg"
                  width={16}
                  height={16}
                ></Image>
                Configure
              </button>
            </div>
            <div className="text-sm text-stone-500">
              The registrar controls how a name can be minted from the registry
              you deployed earlier. We provide a basic version that you can
              modify.
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="mb-2 font-light text-stone-900">
              <div className="flex items-center gap-2">
                Registry Address
                <button
                  onClick={() => {
                    if (registryAddress) {
                      navigator.clipboard
                        .writeText(registryAddress)
                        .then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                    } else {
                      toast.error("Waiting for deploy...");
                    }
                  }}
                  className="p-1 hover:bg-stone-200 rounded-md transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-stone-600" />
                  )}
                </button>
                {/* Link to blockscan if registry deployed */}
                {registryAddress && (
                  <Image
                    src={"etherscan-logo.svg"}
                    alt="etherscan"
                    width={24}
                    height={24}
                    className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1"
                    onClick={() => {
                      window.open(
                        chainScanMap[chain as keyof typeof chainScanMap] +
                          "address/" +
                          registryAddress,
                        "_blank"
                      );
                    }}
                  />
                )}
              </div>
              <div
                className={`w-full mt-2 h-8 px-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-stone-100 text-stone-400`}
              >
                {registryAddress ? registryAddress : "Waiting for Deploy..."}
              </div>
            </div>
          </div>
        </div>

        {/* Configure L2 Registry Box */}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          <div className="flex items-center justify-between">
            <div className={`${gelasio.className} text-xl`}>
              Connect L2 Registry to Registrar
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center w-5 h-5 text-sm text-stone-500 border border-stone-300 rounded-full cursor-help">
                ?
              </div>
              <div className="absolute z-50 invisible w-72 p-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg shadow-lg group-hover:visible right-0 top-6">
                Grant permission to your registrar contract so it can mint
                subnames through your registry. Calling addRegisrar() on the
                registry connects the two contracts together.
              </div>
            </div>
          </div>
          <hr className="mb-2 bg-stone-100"></hr>
          <div className="text-sm text-stone-500">
            As the final step, call{" "}
            <div className="w-fit inline px-1 py-1 bg-stone-50 rounded-lg border border-stone-200 font-mono text-xs text-stone-500">
              addRegistrar()
            </div>{" "}
            on your registry with the address of your deployed registrar.
          </div>
        </div>

        {/* Tx history */}
        <div className="items-start w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={`${gelasio.className} text-xl py-4`}>
              Transaction History
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center w-5 h-5 text-sm text-stone-500 border border-stone-300 rounded-full cursor-help">
                ?
              </div>
              <div className="absolute z-50 invisible w-72 p-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg shadow-lg group-hover:visible right-0 top-6">
                Track your progress through the guide. Each transaction shows up
                here when completed.
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3 px-6 py-3 bg-white border rounded-lg border-stone-200">
            {txHistory.length === 0 ? (
              <div className="text-sm text-stone-500">No transactions yet</div>
            ) : (
              txHistory.reverse().map((tx, index) => {
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg justify-start items-start gap-3 inline-flex  overflow-clip"
                  >
                    <div className=" flex-col justify-start items-start gap-2 inline-flex">
                      <div className="flex gap-2 items-center">
                        <div className="text-stone-900 text-base font-normal font-['Helvetica Neue'] leading-normal">
                          {tx.action}
                        </div>
                        <ExternalLink
                          className="text-stone-500 h-4 w-4 cursor-pointer"
                          onClick={() => {
                            window.open(
                              `${
                                chainScanMap[
                                  tx.chain as keyof typeof chainScanMap
                                ]
                              }tx/${tx.hash}`,
                              "_blank"
                            );
                          }}
                        />
                      </div>
                      <div className="justify-start items-center gap-2 inline-flex">
                        <div className="grow shrink basis-0 text-stone-500 text-xs font-normal font-['Menlo'] leading-tight text-ellipsis">
                          {tx.hash}
                        </div>
                      </div>
                    </div>
                    <div className="w-5 h-5 relative" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <footer className="mt-10">
        <div className=" bg-neutral-900 h-16 absolute items-center w-full z-10 flex">
          <div className="flex  items-center justify-center sm:w-[800px] mx-auto">
            <span className="ml-1  text-neutral-300">
              Built By{" "}
              <Link
                href="https://namestone.com"
                target="_blank"
                className=" hover:text-orange-400 transition-colors duration-300 ease-in text-neutral-300"
              >
                NameStone
              </Link>{" "}
              <span className="mr-2 text-neutral-300">|</span>
            </span>
            <Link href="https://x.com/namestonehq" target="_blank">
              <Image
                className="mr-1"
                src="/x-logo.png"
                alt="Logo"
                width={12}
                height={12}
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DomainSelector({
  network,
  setSelectedDomain,
}: {
  network: string;
  setSelectedDomain: (domain: Domain | undefined) => void;
}) {
  const [domainInputSelected, setDomainInputSelected] = useState(false);
  const [userDomains, setUserDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [domainInput, setDomainInput] = useState("");

  const { address, isConnected } = useAccount();

  // Fetch ENS names when wallet is connected
  useEffect(() => {
    const fetchENSNames = async () => {
      setSelectedDomain(undefined);
      setDomainInput("");

      if (!isConnected || !address) {
        setUserDomains([]);
        return;
      }

      try {
        setIsLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        const url = new URL(`${baseUrl}/api/get-domains`);
        url.searchParams.append("address", address);
        url.searchParams.append("network", network);

        const response = await fetch(url.toString());
        const data: Domain[] = await response.json();

        if (response.status === 200) {
          setUserDomains(data.filter((name) => name !== null));
        } else {
          console.error("Error fetching domains:", data);
          setUserDomains([]);
        }
      } catch (error) {
        console.error("Error fetching ENS names:", error);
        setUserDomains([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchENSNames();
  }, [address, isConnected, network, setSelectedDomain]);

  const filteredDomainList = userDomains.filter((domain) =>
    domain.name.toLowerCase().includes(domainInput.toLowerCase())
  );

  useEffect(() => {
    if (
      filteredDomainList.length === 1 &&
      domainInput === filteredDomainList[0].name
    ) {
      setSelectedDomain(filteredDomainList[0]);
    }
  }, [filteredDomainList, domainInput, setSelectedDomain]);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          id="select-domain"
          placeholder={
            !isConnected
              ? "Connect wallet to see your ENS names"
              : isLoading
              ? "Loading your ENS names..."
              : "Search your ENS names"
          }
          onChange={(e) => {
            setDomainInput(e.target.value);
            setSelectedDomain(undefined);
          }}
          value={domainInput}
          onFocus={() => setDomainInputSelected(true)}
          onBlur={() => {
            setTimeout(() => setDomainInputSelected(false), 200);
          }}
          disabled={!isConnected || isLoading}
          className={`w-full h-10 px-4 border-stone-200 border rounded-lg appearance-none focus:ring-2 focus:ring-stone-200 focus:outline-none focus:border-transparent ${
            !isConnected || isLoading
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : ""
          }`}
        />
        <Image
          alt="chevron"
          src="/chevron-down.svg"
          width={16}
          height={16}
          className="absolute transform -translate-y-1/2 right-3 top-1/2"
        />

        {/* Dropdown with domain list */}
        {isConnected && domainInputSelected && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-stone-400">
                Loading your ENS names...
              </div>
            ) : filteredDomainList.length > 0 ? (
              filteredDomainList.map((domain, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setDomainInput(domain.name);
                    setSelectedDomain(domain);
                    setDomainInputSelected(false);
                  }}
                  className="p-2 cursor-pointer hover:bg-stone-100 border-b border-stone-200 last:border-none"
                >
                  {domain.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-stone-400">
                {domainInput
                  ? "No matching ENS names found"
                  : userDomains.length === 0
                  ? "No ENS names found for this address"
                  : "Type to search your ENS names"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
