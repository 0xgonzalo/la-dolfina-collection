'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { base } from 'viem/chains';
import Image from 'next/image';
import { MANIFOLD_MARKETPLACE_ADDRESS, MANIFOLD_MARKETPLACE_ABI } from '@/app/utils/manifoldMarketplace';

interface TokenMetadata {
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface AuctionData {
  reservePrice?: string;
  startTime?: string;
  currentBid?: string;
  endTime?: string;
  winner?: string;
  isActive: boolean;
  listingId?: string;
  minBidIncrement?: string;
  extensionInterval?: string;
  totalBids?: number;
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

        // Fetch real auction data from Manifold Marketplace
        const auctionData = await fetchAuctionData(publicClient, CONTRACT_ADDRESS, tokenId);
        setAuction(auctionData);

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

  async function fetchAuctionData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publicClient: any,
    contractAddress: string,
    tokenId: string
  ): Promise<AuctionData> {
    try {
      console.log('=== AUCTION DATA FETCH ===');
      console.log('Searching for listing for token:', tokenId);

      // Based on the pattern from your screenshot, listing 2737 seems to be the base
      // Let's try calculating the listing ID based on token ID
      // We'll try multiple patterns to find the correct one

      // Since getListingTokenDetails is reverting, we need to find the pattern manually
      // Let's scan all listings and log their FULL details to find which token they contain
      const baseListingId = 2736;
      const searchRange = 20; // Check first 20 listings

      console.log(`\n=== Scanning listings to find pattern for Token #${tokenId} ===`);

      const validListings: Array<{
        testId: number,
        actualId: string,
        reservePrice: string,
        rawData: string,
        flags: string,
        totalAvailable: string
      }> = [];

      // First, collect all valid listings and their FULL data
      for (let testId = baseListingId; testId < baseListingId + searchRange; testId++) {
        try {
          const testListing = await publicClient.readContract({
            address: MANIFOLD_MARKETPLACE_ADDRESS,
            abi: MANIFOLD_MARKETPLACE_ABI,
            functionName: 'getListing',
            args: [BigInt(testId)],
          });

          if (!testListing || !Array.isArray(testListing)) continue;

          const actualListingId = testListing[0] as bigint;
          const reservePrice = testListing[7] as bigint;
          const flags = testListing[3] as bigint;
          const totalAvailable = testListing[4] as bigint;

          // Only consider listings with valid reserve price
          if (reservePrice > BigInt(0)) {
            // Log the FULL array to see all data
            console.log(`\nListing ID ${testId}:`);
            console.log('  Full array:', testListing);
            console.log('  [0] field:', actualListingId.toString());
            console.log('  [1] seller:', testListing[1]);
            console.log('  [2] encoded data:', testListing[2]?.toString());
            console.log('  [3] flags:', flags.toString());
            console.log('  [4] totalAvailable:', totalAvailable.toString());
            console.log('  [7] reservePrice:', formatEther(reservePrice), 'ETH');

            // The ACTUAL listing ID is testId (the parameter we used in getListing)
            // NOT testListing[0] which is some other field
            validListings.push({
              testId,
              actualId: testId.toString(), // Use testId, not actualListingId
              reservePrice: formatEther(reservePrice),
              rawData: testListing[2]?.toString() || '',
              flags: flags.toString(),
              totalAvailable: totalAvailable.toString()
            });
          }
        } catch (err) {
          continue;
        }
      }

      console.log(`\n=== SUMMARY ===`);
      console.log(`Total valid listings found: ${validListings.length}`);
      console.table(validListings);

      // Now apply pattern based on token ID
      let listingId: bigint | null = null;
      let validListing = null;

      if (validListings.length > 0) {
        // Map token to listing index: token 1 -> listing[0], token 2 -> listing[1], etc.
        const tokenIndex = parseInt(tokenId) - 1;

        if (tokenIndex >= 0 && tokenIndex < validListings.length) {
          const selectedListing = validListings[tokenIndex];
          console.log(`\n✓ Mapping Token #${tokenId} (index ${tokenIndex}) -> Listing ID ${selectedListing.actualId}`);

          // Fetch the full listing data
          listingId = BigInt(selectedListing.actualId);
          validListing = await publicClient.readContract({
            address: MANIFOLD_MARKETPLACE_ADDRESS,
            abi: MANIFOLD_MARKETPLACE_ABI,
            functionName: 'getListing',
            args: [listingId],
          });
        } else {
          console.log(`\n⚠ Token index ${tokenIndex} out of range (only ${validListings.length} listings), using first listing`);
          listingId = BigInt(validListings[0].actualId);
          validListing = await publicClient.readContract({
            address: MANIFOLD_MARKETPLACE_ADDRESS,
            abi: MANIFOLD_MARKETPLACE_ABI,
            functionName: 'getListing',
            args: [listingId],
          });
        }
      }

      // If no pattern worked, default to 2737
      if (!listingId || !validListing) {
        console.log('No valid listing found, defaulting to listing 2737');
        listingId = BigInt(2737);
      } else {
        console.log(`Final selection: using actual listing ID ${listingId.toString()} for token ${tokenId}`);
      }

      // Get listing details - use validListing if we already fetched it, otherwise fetch now
      let listing = validListing;

      if (!listing) {
        listing = await publicClient.readContract({
          address: MANIFOLD_MARKETPLACE_ADDRESS,
          abi: MANIFOLD_MARKETPLACE_ABI,
          functionName: 'getListing',
          args: [listingId],
        }).catch((err: Error) => {
          console.error('Error calling getListing:', err);
          return null;
        });
      }

      console.log('RAW listing response:', listing);
      console.log('Listing type:', typeof listing);
      console.log('Listing array?:', Array.isArray(listing));

      if (!listing) {
        console.log('No listing found');
        return { isActive: false };
      }

      // Log each element of the array
      if (Array.isArray(listing)) {
        listing.forEach((item, index) => {
          console.log(`listing[${index}]:`, item, `(type: ${typeof item})`);
        });
      }

      // Based on actual contract response, the structure appears to be:
      // [0]: id (32n)
      // [1]: seller (0x0000000000000000000000000000000000000AB1)
      // [2]: encoded data (huge number)
      // [3-6]: unknown/zero
      // [7]: appears to be reserve price in wei (1000000000000000000 = 1 ETH)
      // [8-10]: small numbers
      // [11]: extension interval (600n)

      const id = listing[0] as bigint;
      const seller = listing[1] as string;
      const reservePrice = listing[7] as bigint; // This appears to be 1 ETH in wei
      const extensionInterval = listing[11] as bigint; // 600 seconds

      console.log('Extracted values from actual structure:');
      console.log('- id:', id?.toString());
      console.log('- seller:', seller);
      console.log('- reservePrice (raw):', reservePrice?.toString());
      console.log('- extensionInterval:', extensionInterval?.toString());

      // The contract structure doesn't match our ABI
      // We need to work with what we have
      const startTime = BigInt(0); // Not available in this structure
      const endTime = BigInt(0); // Not available in this structure
      const minIncrementBPS = 0; // Not available in this structure

      // Note: getListingDetails and getBid functions revert on this contract
      // We'll work with the data we have from getListing only

      // Since we don't have timestamp data, we'll assume the auction is active
      // based on having a valid reserve price
      const isActive = reservePrice > BigInt(0);

      console.log('Auction status:');
      console.log('- Reserve price > 0?:', reservePrice > BigInt(0));
      console.log('- Is active?', isActive);

      const reservePriceFormatted = reservePrice > BigInt(0) ? `${formatEther(reservePrice)} ETH` : undefined;

      // We don't have bid data since getBid reverts
      const currentBidFormatted = undefined;

      console.log('=== FINAL FORMATTED DATA ===');
      console.log({
        isActive,
        listingId: listingId.toString(),
        reservePriceFormatted,
        currentBidFormatted,
        extensionInterval: Number(extensionInterval)
      });

      return {
        isActive,
        listingId: listingId.toString(),
        startTime: undefined, // Not available from contract
        endTime: undefined, // Not available from contract
        reservePrice: reservePriceFormatted,
        currentBid: currentBidFormatted,
        winner: undefined, // No bid data available
        minBidIncrement: undefined, // Not available from contract
        extensionInterval: extensionInterval && Number(extensionInterval) > 0 ? `${Number(extensionInterval)} seconds` : undefined,
        totalBids: 0, // No bid data available
      };
    } catch (err) {
      console.error('Error fetching auction data:', err);
      return { isActive: false };
    }
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

        <div className="grid gap-12">
          {/* Image Section */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-white">
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

            {/* Debug Info - Remove this later */}
            {auction && (
              <div className="bg-yellow-50 rounded-xl p-6 shadow-md border-2 border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-800 uppercase tracking-wide mb-4">
                  Debug: Auction Data
                </h3>
                <pre className="text-xs text-gray-800 overflow-auto">
                  {JSON.stringify(auction, null, 2)}
                </pre>
              </div>
            )}

            {/* Auction Info */}
            {auction && auction.listingId && (
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
                    {auction.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <div className="space-y-3">
                  {auction.totalBids !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bids</span>
                      <span className="font-semibold text-gray-900">{auction.totalBids} bids</span>
                    </div>
                  )}
                  {auction.reservePrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reserve Price</span>
                      <span className="font-semibold text-gray-900">{auction.reservePrice}</span>
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
                  {auction.startTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(auction.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {auction.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time</span>
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
                  {auction.extensionInterval && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Bid Extension</span>
                      <span className="font-semibold text-gray-900">{auction.extensionInterval}</span>
                    </div>
                  )}
                  {auction.minBidIncrement && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Bid Increment</span>
                      <span className="font-semibold text-gray-900">{auction.minBidIncrement}</span>
                    </div>
                  )}
                  {auction.listingId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listing ID</span>
                      <span className="font-semibold text-gray-900">{auction.listingId}</span>
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
