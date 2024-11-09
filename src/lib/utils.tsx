import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEthereumAddress(address: string): string {
  if (address.length < 10) {
    return address;
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}
