const { ethers } = require("hardhat");

async function main() {
 console.log("\n=== Starting Complete Setup Check ===\n");

 // Get accounts
 const accounts = await ethers.getSigners();
 console.log("Testing with account:", accounts[0].address);

 // Check network
 const network = await ethers.provider.getNetwork();
 console.log("\nNetwork Information:");
 console.log("  Name:", network.name);
 console.log("  Chain ID:", network.chainId);

 // Define all Sepolia addresses
 const ADDRESSES = {
   TK1: "0x83948078E863965393309B4E9e2C112F91f9fB14",
   TK2: "0xd95E02893187B054dFCb7FAC0862420f727CA484",
   AMM1: "0xe063B33FE970f74649Fa9e3562d7E293351b6c50", 
   AMM2: "0xa09443f7F3F8594f14906Ada11bC2a68fE3A97A8",
   DEX_AGGREGATOR: "0x38fDC0538085E1E2c3046e934ceb3C2a1966472C"
 };

 try {
   // First verify all contract deployments
   console.log("\nVerifying contract deployments...");
   for (const [name, address] of Object.entries(ADDRESSES)) {
     const code = await ethers.provider.getCode(address);
     if (code === '0x') {
       console.log(`❌ ${name} not deployed at ${address}`);
     } else {
       console.log(`✓ ${name} deployed at ${address}`);
     }
   }

   // Get contract factories
   console.log("\nGetting contract factories...");
   const Token = await ethers.getContractFactory("Token");
   const AMM = await ethers.getContractFactory("AMM");
   const AMM2 = await ethers.getContractFactory("AMM2");
   const DexAggregator = await ethers.getContractFactory("DexAggregator");

   // Attach to tokens
   console.log("\nChecking Token Information:");
   const tk1 = await Token.attach(ADDRESSES.TK1);
   const tk2 = await Token.attach(ADDRESSES.TK2);

   const [name1, symbol1, decimals1, totalSupply1] = await Promise.all([
     tk1.name(),
     tk1.symbol(),
     tk1.decimals(),
     tk1.totalSupply()
   ]);
   console.log("\nTK1:");
   console.log("  Name:", name1);
   console.log("  Symbol:", symbol1);
   console.log("  Decimals:", decimals1);
   console.log("  Total Supply:", ethers.utils.formatUnits(totalSupply1, decimals1));

   const [name2, symbol2, decimals2, totalSupply2] = await Promise.all([
     tk2.name(),
     tk2.symbol(),
     tk2.decimals(),
     tk2.totalSupply()
   ]);
   console.log("\nTK2:");
   console.log("  Name:", name2);
   console.log("  Symbol:", symbol2);
   console.log("  Decimals:", decimals2);
   console.log("  Total Supply:", ethers.utils.formatUnits(totalSupply2, decimals2));

   // Check balances
   console.log("\nToken Balances for", accounts[0].address);
   const balance1 = await tk1.balanceOf(accounts[0].address);
   const balance2 = await tk2.balanceOf(accounts[0].address);
   console.log("  TK1:", ethers.utils.formatUnits(balance1, decimals1));
   console.log("  TK2:", ethers.utils.formatUnits(balance2, decimals2));

   // Check AMMs
   console.log("\nChecking AMM Statuses:");
   const amm1 = await AMM.attach(ADDRESSES.AMM1);
   const amm2 = await AMM2.attach(ADDRESSES.AMM2);

   // Check AMM1
   try {
     const [amm1ReserveA, amm1ReserveB] = await Promise.all([
       amm1.reserveA(),
       amm1.reserveB()
     ]);
     console.log("\nAMM1 Reserves:");
     console.log("  Token A:", ethers.utils.formatUnits(amm1ReserveA, decimals1));
     console.log("  Token B:", ethers.utils.formatUnits(amm1ReserveB, decimals2));
   } catch (error) {
     console.log("Error checking AMM1:", error.message);
   }

   // Check AMM2
   try {
     const [amm2ReserveA, amm2ReserveB] = await Promise.all([
       amm2.reserveA(),
       amm2.reserveB()
     ]);
     console.log("\nAMM2 Reserves:");
     console.log("  Token A:", ethers.utils.formatUnits(amm2ReserveA, decimals1));
     console.log("  Token B:", ethers.utils.formatUnits(amm2ReserveB, decimals2));
   } catch (error) {
     console.log("Error checking AMM2:", error.message);
   }

   // Check DexAggregator 
   console.log("\nChecking DexAggregator:");
   const dexAggregator = await DexAggregator.attach(ADDRESSES.DEX_AGGREGATOR);

   try {
     // Test quote
     const testAmount = ethers.utils.parseUnits("1", decimals1);
     const [bestAMM, bestOutput] = await dexAggregator.getBestQuote(testAmount, true);
     console.log("\nTest Quote (1 TK1):");
     console.log("  Best AMM:", bestAMM);
     console.log("  Expected Output:", ethers.utils.formatUnits(bestOutput, decimals2), "TK2");

     // Get reserves from aggregator
     const [aggAmm1ReserveA, aggAmm1ReserveB, aggAmm2ReserveA, aggAmm2ReserveB] = 
       await dexAggregator.getReserves();
     console.log("\nReserves from Aggregator:");
     console.log("AMM1:");
     console.log("  Reserve A:", ethers.utils.formatUnits(aggAmm1ReserveA, decimals1));
     console.log("  Reserve B:", ethers.utils.formatUnits(aggAmm1ReserveB, decimals2));
     console.log("AMM2:");
     console.log("  Reserve A:", ethers.utils.formatUnits(aggAmm2ReserveA, decimals1));
     console.log("  Reserve B:", ethers.utils.formatUnits(aggAmm2ReserveB, decimals2));
   } catch (error) {
     console.log("Error checking DexAggregator:", error.message);
   }

   // Print all addresses for reference
   console.log("\nContract Addresses:");
   for (const [name, address] of Object.entries(ADDRESSES)) {
     console.log(`${name}: ${address}`);
   }

   console.log("\n=== Setup Check Complete ===");

 } catch (error) {
   console.log("\n!!! Setup Check Failed !!!");
   console.error("Error:", error);
 }
}

main()
 .then(() => process.exit(0))
 .catch((error) => {
   console.error(error);
   process.exit(1);
 });
 