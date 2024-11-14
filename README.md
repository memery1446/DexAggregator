DexAggregator

A Solidity-based DEX aggregator that finds the best trading rates across multiple Automated Market Makers (AMMs) and executes trades with optimal pricing. Features a React frontend for easy interaction.

Features

- Compare prices across multiple AMM protocols
- Execute trades through the most efficient route
- Price history tracking for each AMM
- Support for both forward and reverse token swaps
- Slippage protection
- Price impact protection
- Gas-efficient operation
- Real-time price charts
- Recent transaction history
- Responsive UI with dark mode

Smart Contracts

The project consists of several smart contracts:

- `DexAggregator.sol`: Main aggregator contract that routes trades
- `AMM.sol`: First AMM implementation with 0.3% fee
- `AMM2.sol`: Second AMM implementation with 0.5% fee
- `Token.sol`: ERC20 token implementation with minting capabilities
- `Attacker.sol`: Testing security measures and potential attack vectors

Prerequisites

- Node.js 14+ and npm
- Hardhat
- An Alchemy API key for Sepolia testnet deployment
- MetaMask or another Web3 wallet
- Etherscan API key for contract verification

Installation

1. Clone the repository

      IN YOUR TERMINAL, RUN: 
      git clone <repository-url>
      cd dex-aggregator


2. Install dependencies

      IN YOUR TERMINAL, RUN: 
      npm install


3. Create a `.env` file in the root directory with the following variables:

      ALCHEMY_SEPOLIA_URL=your_alchemy_url
      PRIVATE_KEY=your_wallet_private_key
      ETHERSCAN_API_KEY=your_etherscan_api_key


Frontend Application

The application features a modern React-based interface with:

- Real-time price charts using Recharts
- Transaction history tracking
- Responsive design for all devices
- Wallet connection integration
- Gradient background with glass-morphism UI elements
- Loading states and error handling

Frontend Components

- `Navigation.js`: Header with wallet connection
- `SwapCard.js`: Main trading interface
- `PriceChart.js`: Price visualization component
- `RecentTransactions.js`: Transaction history display
- `Loading.js`: Loading state component
- `Footer.js`: Application footer

Testing

The project includes comprehensive test suites for both smart contracts and frontend components.

Frontend Testing Suite

The frontend includes specialized test utilities for debugging and verification:

1. Account Verification (`AccountVerify.js`)
   - Validates wallet connection status
   - Tests account switching functionality
   - Verifies account permissions and balances
   - Checks token allowances

2. Connection Testing (`ConnectionTest.js`)
   - Tests Web3 provider connectivity
   - Validates network connection stability
   - Checks RPC endpoint responsiveness
   - Connection error handling verification

3. Contract Debugging (`ContractDebug.js`)
   - Smart contract interaction testing
   - Event listener verification
   - Transaction receipt validation
   - Gas estimation accuracy checks

4. Network Testing (`NetworkTest.js`)
   - Network switching functionality
   - Chain ID verification
   - Network latency testing
   - Failed network handling

5. State Monitoring (`StateMonitor.js`)
   - Redux state management testing
   - State update verification
   - Action dispatch testing
   - State persistence checks

6. Wallet Debugging (`WalletDebug.js`)
   - Wallet connection edge cases
   - Transaction signing tests
   - Message signing verification
   - Wallet error handling

Description of DexAggregator Testing: 

The DexAggregator test suite demonstrates comprehensive system testing across several key areas:

1. Cross-Contract Liquidity
- Reserve consistency across AMMs
- Simultaneous liquidity changes
- Multi-operation reserve tracking

2. Price Impact and Routing
- Large trade routing optimization
- Price divergence handling
- Best quote verification

3. Attack Resistance
- Price impact limits
- Sandwich attack prevention
- Arbitrage diminishing returns
- Detailed profit tracking

4. Market Dynamics
- High volume trading
- Price efficiency during volatility 
- Reserve ratio maintenance
- Impact comparison between trade sizes

5. System Reliability
- Concurrent quote handling
- High traffic quote accuracy
- Decimal precision
- Market stress testing

The tests use a comprehensive fixture setup with tokens, AMMs, and the aggregator, validating both normal operations and edge cases while tracking important metrics like price impacts and reserve ratios.


Description of dexSystem testing: 

The DEX System Integration tests cover several critical areas:

1. Cross-Contract Liquidity Tests
- Reserve consistency across AMMs
- Simultaneous liquidity changes
- Multiple operation impacts

2. Advanced Attack Resistance
- Flash loan attack prevention
- Sandwich attack protection
- Arbitrage diminishing returns
- Price manipulation resistance

3. Market Dynamics
- High volume trading periods
- Price efficiency during volatility 
- System stability under stress
- Reserve ratio maintenance

