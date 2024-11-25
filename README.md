Welcome to the URDEX Aggregator!

URDEX is a sophisticated, extensible decentralized exchange (DEX) aggregator built on Sepolia testnet that serves both as a production-ready platform and a robust foundation for further development. By comparing prices and liquidity between multiple automated market makers (AMMs) with varying fee structures (0.3% and 0.5%), URDEX automatically routes trades through the most efficient path to ensure optimal exchange rates. The modular architecture and well-documented codebase make it an ideal starting point for developers looking to build their own DeFi applications or extend the platform's capabilities. 

Currently featuring real-time price tracking, intuitive swap interfaces, and comprehensive transaction monitoring, URDEX's design patterns and security measures (including reentrancy protection and slippage controls) provide a solid template for building advanced DEX functionality. Whether you're a user seeking the best swap rates, a developer building on top of the platform, or a project looking to fork and customize the codebase, URDEX offers a battle-tested foundation for decentralized trading infrastructure.

For those wanting to try out URDEX, experience swaps, learn about Dex Aggregator functionality, or perhaps are connecting your first Web3 wallet, it's super easy using the link below. Once there you'll see a token faucet link with easy instructions on how to import and receive tokens TK1 and TK2. 

Go to URDEX: https://dex-aggregator-theta.vercel.app/swap

Here's how the rest of this README is organized:

1. CONFIG/SECURITY
2. INSTALLATION  
3. PREREQUISITES 
4. USAGE 
5. OPTIONAL DEPLOYMENTS

By this point cloners are up and running. Next sections offer more in-depth info about URDEX.

6. OPTIONAL FRONTEND COMPONENTS
7. URDEX ARCHITECTURE AT A GLANCE
8. CONTRACTS
9. FEATURES
10. RUNNING TESTS
11. TESTING DESCRIPTION
12. CONTRACT INTERACTION
13. CONTRIBUTE TO URDEX
14. LICENSE INFO

==================================

1. CONFIG/SECURITY 
    URDEX uses Hardhat for development and deployment. Configuration is found in /hardhat.config.js, which supports the following:
            - A local development network
            - Sepolia testnet deployment 
            - Solidity version 0.8.19
            - Custom artifact path for frontend integration

2. INSTALLATION 
    Now we'll walk right through each step to get you using and developing this aggregator.
    
        Some notes before we get started: 
            - When running the terminal commands, do not include the surrounding backticks or the containing brackets. (Ex. ``, and < >)

            - Due to different development environments and operating systems, you may need to do some research to accomplish some of the steps outlined below for your particular setup. 

            - In these instructions, when you need to take an action, you'll see that action marked like this: 

                                    => => action description  <= <= 

        - First we'll clone the repository

            => =>  Open your computer terminal  <= <= 

            => =>  IN YOUR TERMINAL, RUN: 
          git clone `https://github.com/memery1446/DexAggregator <name-of-your-choice>`   <= <= 

                ***Remember, do not include the backtics `` or brackets <>...!*** 

        You've just created a root directory under your new name, with all of the URDEX files. 

         => =>  IN YOUR TERMINAL, RUN: `cd <your-chosen-name>` (ex. cd MyDexAggregator)    <= <= 

        You executed a change-directory command (cd) and have now entered the root directory of your new project. Verify in your terminal that you see the name of your project before the % symbol. As an example, if you had named it "MyDexAggregator", you should see something like this in your terminal:  
        `Mark@Marks-MacBook-Pro MyDexAggregator %`  

        It's optional but I recommend doing a git remove origin. This will keep your git repository clean and not tied to another url. It's good to do at the start. 

         => =>  IN YOUR TERMINAL, RUN: `git remote remove origin`  <= <= 

         It will look like nothing happened but now all of your files will originate from your git repository.

        - It's time to install dependencies. You can take a look at the package.json to see what this Aggregator requires. 

             => => IN YOUR TERMINAL, RUN: npm install <= <= 

        You'll see downloading progress in the terminal. If it doesn't start right away or ever looks frozen, keep waiting. It will finish.
        
        Seeing several warnings and a lot of info on the terminal after this is quite normal. Let's proceed.  

            => =>   Open the project in your text editor.   <= <=

        I use Sublime Text so here is a case where you may need to translate certain processes in order to achieve the action goal. 

          => =>   Once the project is open in your text editor, create a .env file in the root directory then paste the text below into the .env file. Don't worry if you don't have the keys and url that are mentioned (currently the placeholder text after the equal signs). They will be obtained in the next section. The placeholders are fine during local development on Hardhat, but we'll be back soon to fill it in. For now, get the .env file created and saved with this info: 

                  `ALCHEMY_SEPOLIA_URL=your_alchemy_url
                  PRIVATE_KEY=your_wallet_private_key
                  ETHERSCAN_API_KEY=your_etherscan_api_key`  <= <=

