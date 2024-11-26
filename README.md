# URDEX Aggregator

URDEX is a sophisticated, extensible decentralized exchange (DEX) aggregator built on Sepolia testnet that serves both as a production-ready platform and a robust foundation for further development. By comparing prices and liquidity between multiple automated market makers (AMMs) with varying fee structures (0.3% and 0.5%), URDEX automatically routes trades through the most efficient path to ensure optimal exchange rates. The modular architecture and well-documented codebase make it an ideal starting point for developers looking to build their own DeFi applications or extend the platform's capabilities. 

Currently featuring real-time price tracking, intuitive swap interfaces, and comprehensive transaction monitoring, URDEX's design patterns and security measures (including reentrancy protection and slippage controls) provide a solid template for building advanced DEX functionality. Whether you're a user seeking the best swap rates, a developer building on top of the platform, or a project looking to fork and customize the codebase, URDEX offers a battle-tested foundation for decentralized trading infrastructure.

## Quick Start

***Note: Sepolia ETH is needed in order to use the Token Faucet and Quick Start***
Link: https://faucets.chain.link/sepolia

For those wanting to try out URDEX, experience swaps, learn about Dex Aggregator functionality, or perhaps are connecting your first Web3 wallet, it's super easy using the link below. Once there you'll see a token faucet link with easy instructions on how to import and receive tokens TK1 and TK2. 