4. Edge Cases & Reliability
- Decimal precision handling
- Concurrent quote consistency
- Failed swap recovery
- Imbalanced liquidity scenarios

5. Gas & Performance
- Gas usage optimization
- Trade size scalability
- High traffic quote accuracy
- System recovery mechanisms

The test suite employs detailed logging for performance metrics and uses comprehensive fixtures for system setup. It validates both normal operations and potential attack vectors while ensuring market stability and efficiency.

Description of AMM and AMM2 testing: 

Both AMM test suites cover similar core functionality but have key differences:

Common Test Categories:
- Deployment verification
- Reserve tracking
- Liquidity provision
- Token approvals
- Price calculations
- Basic swap functionality

AMM2-Specific Tests:
- 0.5% fee verification vs AMM's 0.3%
- Swap amount limits (200% reserve cap)
- Comparative price impact analysis
- Cross-AMM behavior testing
- Large vs small trade handling

Key Differences:
- AMM2 tests focus more on protective features
- AMM2 includes direct comparisons with AMM1
- AMM2 has additional price impact testing across different liquidity depths
- AMM2 validates specific security constraints like swap limits

The test suites effectively validate both common AMM functionality and the unique characteristics that differentiate AMM2 from AMM1.

Description of the Attacker contract and testing: 

The Attacker contract and its tests focus on testing security measures and potential attack vectors. Here's an analysis:

Attacker.sol Features:
- Recursive call counter (max 5 iterations)
- Locking mechanism
- Token balance validation
- Attack initiation function

Test Suite Structure:
1. Basic Tests:
- Deployment validation
- Counter initialization
- Token address verification

2. Attack Simulation Tests:
- Recursive call limits
- Balance requirements
- Count integrity
- Token transfer handling

3. Advanced Tests:
- DEX-specific attack scenarios
- Cross-AMM attack resistance
- Flash loan simulation
- Sandwich attack testing
- High-value transaction testing

Key Test Categories:
- Basic functionality
- Security measures
- Attack vectors
- Edge cases
- Gas limitations
- Cross-contract interactions

The tests comprehensively verify both safety features and potential vulnerabilities in DeFi context.

Run smart contract tests:
IN YOUR TERMINAL, RUN: 
npx hardhat test


Configuration

The project uses Hardhat for development and deployment. The configuration can be found in `hardhat.config.js`, which supports:

- Local development network
- Sepolia testnet deployment
- Solidity version 0.8.19
- Custom artifact path for frontend integration

Security Features

Extensive security measures are implemented and tested:

- Reentrancy protection on all critical functions
- Slippage protection mechanisms
- Price manipulation resistance
- Flash loan attack prevention
- Sandwich attack protection
- Maximum trade size limits
- Reserve ratio maintenance
- Decimal precision handling

Usage

Local Development

1. Start local Hardhat node:

      IN YOUR TERMINAL, RUN: 
      npx hardhat node


2. Deploy contracts:

      IN YOUR TERMINAL, RUN: 
      npx hardhat run scripts/deploy.js --network localhost


Testnet Deployment

Deploy to Sepolia testnet:

      IN YOUR TERMINAL, RUN: 
      npx hardhat run scripts/deploy.js --network sepolia


Contract Interaction

Finding Best Quote

solidity
// Returns the AMM with best price and expected output amount
function getBestQuote(uint256 amountIn, bool isAtoB) public view returns (address bestAMM, uint256 bestOutput)


Executing Swaps

solidity
// Execute a swap through the best AMM
function executeSwap(uint256 amountIn, bool isAtoB, uint256 minOutput) external returns (uint256 amountOut)


Checking Reserves

solidity
// Get current reserves of both AMMs
function getReserves() external view returns (
    uint256 amm1ReserveA,
    uint256 amm1ReserveB,
    uint256 amm2ReserveA,
    uint256 amm2ReserveB
)


Architecture

The DEX aggregator implements a route aggregation pattern where:

1. The main contract queries prices from connected AMMs
2. Compares output amounts for the same input
3. Routes the trade through the most efficient path
4. Maintains price history for analysis

Key features of the AMMs:
- AMM1: Uses 0.3% fee structure
- AMM2: Uses 0.5% fee structure
- Both implement standard constant product formula
- Include reentrancy protection
- Maintain minimum liquidity requirements

Performance Considerations

- Gas optimization for different trade sizes
- Efficient handling of concurrent operations
- Balanced reserve management
- Price stability maintenance
- Scaling considerations for high-volume periods

Events

The contracts emit various events for tracking:

solidity
event BestQuoteFound(address amm, uint256 outputAmount);
event SwapExecuted(address amm, uint256 amountIn, uint256 amountOut);
event PriceUpdated(address amm, uint256 price, uint256 timestamp);


Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

License

This project is licensed under the MIT License.
