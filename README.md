URDEX Aggregator

1. WELCOME
2. PREREQUISITES
3. CONFIG/SECURITY
4. INSTALLATION
5. USAGE

 ...more in-depth info about URDEX...

6. ARCHITECTURE AT A GLANCE
7. CONTRACTS
8. FEATURES
9. FRONTEND
10. TESTING
11. CONTRACT INTERACTION
12. CONTRIBUTING
13. LISENCE

===

1. WELCOME
    Welcome to URDEX, a Solidity-based DEX aggregator that finds the best trading rates across two Automated Market Makers (AMMs). URDEX executes trades with optimal pricing and features a React frontend for easy interaction. URDEX was created by Mark Emery: markemerydev@gmail.com. 

2. PREREQUISITES
            - Node.js 14+ and npm
            - Hardhat
            - An API key for Sepolia testnet deployment (ex. Alchemy, Infura)
            - A Web3 wallet (ex. Metamask)
            - Etherscan API key for contract verification

3. CONFIG/SECURITY 
    URDEX uses Hardhat for development and deployment. Configuration is found in, `hardhat.config.js`, which supports:
            - Local development network
            - Sepolia testnet deployment
            - Solidity version 0.8.19
            - Custom artifact path for frontend integration

    URDEX comes with extensive security measures implemented and tested:
            - Reentrancy protection on all critical functions
            - Slippage protection mechanisms
            - Price manipulation resistance
            - Flash loan attack prevention
            - Sandwich attack protection
            - Maximum trade size limits
            - Reserve ratio maintenance
            - Decimal precision handling

4. INSTALLATION
    Clone the repository

          IN YOUR TERMINAL, RUN: 
          git clone <repository-url>
          cd dex-aggregator

          [To remove origin RUN: git remote -v git remote remove origin]

    Install dependencies

          IN YOUR TERMINAL, RUN: 
          npm install


    Create a `.env` file in the root directory with the following variables:

          ALCHEMY_SEPOLIA_URL=your_alchemy_url
          PRIVATE_KEY=your_wallet_private_key
          ETHERSCAN_API_KEY=your_etherscan_api_key

5. USAGE
    Local Development:

        Start local Hardhat node: IN YOUR TERMINAL, RUN: npx hardhat node


        Deploy contracts locally: IN YOUR TERMINAL, RUN: npx hardhat run scripts/deploy.js --network localhost

    Testnet Deployment:

        Deploy to Sepolia testnet: IN YOUR TERMINAL, RUN: npx hardhat run scripts/deploy.js --network sepolia
        Note: Be sure to connect your wallet to the Sepolia testnet. 

6. ARCHITECTURE AT A GLANCE
    The DEX aggregator implements a route aggregation pattern where:

        a. The main contract queries prices from connected AMMs
        b. Compares output amounts for the same input
        c. Routes the trade through the most efficient path
        d. Maintains price history for analysis

    Key features of the AMMs:
            - AMM1: Uses 0.3% fee structure
            - AMM2: Uses 0.5% fee structure
            - Both implement standard constant product formula
            - Include reentrancy protection
            - Maintain minimum liquidity requirements

    Performance Considerations:
            - Gas optimization for different trade sizes
            - Efficient handling of concurrent operations
            - Balanced reserve management
            - Price stability maintenance
            - Scaling considerations for high-volume periods

    Events:
        event BestQuoteFound(address amm, uint256 outputAmount);
        event SwapExecuted(address amm, uint256 amountIn, uint256 amountOut);
        event PriceUpdated(address amm, uint256 price, uint256 timestamp);

7. CONTRACTS
            - `DexAggregator.sol`: Main aggregator contract that routes trades
            - `AMM.sol`: First AMM implementation with 0.3% fee
            - `AMM2.sol`: Second AMM implementation with 0.5% fee and a trade limit of 200% of reserves
            - `Token.sol`: ERC20 token implementation with minting capabilities
            - `Attacker.sol`: URDEX's Attacker tests security measures and potential attack vectors


