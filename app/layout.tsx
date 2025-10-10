import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO metadata configuration
export const metadata: Metadata = {
  title: "La Dolfina Official Collection",
  description: "Mint your NFTs seamlessly on Base network using Rarible API. Connect your wallet and start creating digital assets.",
  keywords: ["NFT", "minting", "Rarible", "Base", "Web3", "blockchain", "digital assets"],
  authors: [{ name: "La Dolfina Official Collection" }],
  openGraph: {
    title: "NFT Minting Platform",
    description: "Mint your NFTs seamlessly on Base network using Rarible API",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFT Minting Platform",
    description: "Mint your NFTs seamlessly on Base network",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
