# URDEX Aggregator

URDEX is a sophisticated, extensible decentralized exchange (DEX) aggregator built on Sepolia testnet that serves both as a production-ready platform and a robust foundation for further development. By comparing prices and liquidity between multiple automated market makers (AMMs) with varying fee structures (0.3% and 0.5%), URDEX automatically routes trades through the most efficient path to ensure optimal exchange rates. The modular architecture and well-documented codebase make it an ideal starting point for developers looking to build their own DeFi applications or extend the platform's capabilities. 

Currently featuring real-time price tracking, intuitive swap interfaces, and comprehensive transaction monitoring, URDEX's design patterns and security measures (including reentrancy protection and slippage controls) provide a solid template for building advanced DEX functionality. Whether you're a user seeking the best swap rates, a developer building on top of the platform, or a project looking to fork and customize the codebase, URDEX offers a battle-tested foundation for decentralized trading infrastructure.

## QUICK START - Follow this guide to swap on the deployed URDEX 

   ***Prerequisites: 
   You'll need a bit of Sepolia ETH [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia) 
   A Web3 wallet like [MetaMask](https://metamask.io)

Once you follow the link to URDEX, you'll be able to:
   - Import the token addresses into your metamask
   - Get a free drip of TK1 and TK2 from the URDEX token faucet (the free Sepolia ETH pays the blockchain transaction fee)
   - Swap, setting slippage and observing gas fees
   - Watch the aggregator determine the transaction path
   - Observe pricechanges, market dynamics and transaction history
   - See a breakdown of the gas fee
   - Experience true production grade aggregator functionality

**Go to: [URDEX](https://dex-aggregator-theta.vercel.app/swap)


## CLONE URDEX - Follow this guide to clone or contribute 

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
- A local development network from Hardhat
- Sepolia testnet deployment 
- Solidity version 0.8.19
- Custom artifact path for frontend integration for security

## 2. Installation

## Important Notes 
- When running the terminal commands, do not include any backticks `` or containing brackets < >
- These instructions are coming from a system using Mac, Sublime Text, and Metamask. Convert instructions as needed to fit your development environment. 

## Step-by-Step Installation
1. Open your terminal

2. Clone the repository
```bash
git clone https://github.com/memery1446/DexAggregator <name-of-your-choice>
```
3. cd, (c-hange d-irectory) into your project root 
```bash
cd <name-you-chose>
```
The terminal should look something like: you@Your-MacBook-Pro name-you-chose %

    Notice that the project name comes before the % sign.  

4. Remove git origin to keep your repository clean
```bash
git remote remove origin
```
The terminal will not show anything, but the command was executed. The clone is no longer connected to the URDEX repository url.  

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
For help: [nodejs.org](https://nodejs.org/en/download/package-manager)

### Hardhat Setup
2. Install Hardhat:
```bash
npm install --save-dev hardhat
```

### Sepolia Deployment Setup
Filling out the .env file...

1. Get an [Etherscan API key](https://etherscan.io/) for contract verification. Enter the API key into the .env file. 

2. Obtain Sepolia testnet URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) and paste it into the .env file. 

3. Connect a Web3 wallet like [MetaMask](https://metamask.io)

4. Choose which Ethereum account you want as your deployer. Copy the private key, enter it into the .env file and save.  **Make sure this is not a Hardhat private key**

The .env file is now complete. With private information, it will never be pushed to Github, and will remain where it originated. Remember to update the .env file any time the key or url information change. 

##  Tip: 
Why will the .env not push to github? Because the extenstion .env is in the .gitignore file. 

## Security Features at a glance 
Here is a brief review of security features that offer developer-confidence in this base as a foundation to build on. More in-depth info follows:

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
1. Ensure your Web3 wallet is on Hardhat Network or choose "Add Network" and enter the well-documented Hardhat RPC info. In Metamask it's the icon in the upper left corner. The video tutorial shows the RPC information but it's also easy to get online. [Hardhat](https://hardhat.org/)

2. Start local Hardhat node:
```bash
npx hardhat node
```
**Make sure to 'cd' into the project root directory before starting the node. 

3. Find Account 0 on the node terminal (toward the top) and copy the private key. In zero based accounting this is the the first account. Account 0 will always be the deployer on Hardhat.

4. Paste the Hardhat account private key into your Web3 wallet by selecting the Account area, then selecting "add an account or hardware wallet." In Metamask, the Account section is dead center top. Paste in the private key. 

***The Hardhat node, accounts and private keys will remain consistent so it's best to name this account "Hardhat 0." You can also add more Hardhat accounts from the node to simulate users, varying permissions, etc. NEVER send real crypto to a Hardhat Account. 


5. Deploy contracts locally:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
6. Update deployment addresses in:
   - scripts/setup.js
   - scripts/addliquidity.js
   - scripts/check-balances.js
   - scripts/setup-check.js
   - scripts/verify-deployment.js
   - src/contracts/contractAddresses.js

***Deployment addresses are in the terminal that sent the deploy command. 

7. Import TK1 and TK2 tokens into your Web3 wallet by copying and pasting the contact addresses one-at-a-tme from the terminal. In Metamask the path is: tokens > import. Use symbols TK1 and TK2 and 18 for decimals. You will see your initial minting balance of 1 million TK1 and TK2. 

Now the AMMs need liquidity...

8. Add liquidity:
```bash
npx hardhat run scripts/add-liquidity.js --network localhost
```

### Deploy Frontend for Development
From a terminal open to your project root directory, run: 
```bash
npm run start
```
If it doesn't open on its own, open a web browser to: `localhost:3000`

### Sepolia Testnet Deployment

1. Initial Setup
   - Connect your wallet to Sepolia Network
   - If needed, update `.env` with your Ethereum wallet private key (remember, NOT a Hardhat account private key)
   - Get Sepolia ETH from [Chainlink Faucet](https://faucets.chain.link/sepolia)

***ERRORS? Doublecheck that you are in your root directory. Clear your Metamask activity tab data. 

2. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Update Deployment Addresses

   Get addresses from the terminal and update these files:
   - scripts/addliquidity.js
   - scripts/check-balances.js
   - scripts/setup-check.js
   - scripts/verify-deployment.js 
   - src/contracts/contractAddresses.js

4. Deploy Frontend on Sepolia
   Use [Vercel](https://vercel.com/) or similar provider (free tier is sufficient)
   
## 5. Optional Deployments

The following deployments can provide valuable information but are not necessary for DEX operation.

### Helper Scripts
Update contract addresses in the scripts, then run:
# Check balances
```bash
npx hardhat run scripts/check-balance.js --network <hardhat or sepolia>
```
# Verify setup
```bash
npx hardhat run scripts/setup-check.js --network <hardhat or sepolia>
```
# Verify deployment
```bash
npx hardhat run scripts/verify-deployment.js --network <hardhat or sepolia>
```

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

**Important**: Remember that your deployed TK1 and TK2 addresses will not match the existing URDEX Token Faucet addresses. 

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


