'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import Image from 'next/image';

interface TokenMetadata {
  tokenId: string;
  name: string;
  description?: string;
  image: string;
}

const CONTRACT_ADDRESS = '0xdf9c6c6e0f193467d9edc2c130820e5b366219b5' as const;

// ERC-721 ABI for the methods we need
const ERC721_ABI = parseAbi([
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

export default function ManifoldCollection() {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        setLoading(true);
        setError(null);

        // Create a public client for reading from the blockchain
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        // Try to get total supply, if not available we'll try a range
        let maxTokens = 20;
        try {
          const totalSupply = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ERC721_ABI,
            functionName: 'totalSupply',
          });
          maxTokens = Number(totalSupply);
        } catch (err) {
          console.log('totalSupply not available, trying token range...');
        }

        // Fetch metadata for each token
        const tokenPromises: Promise<TokenMetadata | null>[] = [];

        for (let i = 1; i <= maxTokens; i++) {
          tokenPromises.push(
            fetchTokenMetadata(publicClient, i.toString())
          );
        }

        const results = await Promise.all(tokenPromises);
        const validTokens = results.filter((token): token is TokenMetadata => token !== null);

        setTokens(validTokens);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  async function fetchTokenMetadata(
    publicClient: any,
    tokenId: string
  ): Promise<TokenMetadata | null> {
    try {
      // First check if token exists by trying to get owner
      try {
        await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });
      } catch (err) {
        // Token doesn't exist
        return null;
      }

      // Get token URI
      const tokenURI = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      }) as string;

      // Fetch metadata from token URI
      const metadata = await fetchMetadataFromURI(tokenURI);

      if (metadata) {
        return {
          tokenId,
          name: metadata.name || `La Dolfina #${tokenId}`,
          description: metadata.description || 'Limited Edition',
          image: resolveIPFSUrl(metadata.image) || `/img/${tokenId.padStart(2, '0')}.jpg`,
        };
      }

      // Fallback to local images if metadata fetch fails
      return {
        tokenId,
        name: `La Dolfina #${tokenId}`,
        description: 'Limited Edition',
        image: `/img/${tokenId.padStart(2, '0')}.jpg`,
      };
    } catch (err) {
      console.error(`Error fetching token ${tokenId}:`, err);
      return null;
    }
  }

  async function fetchMetadataFromURI(uri: string): Promise<any | null> {
    try {
      // Handle IPFS URLs
      const url = resolveIPFSUrl(uri);

      // Handle data URIs
      if (uri.startsWith('data:application/json;base64,')) {
        const base64Data = uri.replace('data:application/json;base64,', '');
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString);
      }

      // Fetch from HTTP/HTTPS
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

  function resolveIPFSUrl(url: string): string {
    if (url.startsWith('ipfs://')) {
      // Use a public IPFS gateway
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return url;
  }

  if (loading) {
    return (
      <section id="collection" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-serif font-light text-gray-900 mb-4">
              The Collection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading auction tokens...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="collection" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-serif font-light text-gray-900 mb-4">
              The Collection
            </h2>
            <p className="text-lg text-red-600 max-w-2xl mx-auto">
              Error: {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="collection" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-gray-900 mb-4">
            The Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our exclusive NFT collection from Manifold auction
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)} (Sepolia)
          </p>
        </div>

        {/* Token Grid */}
        {tokens.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tokens.map((token) => (
              <div
                key={token.tokenId}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={token.image}
                  alt={token.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-lg">
                      {token.name}
                    </p>
                    {token.description && (
                      <p className="text-gray-200 text-sm">
                        {token.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No tokens found in this collection.</p>
          </div>
        )}
      </div>
    </section>
  );
}
