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
import SetRegistryButton from "./components/set-registry-button";
import { Domain } from "../lib/types";
import { Copy, Check, ExternalLink, ScrollText, Sparkles } from "lucide-react";

import { RESOLVER_ADDRESSES } from "@/lib/utils";

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
  "World Chain": "https://worldscan.org/",
  "World Chain Sepolia": "https://sepolia.worldscan.org/",
  Celo: "https://celoscan.io/",
  "Celo Alfajores": "https://alfajores.celoscan.io/",
  Polygon: "https://polygonscan.com/",
  "Polygon Amoy": "https://amoy.polygonscan.com/",
};

function getFullChainName(chainName: string, isTestnet: boolean) {
  return isTestnet
    ? chainName === "Celo"
      ? "Celo Alfajores"
      : chainName === "Polygon"
      ? "Polygon Amoy"
      : `${chainName} Sepolia`
    : chainName;
}

export default function Home() {
  const [network, setNetwork] = useState("Sepolia");
  const [chainName, setChainName] = useState("Base");
  const [isTestnet, setIsTestnet] = useState(true);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);

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
      <main className="flex px-4 lg:px-0 flex-col flex-grow w-full max-w-5xl gap-6 mx-auto">
        <Image
          className="rounded-lg mt-4 hidden md:block"
          src="/banner.webp"
          alt="durin"
          width={1024}
          height={1024}
        ></Image>
        <Image
          className="rounded-lg mt-4 self-center block md:hidden"
          src="/banner-square.webp"
          alt="durin"
          width={256}
          height={256}
        ></Image>
        <div className="relative">
          <h1
            className={`self-start ${gelasio.className} w-full md:w-[calc(100%-340px)] text-2xl md:text-3xl`}
          >
            Issue onchain ENS subdomains on an L2
          </h1>
          <div className="flex">
            <div className="self-start mt-4 w-full md:w-[calc(100%-340px)] text-stone-600 mr-12">
              Durin is an opinionated approach to issuing ENS L2 subdomains.
              Durin is{" "}
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
            <div className="absolute hidden md:block right-4 -top-20 bg-stone-150 p-6 w-80 rounded-lg shadow-md">
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
            subdomain project on an L2 with mintable subdomain NFTs
          </div>
          <hr className="bg-stone-100 my-6" />
          {/* Deploy L2 Registry */}
          <h2 className={`${gelasio.className} mb-3 text-xl`}>
            1. Deploy the L2 Registry
          </h2>
          <div className="flex flex-col md:flex-row gap-20">
            <div className="bg-stone-150 z-10 w-full md:w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <ScrollText /> Key Contract:{" "}
                <span className="font-bold">L2 Registry</span>
              </div>
              <div className="text-sm text-stone-700">
                The <span className="font-bold">L2 registry</span> tracks
                ownership of ENS subdomains. These names are represented as
                ERC-721 NFTs. Durin&apos;s implementation of the registry stores
                text records, cointypes, and contenthash that can be associated
                with a subdomain.
              </div>
            </div>
            {/* Name & Chain Box*/}
            <div className="w-full">
              <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
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
                        onClick={() => {
                          // Set isTestnet to true
                          setIsTestnet(true);
                        }}
                        className={`px-4 rounded transition ${
                          isTestnet
                            ? "bg-white shadow text-black py-1"
                            : "text-gray-500"
                        }`}
                      >
                        Testnet
                      </button>
                      <button
                        onClick={() => {
                          // Set isTestnet to false
                          setIsTestnet(false);
                        }}
                        className={`px-4  rounded transition ${
                          !isTestnet
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
                  {/* Chain Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
                      className="flex items-center justify-between w-full p-3 text-sm bg-gray-100 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/${chainName
                            .toLowerCase()
                            .replace(/\s+/g, "")}-icon.svg`}
                          alt={chainName}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{getFullChainName(chainName, isTestnet)}</span>
                      </div>
                      <Image
                        src="/chevron-down.svg"
                        alt="chevron"
                        width={16}
                        height={16}
                        className={`transition-transform ${
                          chainDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {chainDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {[
                          { name: "Base", icon: "base" },
                          { name: "Scroll", icon: "scroll" },
                          { name: "Optimism", icon: "optimism" },
                          { name: "Arbitrum", icon: "arbitrum" },
                          { name: "Linea", icon: "linea" },
                          { name: "Celo", icon: "celo" },
                          { name: "Polygon", icon: "polygon" },
                          { name: "World Chain", icon: "worldchain" },
                        ].map((chain) => (
                          <button
                            key={chain.name}
                            onClick={() => {
                              setChainName(chain.name);
                              setChainDropdownOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full p-3 hover:bg-gray-50 ${
                              chainName === chain.name ? "bg-gray-50" : ""
                            }`}
                          >
                            <Image
                              src={`/${chain.icon}-icon.svg`}
                              alt={chain.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span>
                              {getFullChainName(chain.name, isTestnet)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-light mt-6">
                    Deploy L2{" "}
                    <Link
                      target="_blank"
                      className="underline underline-offset-4"
                      href={
                        "https://github.com/namestonehq/durin/blob/main/src/examples/L2Registrar.sol"
                      }
                    >
                      Registry
                    </Link>{" "}
                    on {getFullChainName(chainName, isTestnet)}
                  </div>
                  <div className="text-sm text-stone-600 ">
                    This will use your connected wallet to deploy the L2
                    Registry.
                  </div>
                  <DeployButton
                    selectedBaseName={selectedDomain?.name}
                    selectedChain={getFullChainName(chainName, isTestnet)}
                    onDeploySuccess={handleDeploySuccess}
                    addTransaction={addTransaction}
                  />
                </div>
              </div>
              {/* Registry Address */}
              <div className="bg-stone-150 flex text-stone-700 rounded-lg h-16 text-sm z-0 -mt-2 relative">
                <div className="flex pt-7 whitespace-nowrap pl-6 pr-2">
                  Registry Address:
                </div>
                <div className="flex-1 items-center mr-2 h-10 px-4 mt-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white text-stone-400 flex ">
                  {registryAddress ? registryAddress : "Waiting for Deploy..."}
                  {registryAddress && (
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(registryAddress)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                      }}
                      className="p-1 pl-2 hover:bg-stone-200 rounded-md transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-600" />
                      )}
                    </button>
                  )}
                  {registryAddress && (
                    <Image
                      src={"etherscan-logo.svg"}
                      alt="etherscan"
                      width={24}
                      height={24}
                      className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1"
                      onClick={() => {
                        window.open(
                          chainScanMap[
                            getFullChainName(
                              chainName,
                              isTestnet
                            ) as keyof typeof chainScanMap
                          ] +
                            "address/" +
                            registryAddress,
                          "_blank"
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Configure L1 Resolver */}
          <h2 className={`${gelasio.className} mb-3 mt-12 text-xl`}>
            2. Configure L1 Resolver
          </h2>
          <div className="flex flex-col md:flex-row gap-20">
            {/* L1 Resolver Box*/}
            <div className="bg-stone-150 z-10 w-full md:w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <ScrollText /> Key Contract:{" "}
                <span className="font-bold">L1 Resolver</span>
              </div>
              <div className="text-sm text-stone-700">
                The <span className="font-bold">L1 Resolver</span> functions as
                an entry point to provide information about a name. Users can
                query name resolution (bob.example.eth → 0x542) and associated
                text records. <br />
                <br />
                The provided resolver is made to work with Durin&apos;s
                contracts. As the owner of the ENS name, you are able to revert
                any of these changes.
              </div>
            </div>
            <div className="w-full">
              <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-end justify-between">
                      <div className="font-light">
                        {selectedDomain?.name
                          ? `Change Resolver for ${selectedDomain.name} on ${network}`
                          : "Change Resolver"}
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-stone-500">
                      Updating the resolver connects your ENS name to the
                      deployed L2 registry.
                      <div className="my-4">
                        <UpdateResolverButton
                          network={network}
                          selectedDomain={selectedDomain}
                          addTransaction={addTransaction}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-stone-150 flex text-stone-700 rounded-lg h-16 text-sm z-0 -mt-2 relative">
                <div className="flex pt-7 whitespace-nowrap pl-6 pr-2">
                  Resolver Address:
                </div>
                <div className="flex-1 items-center mr-2 h-10 px-4 mt-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white text-stone-400 flex justify-between">
                  <div className="truncate">
                    {RESOLVER_ADDRESSES[
                      network as keyof typeof RESOLVER_ADDRESSES
                    ]?.slice(0, 6)}
                    ...
                    {RESOLVER_ADDRESSES[
                      network as keyof typeof RESOLVER_ADDRESSES
                    ]?.slice(-4)}
                  </div>
                  <Image
                    src={"etherscan-logo.svg"}
                    alt="etherscan"
                    width={24}
                    height={24}
                    className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1 flex-shrink-0 ml-2"
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
              <div className="flex mt-4 flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-end justify-between">
                      <div className="font-light">Set L2 Registry</div>
                    </div>
                    <div className="text-sm mt-2 text-stone-500">
                      This button adds your L2 registry to the L1 resolver.
                      <div className="my-4">
                        <div className="my-4">
                          <SetRegistryButton
                            network={network}
                            domainInput={selectedDomain?.name}
                            registryAddress={recordInput as Address}
                            selectedChain={getFullChainName(
                              chainName,
                              isTestnet
                            )}
                            addTransaction={addTransaction}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="bg-stone-150 flex text-stone-700 rounded-lg h-16 text-sm z-0 -mt-2 relative">
                <div className="flex pt-7 whitespace-nowrap pl-6 pr-2">
                  Record Format:
                </div>
                <div className="flex-1 items-center mr-2 h-10 px-4 mt-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white text-stone-400 flex gap-2">
                  <div className="font-mono text-xs text-stone-500">
                    {"{chain_id}"}:{" {registry}"}
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          {/* Customize Registrar */}
          <h2 className={`${gelasio.className} mb-3 mt-12 text-xl`}>
            3. Customize Registrar
          </h2>
          <div className="flex flex-col md:flex-row gap-20">
            <div className="bg-stone-150 z-10 w-full md:w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <ScrollText /> Key Contract:{" "}
                <span className="font-bold">L2 Registrar</span>
              </div>
              <div className="text-sm text-stone-700">
                The registrar controls how names are minted. Users can only
                register a subdomain through the registrar by calling
                register(). The registrar is where minting logic—such as pricing
                models, renewal mechanisms, and expiration dates—should be
                implemented. We provide an example on GitHub.
              </div>
            </div>
            {/* Customize Registrar Box*/}
            <div className="w-full">
              <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-end justify-between">
                      <div className="font-light">
                        Customize and Deploy L2 Registrar
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-stone-500">
                      Select a template{" "}
                      <Link
                        href="https://github.com/namestonehq/durin/blob/main/src/examples/L2Registrar.sol"
                        target="_blank"
                        className="underline underline-offset-4"
                      >
                        L2 registrar
                      </Link>{" "}
                      and modify it as needed. You will need your registry
                      address.
                    </div>

                    <div className="my-4">
                      <button
                        onClick={() => {
                          window.open(
                            "https://github.com/namestonehq/durin?tab=readme-ov-file#3-customize-registrar-template",
                            "_blank"
                          );
                        }}
                        className="flex items-center gap-2 h-9 px-2 text-sm border rounded-lg shadow text- text-stone-900 hover:bg-stone-100"
                      >
                        <Image
                          alt="github"
                          src="/github.svg"
                          width={16}
                          height={16}
                        ></Image>
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-stone-150 flex text-stone-700 rounded-lg h-16 text-sm z-0 -mt-2 relative">
                <div className="flex pt-7 whitespace-nowrap pl-6 pr-2">
                  Registry Address:
                </div>
                <div className="flex-1 items-center mr-2 h-10 px-4 mt-4 py-1 overflow-hidden border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none bg-white text-stone-400 flex ">
                  {registryAddress ? registryAddress : "Waiting for Deploy..."}
                  {registryAddress && (
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(registryAddress)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                      }}
                      className="p-1 pl-2 hover:bg-stone-200 rounded-md transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-600" />
                      )}
                    </button>
                  )}
                  {registryAddress && (
                    <Image
                      src={"etherscan-logo.svg"}
                      alt="etherscan"
                      width={24}
                      height={24}
                      className="cursor-pointer hover:bg-stone-200 rounded-md transition-colors p-1"
                      onClick={() => {
                        window.open(
                          chainScanMap[
                            getFullChainName(
                              chainName,
                              isTestnet
                            ) as keyof typeof chainScanMap
                          ] +
                            "address/" +
                            registryAddress,
                          "_blank"
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Connect Registrar to Registry*/}
          <h2 className={`${gelasio.className} mb-3 mt-12 text-xl`}>
            4. Connect Registrar to Registry
          </h2>
          <div className="flex flex-col md:flex-row gap-20">
            <div className="bg-stone-150 z-10 w-full md:w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <ScrollText />
                <span className="font-bold">
                  L2 Registrar {"<>"} L2 Registry{" "}
                </span>
              </div>
              <div className="text-sm text-stone-700">
                This step grants permission to your registrar contract to mint
                subdomains through your registry. Calling addRegistrar() on the
                registry connects the two contracts together.
              </div>
            </div>
            {/* Configure Registrar Box*/}
            <div className="w-full">
              <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-end justify-between">
                      <div className="font-light">
                        Connect L2 Registrar to L2 Registry
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-stone-500">
                      As the final step, call <code>addRegistrar()</code> on
                      your registry with the address of your deployed registrar.{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className={`${gelasio.className} mb-3 mt-12 text-xl`}>
            5. Mint your first subdomain
          </h2>
          <div className="flex flex-col md:flex-row gap-20">
            <div className="bg-stone-150 z-10 w-full md:w-96 flex-shrink-0 flex flex-col gap-3 p-6 rounded-lg h-fit">
              <div className="flex items-center gap-2">
                <Sparkles />
                <span className="font-bold">Mint</span>
              </div>
              <div className="text-sm text-stone-700">
                Congrats on the launch! Create a subdomain via Etherscan.
              </div>
            </div>
            {/* Configure Registrar Box*/}
            <div className="w-full">
              <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200 relative z-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-end justify-between">
                      <div className="font-light">
                        Mint a subdomain via Etherscan
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-stone-500">
                      Search for your registrar address on the appropriate L2
                      Etherscan. <br />
                      <br />
                      Under Contract select register() and write.
                      <Image
                        src="/etherscan-screenshot.webp"
                        alt="etherscan"
                        width={400}
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                src="/x-logo.webp"
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
