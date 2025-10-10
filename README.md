# NFT Minting Platform

A modern NFT minting application built with Next.js 14+, TypeScript, and Privy wallet integration. This platform enables users to connect their wallets and mint NFTs on the Base network using Rarible API.

## Features

- **Wallet Connection**: Secure wallet authentication using Privy
  - Embedded wallet support
  - External wallet compatibility
  - Seamless login/logout flow

- **Base Network Integration**: Built for Base L2 with:
  - Low gas fees
  - Fast transactions
  - wagmi v2+ and viem v2+ integration

- **Modern UI/UX**:
  - Responsive design (mobile-first)
  - Light theme with Tailwind CSS
  - Loading states and error handling
  - Clean, intuitive interface

- **SEO Optimized**: Comprehensive metadata for better discoverability

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Wallet Auth**: Privy (@privy-io/react-auth)
- **Web3**: wagmi v2+, viem v2+
- **State Management**: @tanstack/react-query
- **Future Integration**: @rarible/sdk for NFT minting

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Privy account and App ID ([Get one here](https://dashboard.privy.io/))
- Basic understanding of Web3 and NFTs

## Getting Started

### 1. Clone and Install

```bash
# Navigate to the project directory
cd nft-minting-app

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Add your Privy App ID:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

**Getting Your Privy App ID:**
1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select an existing one
3. Navigate to the "Settings" tab
4. Copy your App ID from the "Basics" section

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nft-minting-app/
├── app/
│   ├── components/
│   │   └── Navbar.tsx          # Navigation with wallet connection
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page with hero section
│   ├── providers.tsx            # Privy, Wagmi, and React Query setup
│   └── globals.css              # Global styles and theme
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── .env.local                   # Your local environment variables (gitignored)
├── tsconfig.json               # TypeScript configuration (strict mode)
└── package.json                # Dependencies and scripts
```

## Key Components

### Providers (`app/providers.tsx`)
Wraps the app with:
- **PrivyProvider**: Wallet authentication
- **WagmiProvider**: Web3 functionality
- **QueryClientProvider**: Async state management

### Navbar (`app/components/Navbar.tsx`)
- Wallet connection button
- Address display (formatted)
- Responsive design
- Login/logout functionality

### Landing Page (`app/page.tsx`)
- Hero section with CTAs
- Feature showcase
- Wallet connection status
- Responsive grid layout

## Configuration

### TypeScript
The project uses strict TypeScript configuration:
- All types are enforced
- No implicit `any`
- Strict null checks enabled

### Tailwind CSS
Custom theme with:
- Indigo/purple gradient accents
- Light theme optimized
- Custom scrollbar styling
- Responsive breakpoints

### Web3 Configuration
- **Network**: Base (Chain ID: 8453)
- **Transport**: HTTP (viem default)
- **Wallet**: Privy embedded + external wallets

## Error Handling

The app includes comprehensive error handling:
- Provider initialization checks (`ready` state)
- Disabled buttons during loading
- Authentication state management
- TypeScript type safety throughout

## Development Tips

1. **Hot Reload**: Changes to files auto-reload in development
2. **Type Checking**: Run `npm run build` to check for TypeScript errors
3. **Linting**: ESLint is configured for code quality

## Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms
Ensure to set the `NEXT_PUBLIC_PRIVY_APP_ID` environment variable in your deployment platform.

## Next Steps

To add NFT minting functionality:

1. **Install Rarible SDK**:
   ```bash
   npm install @rarible/sdk
   ```

2. **Create Minting Component**: Build a form for NFT metadata
3. **Integrate Rarible API**: Connect SDK in your minting flow
4. **Add IPFS Storage**: For NFT metadata and images

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Privy Documentation](https://docs.privy.io)
- [wagmi Documentation](https://wagmi.sh)
- [Rarible Protocol](https://rarible.org)
- [Base Network](https://base.org)

## Troubleshooting

**Issue**: "Privy is not ready"
- **Solution**: Ensure `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly

**Issue**: Wallet won't connect
- **Solution**: Check that your Privy app is configured for the correct domain

**Issue**: TypeScript errors
- **Solution**: Run `npm run build` to see detailed error messages

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
