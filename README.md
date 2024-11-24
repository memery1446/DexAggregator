Welcome to URDEX! Thanks for learning more about this Solidity-based DEX aggregator that finds the best trading rates across two Automated Market Makers (AMMs). URDEX executes trades with optimal pricing and features a React frontend for easy interaction. Here's what you will find in this this README:

1. CONFIG/SECURITY
2. INSTALLATION - video and step-by-step guide 
3. PREREQUISITES - w/ links
4. USAGE - w/ video and step-by-step guide
5. OPTIONAL DEPLOYMENTS

 ...then some more in-depth info about URDEX...

6. THE URDEX ARCHITECTURE AT A GLANCE
7. CONTRACTS
8. FEATURES
9. FRONTEND
10. TESTING
11. CONTRACT INTERACTION
12. HOW TO CONTRIBUTE TO URDEX
13. LISENCE INFO

==================================

1. CONFIG/SECURITY 
    URDEX uses Hardhat for development and deployment. Configuration is found in, hardhat.config.js, which supports the following:
            - Local development network
            - Sepolia testnet deployment
            - Solidity version 0.8.19
            - Custom artifact path for frontend integration

2. INSTALLATION 
    We'll walk right through each step to get you developing and expanding this aggregator and making it your own.
    
        Some notes before we get started: 
            a. When running the terminal commands in this guide, do not include the surrounding backticks or the containing brackets. (Ex. ``, and < >)
            b. Due to different development environments and operating systems, you may need to do some research to accomplish your version of the steps outlined below.  
            c. When you need to take an action, you'll see it marked like this: 

                                    => => ACTION <= <= 

        - First we'll clone the repository

          => => IN YOUR TERMINAL, RUN: 
          git clone `https://github.com/memery1446/DexAggregator <name-of-your-choice>` <= <= 

        Remember not to include the backtics or <>'s...! You've just created the directory. 

         => =>  IN YOUR TERMINAL, RUN: `cd dex-aggregator` -or- `cd <your-chosen-name>`  <= <= 

        Great! You did a change-directory command, or cd and have entered your new project. As an example, if you had named it "Dex2", you should see something like this in your terminal:  
        `Mark@Marks-MacBook-Pro Dex2 %` 

        - Now it's time to install the dependencies that will allow you to expand and adapt this project to your goals. 

             => => IN YOUR TERMINAL, RUN: 
              npm install <= <= 

        You'll see downloading progress in the terminal. Even if it pauses for a while or doesn't start right away, keep waiting. It will finish.
        
        Seeing several warnings and a lot of info on the terminal is quite normal. Let's proceed.       

            => =>   Open the project in your text editor.   <= <=

            I use Sublime Text so here is a case where you may need to do some intuitive interpreting of the instructions to fit your system. 

          => =>   Once the project is open, create a `.env` file in the root directory then paste the text below into the .env file. Don't worry if you don't have the keys and url that are mentioned. They will be obtained in the next section on prerequisites. The placeholders are fine during local development on Hardhat but need to be replaced with your keys for deployment on Sepolia. For now, get the .env file saved with this info. 

                  `ALCHEMY_SEPOLIA_URL=your_alchemy_url
                  PRIVATE_KEY=your_wallet_private_key
                  ETHERSCAN_API_KEY=your_etherscan_api_key`  <= <=

