import type { Metadata } from "next";
import "./globals.css";
import { Gelasio } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";

const gelasio = Gelasio({
  weight: ["500", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Durin - ENS L2 Names Made Easy",
  description: "The developer's gateway to ENS L2 Subnames",
  metadataBase: new URL("https://durin.dev"),
  openGraph: {
    title: "Durin - ENS L2 Names Made Easy",
    description: "The developer's gateway to ENS L2 Subnames",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Durin - L2 Names Made Easy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Durin - L2 Names Made Easy",
    description: "The developer's gateway to ENS L2 Subnames",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={gelasio.className}>
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                icon: null,
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#fff",
                  background: "rgb(34 197 94)",
                },
              },
              error: {
                icon: null,
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#fff",
                  background: "rgb(220 38 38)",
                },
              },
              custom: {
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#000",
                  background: "#fff",
                },
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
