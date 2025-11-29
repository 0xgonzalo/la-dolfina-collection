'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import Image from 'next/image';

interface TokenMetadata {
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface AuctionData {
  startPrice?: string;
  currentBid?: string;
  endTime?: string;
  winner?: string;
  isActive: boolean;
}

const CONTRACT_ADDRESS = '0x7a16ab61fd1e708436fd4962057e21d57879d65d' as const;

const ERC721_ABI = parseAbi([
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params.id as string;

  const [token, setToken] = useState<TokenMetadata | null>(null);
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadataFromURI(uri: string): Promise<{
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
    } | null> {
      try {
        const url = resolveIPFSUrl(uri);

        if (uri.startsWith('data:application/json;base64,')) {
          const base64Data = uri.replace('data:application/json;base64,', '');
          const jsonString = atob(base64Data);
          return JSON.parse(jsonString);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.error('Error fetching metadata:', err);
        return null;
      }
    }

    async function fetchTokenData() {
      try {
        setLoading(true);
        setError(null);

        // Use custom RPC URL if provided, otherwise use public endpoint
        const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
        const publicClient = createPublicClient({
          chain: base,
          transport: http(rpcUrl),
        });

        // Fetch token URI
        const tokenURI = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ERC721_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        }) as string;

        // Fetch owner
        const tokenOwner = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        }) as string;

        setOwner(tokenOwner);

        // Fetch metadata
        const metadata = await fetchMetadataFromURI(tokenURI);

        if (metadata) {
          setToken({
            tokenId,
            name: metadata.name || `La Dolfina #${tokenId}`,
            description: metadata.description,
            image: resolveIPFSUrl(metadata.image || ''),
            attributes: metadata.attributes,
          });
        }

        // Mock auction data - in production, fetch from Manifold auction contract
        setAuction({
          isActive: false,
          startPrice: '0.1 ETH',
          currentBid: '0.5 ETH',
          endTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        });

      } catch (err) {
        console.error('Error fetching token data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token');
      } finally {
        setLoading(false);
      }
    }

    if (tokenId) {
      fetchTokenData();
    }
  }, [tokenId]);

  function resolveIPFSUrl(url: string): string {
    if (url?.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return url;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error || 'Token not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white">
            <Image
              src={token.image}
              alt={token.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            {/* Token Info */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif font-light text-gray-900 mb-4">
                {token.name}
              </h1>
              {token.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {token.description}
                </p>
              )}
            </div>

            {/* Contract Info */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Token Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token ID</span>
                  <span className="font-semibold text-gray-900">#{token.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract</span>
                  <a
                    href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network</span>
                  <span className="font-semibold text-gray-900">Base Mainnet</span>
                </div>
                {owner && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner</span>
                    <a
                      href={`https://basescan.org/address/${owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {owner.slice(0, 6)}...{owner.slice(-4)}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Auction Info */}
            {auction && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Auction Details
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      auction.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {auction.isActive ? 'Live' : 'Ended'}
                  </span>
                </div>
                <div className="space-y-3">
                  {auction.startPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Price</span>
                      <span className="font-semibold text-gray-900">{auction.startPrice}</span>
                    </div>
                  )}
                  {auction.currentBid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {auction.isActive ? 'Current Bid' : 'Winning Bid'}
                      </span>
                      <span className="font-semibold text-gray-900">{auction.currentBid}</span>
                    </div>
                  )}
                  {auction.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {auction.isActive ? 'Ends' : 'Ended'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(auction.endTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attributes */}
            {token.attributes && token.attributes.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Attributes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {token.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
                    >
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {attr.trait_type}
                      </div>
                      <div className="font-semibold text-gray-900">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <a
                href={`https://basescan.org/token/${CONTRACT_ADDRESS}?a=${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-gray-900 text-white text-center rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                View on Basescan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
