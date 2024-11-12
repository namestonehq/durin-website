import type { Metadata } from "next";
import "./globals.css";
import { Gelasio } from "next/font/google";
import Providers from "./providers";

const gelasio = Gelasio({
  weight: ["500", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Durin - L2 Names Made Easy",
  description: "The developer's gateway to ENS L2 Subnames",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={gelasio.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
