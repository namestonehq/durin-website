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