8. FEATURES
            - URDEX compares prices across two AMM protocols, AMM and AMM2, and executes trades through the most efficient route using the safety of try-catch blocks.

            - Price history tracking is kept for each AMM. URDEX keeps the histories separate and records prices during actual trades rather than tracking every block. This makes URDEX more gas efficient and provides rich historical data for analytics. Events are emitted for off-chain tracking. 

            - URDEX supports both forward and reverse token swaps.

            - Slippage protection is adjustable, preventing sandwich attacks and protecting users from getting fewer tokens than expected due to price movements. URDEX's minOutput parameter allows the user to determine their own risk tolerance level. 

            - URDEX protects price impact with percentage-of-reserve management (AMM2) as well as price scaling protection.

            - Gas-efficient operation is established through quote caching, batched operations and concurrent processing. Size independent efficiency and a hard cap round out the gas efficiency for URDEX.

            - Real-time price charts offer the user multiple time settings and loading states for optimized UX. 

            - Recent transaction history shows transaction type with token amounts and symbols for both sides of the trade.
            Shortened transaction hashes and human-readable relative timestamps ("5m ago", "2h ago") offer the info in an efficient manner.

            - URDEX has a esponsive UI which includes dark mode.


9. FRONTEND
    Features:
            - Real-time price charts using Recharts
            - Transaction history tracking
            - Responsive design for all devices
            - Wallet connection integration
            - Gradient background with glass-morphism UI elements
            - Loading states and error handling through Redux. 

    Components:
            - `Navigation.js`: Header with wallet connection
            - `SwapCard.js`: Main trading interface
            - `PriceChart.js`: Price visualization component
            - `RecentTransactions.js`: Transaction history display
            - `Loading.js`: Loading state component
            - `Footer.js`: Application footer


10. TESTING
 
To run tests, in your terminal run: npx hardhat test 
To run a particular test, run: npx hardhat test test/<test-name>.js


    DexSystem test description:

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

        Summary: 
            The URDEX system-wide test suite employs detailed logging for performance metrics and uses comprehensive fixtures for system setup. It validates both normal operations and potential attack vectors while ensuring market stability and efficiency.

    DexAggregator test description: 

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

        Summary: 
            The DexAggegator tests use a comprehensive fixture setup with tokens, AMMs, and the aggregator, validating both normal operations and edge cases while tracking important metrics like price impacts and reserve ratios.

    AMM and AMM2 test description, combined: 

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

        Summary: 
            The AMM test suites effectively validate both common AMM functionality and the unique characteristics that differentiate AMM2 from AMM1.

    Attacker test description: 

        Attacker Contract Features:
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

        Summary: 
            This test suite comprehensively verifies both safety features and potential vulnerabilities in DeFi context.

    Frontend tests: 

    The frontend includes specialized test utilities for debugging and verification. To use the front end tests, import the component to App.js and add it to the return statement for visibility. 

        Account Verification (`AccountVerify.js`)
               - Validates wallet connection status
               - Tests account switching functionality
               - Verifies account permissions and balances
               - Checks token allowances

        Connection Testing (`ConnectionTest.js`)
               - Tests Web3 provider connectivity
               - Validates network connection stability
               - Checks RPC endpoint responsiveness
               - Connection error handling verification

        Contract Debugging (`ContractDebug.js`)
               - Smart contract interaction testing
               - Event listener verification
               - Transaction receipt validation
               - Gas estimation accuracy checks

        Network Testing (`NetworkTest.js`)
               - Network switching functionality
               - Chain ID verification
               - Network latency testing
               - Failed network handling

        State Monitoring (`StateMonitor.js`)
               - Redux state management testing
               - State update verification
               - Action dispatch testing
               - State persistence checks

        Wallet Debugging (`WalletDebug.js`)
               - Wallet connection edge cases
               - Transaction signing tests
               - Message signing verification
               - Wallet error handling


11. CONTRACT INTERACTION
        Finding Best Quote:
        solidity
            // Returns the AMM with best price and expected output amount
            function getBestQuote(uint256 amountIn, bool isAtoB) public view returns (address bestAMM, uint256 bestOutput)

        Executing Swaps:
        solidity
            // Execute a swap through the best AMM
            function executeSwap(uint256 amountIn, bool isAtoB, uint256 minOutput) external returns (uint256 amountOut)


        Checking Reserves:
        solidity
            // Get current reserves of both AMMs
            function getReserves() external view returns (
                uint256 amm1ReserveA,
                uint256 amm1ReserveB,
                uint256 amm2ReserveA,
                uint256 amm2ReserveB
            )

12. CONTRIBUTING
        Fork the repository
        Create your feature branch (`git checkout -b feature/amazing-feature`)
        Commit your changes (`git commit -m 'Add some amazing feature'`)
        Push to the branch (`git push origin feature/amazing-feature`)
        Open a Pull Request

13. LICENSE
        This project is licensed under the MIT License.