3. PREREQUISITES

        - Now it's important to verify you have a version of Node.js 14+ or install it. You can first check for the current status of your Node.js:

           => =>  IN YOUR TERMINAL, RUN: `node -v`   <= <= 
                    If needed, download or update Node.js: 
                    https://nodejs.org/en/download/package-manager

            There are a host of good videos for this because there are just as many development environments. A Google search highlighting your particular setup should lead to several good examples. 

        - Let's now install Hardhat, which is going to make the development process easier by offering a local node and easy access to test Ether. 

        Make sure you are in your project directory (ex. `cd MyDexAggregator`). Take careful note of the dashes in the next command.

            => =>     IN YOUR TERMINAL, RUN: `npm install --save-dev hardhat`   <= <=

                For help or more information: 
                https://hardhat.org/hardhat-runner/docs/getting-started#installation

                Your clone of URDEX is now connected with Hardhat and almost ready for development. 

        - Let's go ahead complete the set-up for Sepolia deployment. It's good to get all setup done before making changes.

         => =>    Obtain a URL for Sepolia testnet deployment from Alchemy or Infura, and paste it into the `.env` file you created, replacing the placeholder text after the equal sign.   <= <=
                    For help: 
                    https://www.alchemy.com/
                    https://www.infura.io/

        => =>   Connect a web3 wallet like Metamask with the Hardhat Network. Note that "show test networks" may need to be selected in order to find the Hardhat Netowork option.  <= <=

    Be sure your terminal is in your project's root directory, then:

        => =>     IN YOUR TERMINAL, RUN: `npx hardhat node`  <= <=

    You'll see a node spin up with lots of addreses and private keys. It will act as your Ethereum node during development and the addresses and keys will remain consistent launch to launch. 

        => =>   Scroll to the top of the node information and copy the private key for account -0-.   <= <=

    In zero based accounting, this is the first account and will be the deployer account in Hardhat.

        => =>   Paste that address into the `.env` file, replacing the placeholder text.    <= <=
                    For help: 
                    https://metamask.io

         => =>   Now go to your Web3 wallet and make sure you're on the Hardhat Network. Select 'add account or hardware wallet.' Follow prommpts to add an account. Paste the same private key from account -0-, follow prompts, and name the account Hardhat 0, or a name of your choice.    <= <=   

    I highly recommend putting Hardhat in the name of this account to avoid later confusion.         

        => =>   Obtain an Etherscan API key for contract verification, and paste it into the `.env`file, replacing the placeholder text.   <= <=
                    Go to:
                    https://etherscan.io/

      ***WARNING: Never send actual crypto to this or any address on the Hardhat node. Hardhat private keys are known to all and they stay consistent to facilitate easy development.***

    Congratulations! You are now ready to develop, expand, or just enjoy your own edition URDEX. You can rest assured knowing that extensive security measures are implemented and tested. There's more about testing coming up but here are some key features:
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
    It's time to really make this aggregator your own. 

            => =>   Make sure you're project is open in your text editor.    <= <=

            => =>   In your Web3 wallet, select the Hardhat Network. In Metamask, this is on the upper left  <= <=

    Now we'll deploy contracts locally on the Hardhat node for development: 

            ***(NOTE: If you want to deploy to Sepolia, skip from here to "Testnet Deployment on Sepolia")***

            => =>   Open another terminal window and "cd" into your root directory   <= <= 

    The node keeps going. You could minimize it to clear the screen a bit. 

            => =>   IN YOUR TERMINAL, RUN: `npx hardhat run scripts/deploy.js --network localhost`   <= <=

    Note the dashes. Wait for deployment. 

            => =>   Make note of deployment addresses in the terminal and carefully enter them into: 

                scripts/addliquidity.js
                scripts/check-balances.js
                scripts/setup-check.js
                scripts/verify-deployment.js   <= <=

    It's quite obvious to see where the addresses are currently saved. While it's normally not advised to cut and paste code, this is a case where it can save you a lot of time and ensure accuracy. 

    Now you need to import the TK1 and TK2 addresses into our Web3 wallet so they're recognized and can be imported once deployed. 

        => => In your wallet, select "import token."     -- Note: If you have done other work in Hardhat you may need to "hide" or "forget" previous tokens at these same Hardhat addresses. --      Enter the addresses and follow the prompts until both TK1 and TK2 have been imported.     <= <=  

    You won't see tokens yet...that comes next! 

    Now to get some liquidity to both you (the deployer) and the two AMMs so you can make transactions. As their names suggest, AMM and AMM2 are making a market with competition for our TK1/TK2 pair. 

            => =>   IN YOUR TERMINAL, RUN: 
            `npx hardhat run scripts/add-liquidity.js --network localhost`   <= <=

        Momentarily you'll see your TK1 and TK2 in your wallet and you are ready to swap! 

    To Deploy the Frontend on Hardhat: 

            => =>   IN YOUR TERMINAL, RUN: `npm run start`    <= <=

            => =>   After a moment of loading, locate the browser, or open a browser to `Localhost:3000`     <= <=