3. PREREQUISITES

        - Now we need to verify a version of Node.js 14+ or install it. 

               => =>  Check for the current status of your Node.js - IN YOUR TERMINAL, RUN: `node -v npm -v`
                    If needed, download Node.js: https://nodejs.org/en/download/package-manager  <= <= 

            There are a host of good videos for this and as many development set-ups. You're best off doing a Google search for your particular system. 

        - Let's now install Hardhat, which is going to make your development process so much easier by offering a local node and easy access to test Ether. 

            If you're not in your project directory, 

            => =>     IN YOUR TERMINAL, open the root directory. `cd <name>`  <= <=

            Once in your project directory, run the following noting the dashes exactly,

            => =>     IN YOUR TERMINAL, RUN: `npm install --save-dev hardhat`  <= <=

                    For help or more information: https://hardhat.org/hardhat-runner/docs/getting-started#installation

                Your clone of URDEX is now connected with Hardhat and almost ready for development. 

        - Even though you will develop in Hardhat, let's complete the set-up for Sepolia to save any headaches later, especially after you've changed the project. 

         => =>    Obtain an API key for Sepolia testnet deployment (ex. Alchemy, Infura), and paste it into the `.env` file, replacing the placeholder text.  <= <=
                    For help: 
                    https://www.alchemy.com/
                    https://www.infura.io/

        => =>   Connect a web3 wallet like Metamask with the Hardhat Network. Note that "show test networks" may need to be selected.  <= <=

        => =>   Save the wallet private key of Hardhat accout -0- to the `.env` file, replacing the placeholder text.    <= <=
                    For help: https://metamask.io

        => =>   Obtain an Etherscan API key for contract verification, and paste it into the `.env`file, replacing the placeholder text.   <= <=
                    Go to: 
                    https://etherscan.io/

    Congratulations! You are now ready to develop. Rest assured knowing that URDEX comes with extensive security measures implemented and tested:
                    - Reentrancy protection on all critical functions
                    - Slippage protection mechanisms
                    - Price manipulation resistance
                    - Flash loan attack prevention
                    - Sandwich attack protection
                    - Maximum trade size limits
                    - Reserve ratio maintenance
                    - Decimal precision handling  
                    - Lot of front end testing available        

