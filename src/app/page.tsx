"use client";
import { useState } from "react";
import Image from "next/image";
import { Gelasio } from "next/font/google";
import Link from "next/link";

const gelasio = Gelasio({
  weight: ["500", "400", "700"],
  subsets: ["latin"],
});

export default function Home() {
  const [network, setNetwork] = useState("Sepolia");
  const [chain, setChain] = useState("Base");
  return (
    <div className="flex flex-col h-screen font-sans text-stone-900">
      {/* Nav */}
      <div className="flex items-center justify-between h-16 px-10 mt-4">
        <Image alt="logo" src="durin-logo.svg" width={91} height={24}></Image>
        <button className="px-8 py-2 text-white transition-colors duration-300 rounded-lg bg-stone-900 w-fit hover:bg-stone-700 disabled:opacity-50">
          Connect
        </button>
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center flex-grow w-full max-w-md gap-6 mx-auto">
        <h1 className={`self-start ${gelasio.className}  text-3xl`}>
          Issue L2 Subnames
        </h1>
        {/* Connection Prompt */}
        <div className="flex items-center justify-between w-full px-4 py-3 space-x-3 rounded-lg bg-amber-100">
          {/* Icon for information */}
          <div>Connect wallet to get started.</div>
          <button className="px-4 py-1 text-white transition-colors duration-300 rounded-lg bg-stone-900 hover:bg-stone-700 disabled:opacity-50">
            Connect
          </button>
        </div>
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
          {/* ENS Search & Drop Down */}
          <DomainSelector />
          <div className="flex flex-col gap-1">
            <div className="font-light">Chain</div>
            <div className="text-sm text-stone-500 ">
              Pick a chain where the registry contract will live. The registry
              contract tracks ownership and stores text records.{" "}
            </div>
            {/* Toggle Chain */}
            <div className="flex justify-between p-1 mt-2 text-sm bg-gray-100 rounded">
              <button
                onClick={() => setChain("Base")}
                className={`px-4 rounded transition ${
                  chain === "Base" ? "bg-white shadow text-black" : "opacity-50"
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
                onClick={() => setChain("Optimism")}
                className={`px-4  rounded transition ${
                  chain === "Optimism"
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
                onClick={() => setChain("Arbitrum")}
                className={`px-4  rounded transition ${
                  chain === "Arbitrum"
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
                onClick={() => setChain("Scroll")}
                className={`px-4  rounded transition ${
                  chain === "Scroll"
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
                onClick={() => setChain("Linea")}
                className={`px-4  rounded transition ${
                  chain === "Linea"
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
                <button className="px-4 py-1 text-sm border rounded text- text-stone-900 hover:bg-stone-100">
                  Deploy
                </button>
              </div>
              <div className="text-sm text-stone-500">
                The registrar controls how a name can be minted. We provide a
                basic version of a registrar that you can modify.
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between">
                <div className="font-light ">Registrar</div>
                <button className="flex items-center gap-2 px-2 py-1 text-sm border rounded text- text-stone-900 hover:bg-stone-100">
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
                Deploy an instance of a registry via the Durin factory contract.
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
                <button className="px-2 py-1 text-sm border rounded text- text-stone-900 hover:bg-stone-100">
                  Update Resolver
                </button>
              </div>
              <div className="text-sm text-stone-500">
                Update the resolver to 0x5422 with one click.
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between">
                <div className="font-light">Add Record</div>
                <button className="px-2 py-1 text-sm border rounded text- text-stone-900 hover:bg-stone-100">
                  Add Record
                </button>
              </div>
              <div className="text-sm text-stone-500">
                Add the registry record with one click. If desired, customize
                the registry address.
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="mb-2 font-light text-stone-900">
                Customize Registry Address{" "}
                <span className="text-stone-400">(optional)</span>
                <input
                  type="text"
                  id="select-domain"
                  placeholder={true ? "0x1231232" : "Waiting to connect..."}
                  disabled={false} // Disable input when connecting
                  className={`w-full mt-2 h-8 p-4 border-stone-200 border focus:border-transparent  rounded-lg appearance-none  focus:ring-2 focus:ring-stone-500 focus:outline-none ${
                    true ? "bg-stone-100 text-stone-400 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
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

function DomainSelector() {
  const [domainInput, setDomainInput] = useState("");
  const [domainInputSelected, setDomainInputSelected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Dummy domain list for dropdown
  const dummyDomainList = [
    { name: "example.eth" },
    { name: "test.eth" },
    { name: "mydomain.eth" },
    { name: "yourdomain.eth" },
    { name: "anotherdomain.eth" },
  ];

  // Filtered domain list based on input
  const filteredDomainList = dummyDomainList.filter((domain) =>
    domain.name.includes(domainInput)
  );

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
                  isConnected ? "Waiting to connect..." : "slobo.eth"
                }
                onChange={(e) => setDomainInput(e.target.value)}
                value={domainInput}
                onFocus={() => setDomainInputSelected(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setDomainInputSelected(false);
                  }, 200);
                }}
                disabled={isConnected} // Disable input when connecting
                className={`w-full h-8 p-4 border-stone-200 border focus:border-transparent  rounded-lg appearance-none  focus:ring-2 focus:ring-stone-500 focus:outline-none ${
                  isConnected
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
                ></Image>
              </span>
            </div>
            {/* Dropdown with domain list */}
            {domainInputSelected && (
              <div className="z-10 w-full max-w-md overflow-x-hidden overflow-y-scroll bg-white border rounded-lg shadow-lg max-h-40">
                {filteredDomainList.map((domain, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setDomainInput(domain.name);
                      setDomainInputSelected(false);
                    }}
                    className="h-10 px-4 py-2 text-left border-b cursor-pointer border-stone-300 hover:bg-stone-100 overflow-ellipsis"
                  >
                    {domain.name}
                  </div>
                ))}
                {filteredDomainList.length === 0 && (
                  <div className="h-10 px-4 py-2 text-left border-b text-stone-400 border-stone-300">
                    No domains found
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
