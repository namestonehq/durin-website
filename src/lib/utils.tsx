import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEthereumAddress(address: string): string {
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}
//todo change mainnet address
export const RESOLVER_ADDRESSES = {
  Sepolia: "0x0bc45886470e9256DccD48e90d706630DB5228ED" as Address,
  Mainnet: "0x0bc45886470e9256DccD48e90d706630DB5228ED" as Address,
};

export const chainIdMap: { [key: string]: number } = {
  Sepolia: 11155111,
  Mainnet: 1,
  Base: 8453,
  "Base Sepolia": 84532,
  Optimism: 10,
  "Optimism Sepolia": 11155420,
  Arbitrum: 42161,
  "Arbitrum Sepolia": 421614,
  Scroll: 534352,
  "Scroll Sepolia": 534351,
  Linea: 59144,
  "Linea Sepolia": 59141,
};
