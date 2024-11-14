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

export const RESOLVER_ADDRESSES = {
  Sepolia: "0x00f9314C69c3e7C37b3C7aD36EF9FB40d94eDDe1" as Address,
  Mainnet: "0x2A6C785b002Ad859a3BAED69211167C7e998aAeC" as Address,
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
