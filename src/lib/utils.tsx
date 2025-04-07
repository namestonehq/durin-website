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
  Sepolia: "0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61" as Address,
  Mainnet: "0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61" as Address,
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
  "World Chain": 480,
  "World Chain Sepolia": 4801,
  Celo: 42220,
  "Celo Alfajores": 44787,
  Polygon: 137,
  "Polygon Amoy": 80002,
};