**Go to URDEX**: [https://dex-aggregator-theta.vercel.app/swap](https://dex-aggregator-theta.vercel.app/swap)

## Table of Contents

1. [Config/Security](#1-configsecurity)
2. [Installation](#2-installation)
3. [Prerequisites](#3-prerequisites)
4. [Usage](#4-usage)
5. [Optional Deployments](#5-optional-deployments)
6. [Optional Frontend Components](#6-optional-frontend-components)
7. [URDEX Architecture at a Glance](#7-architecture-at-a-glance)
8. [Contracts](#8-contracts)
9. [Features](#9-features)
10. [Running Tests](#10-running-tests)
11. [Testing Description](#11-testing)
12. [Contract Interaction](#12-contract-interaction)
13. [Contribute to URDEX](#13-contributing)
14. [License Info](#14-license)

## 1. Config/Security

URDEX uses Hardhat for development and deployment. Configuration is found in `/hardhat.config.js`, which supports the following:
- A local development network
- Sepolia testnet deployment 
- Solidity version 0.8.19
- Custom artifact path for frontend integration

## 2. Installation

### Important Notes Before Starting
- When running the terminal commands, do not include any backticks `` or the containing brackets < >
- Due to different development environments and operating systems, you may need to research some steps for your particular setup. The point is to achieve the goal outlined
### Step-by-Step Installation

1. Open your terminal

2. Clone the repository
```bash
git clone https://github.com/memery1446/DexAggregator <name-of-your-choice>
```
3. cd, or C-hange D-irectory into your project root
```bash
cd <your-chosen-name>
```
The terminal should look something like: you@Your-MacBook-Pro <name-you-chose> %
    Notice that the project name comes before the % sign. The solution to many errors is to realize that commands are being sent from the main or master branch. 

4. (Optional) Remove git origin to keep your repository clean
```bash
git remote remove origin
```

5. Install dependencies
```bash
npm install
```
6. Open the project in your text editor

7. Create `.env` file in the root directory with the following content:
```
ALCHEMY_SEPOLIA_URL=your_alchemy_url
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 3. Prerequisites

### Node.js Installation
1. Check your Node.js version (should be 14+):
```bash
node -v
```
2. If needed, download or update Node.js from [nodejs.org](https://nodejs.org/en/download/package-manager)

### Hardhat Setup
1. Install Hardhat:
```bash
npm install --save-dev hardhat
```

### Sepolia Deployment Setup
1. Obtain Sepolia testnet URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)
2. Connect a Web3 wallet like [MetaMask](https://metamask.io)

3. Create a new account or use an existing, but choose which Ethereum account you want as your deployer. Copy the private key and enter in into the .env file and save. 

4. Start local Hardhat node:
```bash
npx hardhat node
```
5. Find account -0- on the terminal and copy the private key. In zero based accounting this is account -1-. 

6. Add the account to your Web3 wallet by selecting "import tokens" and pasting the private key. 

7. Get an [Etherscan API key](https://etherscan.io/) for contract verification. Enter the API key into the .env file. This completes the .env file. 

### Security Features
The APP is now deployment-ready. While more explanation comes later, it's a great time to review the security features that can give the developer or user peace of mind:

- Reentrancy protection on all critical functions
- Slippage protection mechanisms
- Price manipulation resistance
- Flash loan attack prevention
- Sandwich attack protection
- Maximum trade size limits
- Reserve ratio maintenance
- Decimal precision handling
- Extensive front end testing

## 4. Usage

### Local Development Deployment

1. Ensure your Web3 wallet is on Hardhat Network
2. Deploy contracts locally:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
3. Update deployment addresses in:
   - scripts/addliquidity.js
   - scripts/check-balances.js
   - scripts/setup-check.js
   - scripts/verify-deployment.js

4. Import TK1 and TK2 tokens into your Web3 wallet

5. Add liquidity:
```bash
npx hardhat run scripts/add-liquidity.js --network localhost
```

### Deploy Frontend
```bash
npm run start
```
Access in a web browser at `localhost:3000`

## 5. Optional Deployments

These deployments can provide valuable information during development but are not necessary for DEX operation.

### Helper Scripts
Update contract addresses in the scripts, then run:
```bash
# Check balances
npx hardhat run scripts/check-balance.js --network <hardhat or sepolia>

# Verify setup
npx hardhat run scripts/setup-check.js --network <hardhat or sepolia>

# Verify deployment
npx hardhat run scripts/verify-deployment.js --network <hardhat or sepolia>
```

### Sepolia Testnet Deployment

1. Initial Setup
   - Connect your wallet to Sepolia Network
   - Update `.env` with your Ethereum wallet private key (not a Hardhat account)
   - Get Sepolia ETH from [Chainlink Faucet](https://faucets.chain.link/sepolia)

2. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Update Deployment Addresses
   Update addresses in:
   - scripts/addliquidity.js
   - scripts/check-balances.js
   - scripts/setup-check.js
   - scripts/verify-deployment.js

4. Deploy Frontend
   Use [Vercel](https://vercel.com/) or similar provider (free tier is sufficient)

## 6. Optional Frontend Components

The frontend includes specialized test utilities for debugging, verification, and expansion. To use these components, import them to `App.js` and add them to the return statement, similar to how `PriceChart.js` is implemented.

### Available Components

#### AccountVerify (`AccountVerify.js`)
- Validates wallet connection status
- Tests account switching functionality
- Verifies account permissions and balances
- Checks token allowances

#### Connection Testing (`ConnectionTest.js`)
- Tests Web3 provider connectivity
- Validates network connection stability
- Checks RPC endpoint responsiveness
- Connection error handling verification

#### Contract Debugging (`ContractDebug.js`)
- Smart contract interaction testing
- Event listener verification
- Transaction receipt validation
- Gas estimation accuracy checks

#### Network Testing (`NetworkTest.js`)
- Network switching functionality
- Chain ID verification
- Network latency testing
- Failed network handling

#### State Monitoring (`StateMonitor.js`)
- Redux state management testing
- State update verification
- Action dispatch testing
- State persistence checks

#### Wallet Debugging (`WalletDebug.js`)
- Wallet connection edge cases
- Transaction signing tests
- Message signing verification
- Wallet error handling

### Token Faucet Note
The Token Faucet can be removed from URDEX by removing the button and link. It is a separate application that can be cloned from [Token Faucet Repository](https://github.com/memery1446/TokenFaucet).

**Important**: Your deployed TK1 and TK2 addresses will not match the existing Token Faucet addresses. You'll need to deploy your own Token Faucet with your specific token addresses.

## 7. Architecture at a Glance

### Route Aggregation Pattern
URDEX implements a sophisticated routing system where:
- Main contract queries prices from connected AMMs
- Compares output amounts for the same input
- Routes trades through the most efficient path
- Maintains price history for analysis

### AMM Implementations
1. **AMM1**
   - 0.3% fee structure
   - Standard constant product formula
   - Reentrancy protection
   - Minimum liquidity requirements

2. **AMM2**
   - 0.5% fee structure
   - Standard constant product formula
   - Reentrancy protection
   - Minimum liquidity requirements

### Performance Optimizations
- Gas optimization for different trade sizes
- Efficient handling of concurrent operations
- Balanced reserve management
- Price stability maintenance
- Scaling considerations for high-volume periods

### Event System
```solidity
event BestQuoteFound(address amm, uint256 outputAmount);
event SwapExecuted(address amm, uint256 amountIn, uint256 amountOut);
event PriceUpdated(address amm, uint256 price, uint256 timestamp);
```

## 8. Contracts

### Core Smart Contracts
- **DexAggregator.sol**: Main aggregator contract that routes trades
- **AMM.sol**: First AMM implementation with 0.3% fee
- **AMM2.sol**: Second AMM implementation with 0.5% fee and 200% reserve trade limit
- **Token.sol**: ERC20 token implementation with minting capabilities
- **Attacker.sol**: Test contract for security measures and attack vectors

## 9. Features

### Core Functionality
- Price comparison across AMM and AMM2 protocols
- Efficient trade execution using try-catch blocks
- Separate price history tracking for each AMM
- Support for forward and reverse token swaps

### Security Features
- Adjustable slippage protection
- Protection against sandwich attacks
- Price impact protection through reserve management
- Price scaling protection

### Performance
- Gas-efficient operations through:
  - Quote caching
  - Batched operations
  - Concurrent processing
  - Size-independent efficiency
  - Hard cap implementation

### User Interface
- Real-time price charts with multiple time settings
- Transaction history showing:
  - Transaction type
  - Token amounts and symbols
  - Shortened transaction hashes
  - Human-readable timestamps ("5m ago", "2h ago")
- Responsive UI with dark mode support

### Frontend Components
1. **Core Components**
   - `Navigation.js`: Header with wallet connection
   - `SwapCard.js`: Main trading interface
   - `PriceChart.js`: Price visualization component
   - `RecentTransactions.js`: Transaction history display
   - `Loading.js`: Loading state component
   - `Footer.js`: Application footer

2. **Technical Features**
   - Real-time price charts using Recharts
   - Transaction history tracking
   - Responsive design
   - Wallet connection integration
   - Gradient background with glass-morphism UI
   - Redux-based loading states and error handling

## 10. Running Tests

### Basic Test Execution
```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/<test-name>.js
```

## 11. Testing

### Test Categories
1. **Backend Tests**
   - DexSystem
   - DexAggregator
   - Token
   - AMM
   - AMM2
   - Attacker

2. **Frontend Tests**
   - AccountVerify
   - ConnectionTest
   - ContractDebug
   - NetworkTest
   - StateMonitor
   - WalletDebug

### Core Test Structure
- Multiple test suites working in harmony
- Uses Hardhat's loadFixture pattern
- Ensures test isolation and consistent starting conditions

### Specific Test Areas

#### AMM Contract Tests
- **Deployment Tests**
  - Token address verification
  - Initial reserve validation
  
- **Liquidity Tests**
  - Token transfer tracking
  - LP token minting verification
  - Balance verification

- **Price Calculation Tests**
  - Fee inclusion verification (0.3%)
  - Trade size impact analysis

#### AMM2 Contract Tests
- Different fee structure (0.5%) testing
- Reserve limit verification
- Price competition analysis

#### Attacker Contract Tests
- Deployment security verification
- Attack attempt limitations
- Recursive call monitoring

#### DEX Aggregator Integration Tests
1. **Cross-Contract Liquidity**
   - Reserve consistency verification
   - Simultaneous liquidity change handling

2. **Price Impact and Routing**
   - Large trade optimization
   - Price divergence handling

3. **Attack Resistance**
   - Sandwich attack protection
   - Arbitrage discouragement

4. **Market Dynamics**
   - High volume trading simulation
   - Price efficiency during volatility

5. **System Reliability**
   - Concurrent quote handling
   - High traffic quote accuracy

6. **Edge Cases**
   - Decimal precision handling
   - Reserve stability testing

## 12. Contract Interaction

### Core Functions

#### Finding Best Quote
```solidity
// Returns the AMM with best price and expected output amount
function getBestQuote(
    uint256 amountIn,
    bool isAtoB
) public view returns (
    address bestAMM,
    uint256 bestOutput
)
```

#### Executing Swaps
```solidity
// Execute a swap through the best AMM
function executeSwap(
    uint256 amountIn,
    bool isAtoB,
    uint256 minOutput
) external returns (
    uint256 amountOut
)
```

#### Checking Reserves
```solidity
// Get current reserves of both AMMs
function getReserves() external view returns (
    uint256 amm1ReserveA,
    uint256 amm1ReserveB,
    uint256 amm2ReserveA,
    uint256 amm2ReserveB
)
```

## 13. Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes:
```bash
git commit -m 'Add some amazing feature'
```
4. Push to the branch:
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## 14. License

This project is licensed under the MIT License.

### Contact
Email: markemerydev@gmail.com


