'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { base } from 'viem/chains';
import { createConfig } from 'wagmi';

// Get RPC URL from environment variable or use public endpoint
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;

// Create wagmi config with Base Mainnet
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(rpcUrl),
  },
});

// Create QueryClient for React Query
const queryClient = new QueryClient();

/**
 * Providers component that wraps the app with Privy and Web3 providers
 * - PrivyProvider: Handles wallet authentication and embedded wallets
 * - WagmiProvider: Provides Web3 functionality for interacting with blockchain
 * - QueryClientProvider: Manages async state for React Query
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Get Privy App ID from environment variables
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no Privy App ID is provided, show error message
  if (!privyAppId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h2>
          <p className="text-gray-700 mb-4">
            Please set your <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> in your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <p className="text-gray-600 text-sm">
            Get your App ID from: <a href="https://dashboard.privy.io/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privy Dashboard</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Appearance customization for light theme
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          logo: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
        },
        // Configure embedded wallets
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
