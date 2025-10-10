'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

/**
 * Navbar component with Privy wallet connection
 * Displays a responsive navigation bar with:
 * - Project branding
 * - Connect/Disconnect wallet button
 * - User wallet address when connected
 */
export default function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Format wallet address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get wallet address from user object
  const walletAddress = user?.wallet?.address;

  return (
    <nav className="border-b border-[#001e37] bg-[#001e37] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-8">
            <Image
              src="/logo.avif"
              alt="La Dolfina"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#home"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="#collection"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Collection
              </a>
            </nav>
          </div>

          {/* Wallet Connection Button */}
          <div className="flex items-center gap-3">
            {authenticated && walletAddress && (
              <div className="hidden sm:block text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">
                {formatAddress(walletAddress)}
              </div>
            )}

            <button
              onClick={authenticated ? logout : login}
              disabled={!ready}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${!ready
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : authenticated
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white text-[#001e37] hover:bg-gray-100 shadow-sm hover:shadow-md'
                }
              `}
            >
              {!ready
                ? 'Loading...'
                : authenticated
                  ? 'Disconnect'
                  : 'Connect Wallet'
              }
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
