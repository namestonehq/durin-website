"use client";
import Image from "next/image";
import { Gelasio } from "next/font/google";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, use } from "react";
import { useAccount } from "wagmi";
import DeployButton from "./components/deploy-button";
import { type Address } from "viem";
import UpdateResolverButton from "./components/update-resolver-button";
import AddRecordButton from "./components/add-record-button";
import { Domain } from "../lib/types";
import { Copy, Check, ExternalLink } from "lucide-react";
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
  Sepolia: "https://sepolia.etherscan.io/tx/",
  Mainnet: "https://etherscan.io/tx/",
  Base: "https://basescan.org/tx/",
  "Base Sepolia": "https://sepolia.basescan.org/tx/",
  Optimism: "https://optimistic.etherscan.io/tx/",
  "Optimism Sepolia": "https://sepolia-optimism.etherscan.io/tx/",
  Arbitrum: "https://arbiscan.io/tx/",
  "Arbitrum Sepolia": "https://sepolia.arbiscan.io/tx/",
  Scroll: "https://scrollscan.io/tx/",
  "Scroll Sepolia": "https://sepolia-blockscout.scroll.io/tx/",
  Linea: "https://linea.scan.io/tx/",
  "Linea Sepolia": "https://sepolia.lineascan.build/tx/",
};