5. OPTIONAL DEPLOYMENTS 
        These could come in handy during development, offering key information. But they are not necessary for Dex operation. 
    
            => =>   Remember to manually update contract addresses in the scripts listed below.    <= <=

            => =>   IN YOUR TERMINAL, RUN: 
                `npx hardhat run scripts/check-balance.js  --network <hardhat or sepolia>`
                `npx hardhat run scripts/setup-check.js  --network <hardhat or sepolia>`                      
                `npx hardhat run scripts/verify-deployment.js  --network <hardhat or sepolia>`   <= <=

                     ***For those who skipped to the Sepolia section, continue below.***

    Testnet Deployment on Sepolia:

            => =>   Connect your wallet to the Sepolia Network.  <= <=

            => =>   Update the `.env` file with your Ethereum wallet private key. 
            (Should not be a Hardhat account)      <= <=

            => =>   Open a fresh terminal window, "cd" to your root directory. Be sure to stop any other Hardhat projects, and a fresh save is a good idea.    <= <=

            => =>   Get some Sepolia ETH in order to deploy the contracts.     <= <= 
                        https://faucets.chain.link/sepolia

    You're now ready to deploy to the Sepolia testnet

            => =>   Once again be sure you are in your root directory.   <= <= 

            => =>   IN YOUR TERMINAL, RUN: 
            `npx hardhat run scripts/deploy.js --network sepolia`      <= <=

            => =>   Make note of deployment addresses and update these files:  
                        scripts/addliquidity.js
                        scripts/check-balances.js
                        scripts/setup-check.js
                        scripts/verify-deployment.js  <= <=

            => =>   Deploy the frontend on Sepolia using Vercel 
            (a free account will do it) or similar provider   <= <=
                        https://vercel.com/ 

6. OPTIONAL FRONTEND COMPONENTS
        
        The frontend includes specialized test utilities for debugging, verification and expansion. To use the front end tests, import the component to App.js and add it to the return statement for visibility. For a good example of this, look at how src/components/PriceChart.js is imported at the top of App.js and included in the return statement like this: <PriceChart />.

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


    Congratulations! 

    Now you are up and running with your clone of URDEX. As deployer you can execute swaps and watch the DEX work. 

    The TOKEN FAUCET has not been addressed. It can be removed for developers looking to expand on this base toward deployment on an actual blockchain, or if you want to keep it you'll need to clone it by following the link below. 

    The Token Faucet can be removed from URDEX by removing the button and link. Token Faucet is a completely separate APP. 

    ***Remember if you navigate to MY token faucet, the TK1 and TK2 addresses will not match your TK1 and TK2 deployment addresses. You will need to deploy your own Token Faucet for your addresses. Feel free to use my Token Faucet and URDEX to try things out.***

    To clone and include the Token Faucet in your model, follow this link: https://github.com/memery1446/TokenFaucet

            \\\\\\\\\\\\\\\\\\\                                  ///////////////////
                                <<< END OF STEP-BY-STEP GUIDE >>
            ///////////////////                                  \\\\\\\\\\\\\\\\\\\

7. ARCHITECTURE AT A GLANCE

    Sections 7-10 offer a survey of URDEX. More in-depth information is available after the testing section. 

    URDEX implements a route aggregation pattern where:

        - The main contract queries prices from connected AMMs
        - Compares output amounts for the same input
        - Routes the trade through the most efficient path
        - Maintains price history for analysis

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

    FRONTEND
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