4. USAGE
    You're ready to begin making this aggregator your own. 

    => =>   Make sure you're project is open in your text editor, and that you have given your terminal the command 'cd <name-of-project>` to open the directory.    <= <=

    => =>   In your Web3 wallet, select the Hardhat Network. In Metamask, this is on the upper left  <= <=

    Start a local Hardhat node 
            => =>   IN YOUR TERMINAL, RUN: `npx hardhat node`     <= <=

        - Deploy contracts locally on the Hardhat node for development: 

            ***(NOTE: If you want to deploy to Sepolia, skip to "Testnet Deployment on Sepolia")***

            => =>   IN YOUR TERMINAL, RUN: `npx hardhat run scripts/deploy.js --network localhost`   <= <=

            => =>   Make note of deployment addresses in the terminal 
            and enter them into these files:    <= <=

                scripts/addliquidity.js
                scripts/check-balances.js
                scripts/setup-check.js
                scripts/verify-deployment.js

        - Now we need to get some liquidity to both you and the two AMMs

            => =>   IN YOUR TERMINAL, RUN: 
            `npx hardhat run scripts/add-liquidity.js --network localhost`   <= <=

        - To Deploy the Frontend: 

            => =>   IN YOUR TERMINAL, RUN: `npm run start`    <= <=

            => =>   Locate the browser, or open a browser to `Localhost:3000`     <= <=

    Testnet Deployment on Sepolia:

            => =>   Update the `.env` file with your Ethereum wallet private key 
            (Should not be a Hardhat account)      <= <=

            => =>   Get a fresh terminal window, stop any other Hardhat projects, and save    <= <=

            => =>   Connect your wallet to the Sepolia Network  <= <=

            => =>   Verify or obtain Sepolia ETH in order to deploy the contracts     <= <= 
            https://faucets.chain.link/sepolia

        - Now you're ready to deploy to the Sepolia testnet

            => =>   IN YOUR TERMINAL, RUN: 
            `npx hardhat run scripts/deploy.js --network sepolia`      <= <=
         
            => =>   Make note of deployment addresses and update enter them into  
                        scripts/addliquidity.js
                        scripts/check-balances.js
                        scripts/setup-check.js
                        scripts/verify-deployment.js  <= <=

            => =>   Deploy the front end using Vercel 
            (a free account will do it) or similar provider   <= <=
                        https://vercel.com/ 

5. OPTIONAL DEPLOYMENTS 
        - Remember to first manually update contract addresses in the files for these scripts!
            => =>   IN YOUR TERMINAL, RUN: 
                `npx hardhat run scripts/check-balance.js
                npx hardhat run scripts/setup-check.js                       
                npx hardhat run scripts/verify-deployment.js  --network <localhost or sepolia>`   <= <=

6. OPTIONAL FRONTEND COMPONENTS
        
        The frontend includes specialized test utilities for debugging, verification and expansion. To use the front end tests, import the component to App.js and add it to the return statement for visibility. For a good example of this, look at how src/components/PriceChart.js is imported at the top of App.js and included below <like this />.

        Here are the front end extras: 

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

            \\\\\\\\\\\\\\\\\\\                                  ///////////////////
                                <<< END OF STEP-BY-STEP GUIDE >>
            ///////////////////                                  \\\\\\\\\\\\\\\\\\\

7. ARCHITECTURE AT A GLANCE
    URDEX implements a route aggregation pattern where:

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

8. CONTRACTS
        - `DexAggregator.sol`: Main aggregator contract that routes trades
        - `AMM.sol`: First AMM implementation with 0.3% fee
        - `AMM2.sol`: Second AMM implementation with 0.5% fee and a trade limit of 200% of reserves
        - `Token.sol`: ERC20 token implementation with minting capabilities
        - `Attacker.sol`: URDEX's Attacker tests security measures and potential attack vectors


9. FEATURES
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

10. FRONTEND
    Features:
        - Real-time price charts using Recharts
        - Transaction history tracking
        - Responsive design for all devices
        - Wallet connection integration
        - Gradient background with glass-morphism UI elements
        - Loading states and error handling through Redux 

    Components:
        - `Navigation.js`: Header with wallet connection
        - `SwapCard.js`: Main trading interface
        - `PriceChart.js`: Price visualization component
        - `RecentTransactions.js`: Transaction history display
        - `Loading.js`: Loading state component
        - `Footer.js`: Application footer

11. TESTING
        To run tests, IN YOUR TERMINAL RUN: `npx hardhat test` 
        To run a particular test, IN YOUR TERMINAL RUN: `npx hardhat test test/<test-name>.js`

    DexSystem test description:

        Cross-Contract Liquidity Tests
            - Reserve consistency across AMMs
            - Simultaneous liquidity changes
            - Multiple operation impacts

        Advanced Attack Resistance
            - Flash loan attack prevention
            - Sandwich attack protection
            - Arbitrage diminishing returns
            - Price manipulation resistance

        Market Dynamics
            - High volume trading periods
            - Price efficiency during volatility 
            - System stability under stress
            - Reserve ratio maintenance

        Edge Cases & Reliability
            - Decimal precision handling
            - Concurrent quote consistency
            - Failed swap recovery
            - Imbalanced liquidity scenarios

        Gas & Performance
            - Gas usage optimization
            - Trade size scalability
            - High traffic quote accuracy
            - System recovery mechanisms

        Summary: 
            The URDEX system-wide test suite employs detailed logging for performance metrics and uses comprehensive fixtures for system setup. It validates both normal operations and potential attack vectors while ensuring market stability and efficiency.

    DexAggregator test description: 

        Cross-Contract Liquidity
            - Reserve consistency across AMMs
            - Simultaneous liquidity changes
            - Multi-operation reserve tracking

        Price Impact and Routing
            - Large trade routing optimization
            - Price divergence handling
            - Best quote verification

        Attack Resistance
            - Price impact limits
            - Sandwich attack prevention
            - Arbitrage diminishing returns
            - Detailed profit tracking

        Market Dynamics
            - High volume trading
            - Price efficiency during volatility 
            - Reserve ratio maintenance
            - Impact comparison between trade sizes

        System Reliability
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
        Basic Tests:
            - Deployment validation
            - Counter initialization
            - Token address verification

        Attack Simulation Tests:
            - Recursive call limits
            - Balance requirements
            - Count integrity
            - Token transfer handling

        Advanced Tests:
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
            This test suite comprehensively verifies both safety features and potential vulnerabilities in DeFi context

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

12. CONTRACT INTERACTION
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

13. CONTRIBUTING
        Fork the repository
        Create your feature branch (`git checkout -b feature/amazing-feature`)
        Commit your changes (`git commit -m 'Add some amazing feature'`)
        Push to the branch (`git push origin feature/amazing-feature`)
        Open a Pull Request

14. LICENSE
        This project is licensed under the MIT License.