export default function Home() {
  const [network, setNetwork] = useState("Sepolia");
  const [chain, setChain] = useState("Base");
  const [chainName, setChainName] = useState("Base");
  const [chainModifier, setChainModifier] = useState("");

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
      <Image
        src="/anviltools.png"
        alt="anvil"
        width={120}
        height={120}
        className="absolute opacity-0 hover:cursor-pointer hover:opacity-80 duration-10000 right-14  top-32"
      ></Image>
      {/* Nav */}
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
      <main className="flex flex-col items-center flex-grow w-full max-w-md gap-6 mx-auto">
        <h1 className={`self-start ${gelasio.className}  text-3xl px-4`}>
          Issue L2 Subnames
        </h1>

        {/* Name & Chain Box*/}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          <div className={`${gelasio.className} text-xl`}>
            Choose Name & Chain
          </div>

          <hr className=" bg-stone-100"></hr>
          <div className="flex items-end justify-between">
            <div className="font-light">ENS Name</div>

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
          <div className="text-sm text-stone-500 ">
            Choose between Sepolia & Mainnet ENS name resolution.
          </div>
          {/* ENS Search & Drop Down */}
          <DomainSelector
            network={network}
            setSelectedDomain={setSelectedDomain}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <div className="font-light">Chain</div>
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
                  onClick={() => setChainModifier("")}
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
            <div className="text-sm text-stone-500 ">
              Pick a chain where the registry contract will live. The registry
              contract tracks ownership and stores text records.{" "}
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
                onClick={() => setChainName("Optimism")}
                className={`px-4  rounded transition ${
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
                className={`px-4  rounded transition ${
                  chainName === "Arbitrum"
                    ? "bg-white shadow text-stone-900"
                    : "opacity-50"
                }`}
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
                onClick={() => setChainName("Linea")}
                className={`px-4  rounded transition ${
                  chainName === "Linea"
                    ? "bg-white shadow text-stone-900"
                    : "opacity-50"
                }`}
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
          </div>
        </div>
        {/* Configure & Deploy Box*/}
        <div className="flex flex-col w-full gap-3 px-6 py-4 bg-white border rounded-lg border-stone-200">
          {" "}
          <div className={`${gelasio.className} text-xl`}>
            Configure & Deploy Contracts
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
                Deploy an instance of a registry via the Durin factory contract.
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <div className="font-light ">Registrar</div>
              <button
                onClick={() => {
                  window.open(
                    "https://github.com/resolverworks/durin",
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
              The registrar controls how a name can be minted. We provide a
              basic version of a registrar that you can modify. You will need to
              know your registry address.
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
                      toast("Waiting for deploy...");
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
          {" "}
          <div className={`${gelasio.className} text-xl`}>
            Update Name Records
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
                    width={16}
                    height={16}
                    className="cursor-pointer"
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
                <div className="font-light">Add Record</div>
                <AddRecordButton
                  network={network}
                  domainInput={selectedDomain?.name}
                  registryAddress={recordInput as Address}
                  selectedChain={chain}
                  addTransaction={addTransaction}
                />
              </div>
              <div className="text-sm text-stone-500">
                Add the registry record with one click. If desired, customize
                the registry address.
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
                  className="flex-1 px-3 py-2 bg-stone-100 text-stone-500 text-xs"
                  value={recordInput}
                  onChange={(e) => setRecordInput(e.target.value)}
                  placeholder="Waiting for registry deploy..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-sans text-stone-500">Record format:</div>
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
        {/* Tx history */}
        <div className="items-start w-full flex-col gap-2">
          <div className={`${gelasio.className} text-xl  py-4 `}>
            Transaction History
          </div>

          <div className="flex flex-col w-full gap-3 px-6 py-3 bg-white border rounded-lg border-stone-200">
            {txHistory.length === 0 ? (
              <div className="text-sm text-stone-500">No transactions yet</div>
            ) : (
              txHistory.map((tx, index) => {
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
                              }${tx.hash}`,
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
                href="https://namestone.xyz"
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
      //set selectedDomain to undefined
      setSelectedDomain(undefined);
      setDomainInput("");
      if (!isConnected || !address) {
        setUserDomains([]);
        return;
      }

      try {
        setIsLoading(true);
        // Use URL constructor to properly format the URL with query parameters
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        const url = new URL(`${baseUrl}/api/get-domains`);
        url.searchParams.append("address", address);
        url.searchParams.append("network", network);

        const response = await fetch(url.toString());
        const data: Domain[] = await response.json();

        if (response.status === 200) {
          // Filter out null values and format the domains
          const formattedDomains: Domain[] = data.filter(
            (name) => name !== null
          );
          setUserDomains(formattedDomains);
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
  }, [address, isConnected, network]);

  // Filter domains based on input
  const filteredDomainList = userDomains.filter((domain) => {
    return domain.name.toLowerCase().includes(domainInput.toLowerCase());
  });

  // useEffect if filteredDomainList.length === 1, set selectedDomain to that domain
  useEffect(() => {
    if (filteredDomainList.length === 1) {
      setSelectedDomain(filteredDomainList[0]);
      setDomainInput(filteredDomainList[0].name);
    }
  }, [filteredDomainList]);

  return (
    <div className="z-20 flex">
      <div className="flex flex-col items-start w-full max-w-md">
        <div className="relative w-full h-12">
          <div className="absolute flex-col w-full h-12">
            <div className="relative flex flex-1">
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
                  setTimeout(() => {
                    setDomainInputSelected(false);
                  }, 200);
                }}
                disabled={!isConnected || isLoading}
                className={`w-full h-8 p-4 border-stone-200 border focus:border-transparent rounded-lg appearance-none focus:ring-2 focus:ring-stone-500 focus:outline-none ${
                  !isConnected || isLoading
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : ""
                }`}
              />
              <span className="absolute transform -translate-y-1/2 right-3 top-1/2">
                <Image
                  alt="chevron"
                  src="/chevron-down.svg"
                  width={16}
                  height={16}
                />
              </span>
            </div>
            {/* Dropdown with domain list */}
            {isConnected && domainInputSelected && (
              <div className="z-10 w-full max-w-md overflow-x-hidden overflow-y-scroll bg-white border rounded-lg shadow-lg max-h-40">
                {isLoading ? (
                  <div className="h-10 px-4 py-2 text-left text-stone-400">
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
                      className="h-10 px-4 py-2 text-left border-b cursor-pointer border-stone-300 hover:bg-stone-100 overflow-ellipsis"
                    >
                      {domain.name}
                    </div>
                  ))
                ) : (
                  <div className="h-10 px-4 py-2 text-left border-b text-stone-400 border-stone-300">
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
      </div>
    </div>
  );
}