10. RUNNING TESTS
        To run tests, 

        => =>   IN YOUR TERMINAL RUN: `npx hardhat test`   <= <=

        That will run all tests. 

        To run only a particular test,  

        => =>   IN YOUR TERMINAL RUN: `npx hardhat test test/<test-name>.js`    <= <=

11. TESTING 
Tests:
    DexSystem
    DexAggregator
    Token
    AMM
    AMM2
    Attacker

Frontend:
    AccountVerify
    ConnectionTest
    ContractDebug
    NetworkTest
    StateMonitor
    WalletDebug

Let's take a look at the backend tests (using additional front end components was covered earlier). 

Core Test Structure:
        Multiple test suites (AMM.js, AMM2.js, Attacker.js, DexAggregator.js) work together to verify the entire DEX system, using Hardhat's loadFixture pattern to reset state between tests, ensuring test isolation and consistent starting conditions.

            GOAL: Prevent test interdependencies and state pollution that could lead to false positives/negatives.
   
AMM Contract Tests:
       Deployment Tests verify token addresses are set correctly because incorrect token addresses would break all swap functionality. Initial reserves are checked for a balance of zero because starting with non-zero reserves could mask later calculation errors.

            GOAL: Ensure the basic contract setup is correct before testing more complex functionality

Liquidity Tests:
        Tracking both token transfers and LP token minting allows for testing the liquidity provision (LP). Next balances are verified because incorrect LP token accounting could lead to unfair liquidity removal.
      
            GOAL: Prevent maipulation with proper liquidity tracking, crucial for maintaining fair token exchange rates. 

Price Calculation Tests:
        By comparing input to output ratios, we can validate that all output amounts include the 0.3% fee. Also, larger trades should have proportionally larger impact so that is well-tested.

            GOAL: Prevent arbitrage and maintain economic security with accurate price calculation.

AMM2 Contract Tests:
        Implementing different fee structures (0.5%) allows for testing how varying fees affect arbitrage opportunities. Reserve limits help avoid the scenario of very large trades impacting price drastically. 

            GOAL: Differentiate AMM implementations to help prevent single points of failure and provide price competition.

Attacker Contract Tests:
        Deployment Tests verify correct token setup and initial count state, esuring that the attack contract can't be initialized in an advantageous state. 

            GOAL: Protect the Attacker contract from misuse. 

        Attack Attempts test recursive call limits (max 5) to prevent infinite loops and verify count tracking accuracy to ensure attack detection works.

            GOAL: Protect against common DeFi attack vectors like reentrancy and flash loan attacks.

DEX Aggregator Integration Tests:
Cross-Contract Liquidity:
        URDEX Tests reserve consistency across multiple AMMs after operations and handles simultaneous liquidity changes to prevent race conditions.

            GOAL: Make sure the Aggregator maintains an accurate view of all AMM states to route trades optimally.

Price Impact and Routing:
        URDEX Routes large trades through AMM with better liquidity to minimize price impact. It also handles price divergence between AMMs to ensure best execution.

            GOAL: Maximize user value and maintain market efficiency with optimal routing.

Attack Resistance:
        Resistance to sandwich attacks is tested by verifying they will result in losses. Meanwhile, diminishing returns on arbitrage discourages such manipulation.

            GOAL: Make economic security paramount. 

Market Dynamics Tests:
        Simulating high volume trading periods helps to verify system stability. It's important to test price efficiency during volatility to ensure fair pricing.

            GOAL: Make sure the system can stay stable and fair under stress. 

System Reliability Tests:
        URDEX handles multiple concurrent quotes to prevent race conditions and maintains quote accuracy during high traffic to ensure fair execution.

            GOAL: More testing for reliability under realistic loads.

Edge Cases and Critical Scenarios:
        Rounding errors are avoided with decimal precision handling so we test for that. Next we verify the reserve stability under trading pressure.

            GOAL: Use edge cases to look for subtle bugs that could be exploited.

The URDEX test suite demonstrates a comprehensive approach to validating both individual components and their interactions, with particular attention to security, efficiency, and reliability under various market conditions. Each test category builds upon the previous ones, creating a layered verification of the system's integrity. 

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

        Contact me:  markemerydev@gmail.com 
