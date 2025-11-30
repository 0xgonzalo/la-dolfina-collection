import { parseAbi } from 'viem';

// Manifold Marketplace contract address on Base
export const MANIFOLD_MARKETPLACE_ADDRESS = '0x5246807fB65d87b0d0a234e0F3D42374DE83b421' as const;

// Manifold Marketplace ABI - Based on Manifold's actual marketplace contract
// Reference: https://docs.manifold.xyz/v/manifold-for-developers/smart-contracts/marketplace
export const MANIFOLD_MARKETPLACE_ABI = parseAbi([
  // Get listing details - returns struct components directly
  'function getListing(uint40 listingId) view returns (uint256 id, address seller, uint24 listingType, uint24 flags, uint8 totalAvailable, uint8 totalPerSale, uint48 startTime, uint48 endTime, uint48 extensionInterval, uint16 minIncrementBPS, uint256 erc20, uint256 identityVerifier)',

  // Get bid information - returns struct components directly
  'function getBid(uint40 listingId) view returns (uint256 amount, address bidder, uint48 timestamp, bool delivered)',

  // Get listing details
  'function getListingDetails(uint40 listingId) view returns (uint256 initialAmount, uint256 listingType, bool allowOffer, address paymentReceiver, bool fixedPriceListing)',

  // Get token details for a specific listing - this tells us which tokens are in this listing
  'function getListingTokenDetails(uint40 listingId, uint24 index) view returns (address, uint256, uint256)',

  // Get total listing count
  'function getTotalListings() view returns (uint40)',
]);

export interface ManifoldListing {
  id: bigint;
  seller: string;
  type: number;
  flags: number;
  totalAvailable: number;
  totalPerSale: number;
  startTime: bigint;
  endTime: bigint;
  extensionInterval: bigint;
  minIncrementBPS: number;
  erc20: bigint;
  identityVerifier: bigint;
}

export interface ManifoldBid {
  amount: bigint;
  bidder: string;
  timestamp: bigint;
  delivered: boolean;
}

export interface AuctionData {
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  currentBid?: string;
  minBidIncrement?: string;
  winner?: string;
  listingId?: string;
}
