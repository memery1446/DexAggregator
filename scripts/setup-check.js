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

  try {
    // Get contract factories
    console.log("\nGetting contract factories...");
    const Token = await ethers.getContractFactory("Token");
    const AMM = await ethers.getContractFactory("AMM");
    const AMM2 = await ethers.getContractFactory("AMM2");
    const DexAggregator = await ethers.getContractFactory("DexAggregator");

    // Attach to deployed contracts
    console.log("\nAttaching to deployed contracts...");
    const tk1 = await Token.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const tk2 = await Token.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const amm1 = await AMM.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    const amm2 = await AMM2.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    const dexAggregator = await DexAggregator.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

    // Check Token Information
    console.log("\nToken Information:");
    const [name1, symbol1, decimals1] = await Promise.all([
      tk1.name(),
      tk1.symbol(),
      tk1.decimals()
    ]);
    console.log("TK1:");
    console.log("  Name:", name1);
    console.log("  Symbol:", symbol1);
    console.log("  Decimals:", decimals1);

    const [name2, symbol2, decimals2] = await Promise.all([
      tk2.name(),
      tk2.symbol(),
      tk2.decimals()
    ]);
    console.log("\nTK2:");
    console.log("  Name:", name2);
    console.log("  Symbol:", symbol2);
    console.log("  Decimals:", decimals2);

    // Check Token Balances
    console.log("\nToken Balances for", accounts[0].address);
    const balance1 = await tk1.balanceOf(accounts[0].address);
    const balance2 = await tk2.balanceOf(accounts[0].address);
    console.log("  TK1:", ethers.utils.formatUnits(balance1, 18));
    console.log("  TK2:", ethers.utils.formatUnits(balance2, 18));

    // Check AMM1 Status
    console.log("\nAMM1 Status:");
    const [amm1ReserveA, amm1ReserveB] = await Promise.all([
      amm1.reserveA(),
      amm1.reserveB()
    ]);
    console.log("  Reserve A:", ethers.utils.formatUnits(amm1ReserveA, 18));
    console.log("  Reserve B:", ethers.utils.formatUnits(amm1ReserveB, 18));

    // Check AMM2 Status
    console.log("\nAMM2 Status:");
    const [amm2ReserveA, amm2ReserveB] = await Promise.all([
      amm2.reserveA(),
      amm2.reserveB()
    ]);
    console.log("  Reserve A:", ethers.utils.formatUnits(amm2ReserveA, 18));
    console.log("  Reserve B:", ethers.utils.formatUnits(amm2ReserveB, 18));

    // Check DEX Aggregator
    console.log("\nDEX Aggregator Status:");
    const [aggAmm1ReserveA, aggAmm1ReserveB, aggAmm2ReserveA, aggAmm2ReserveB] = await dexAggregator.getReserves();
    console.log("AMM1 Reserves from Aggregator:");
    console.log("  Reserve A:", ethers.utils.formatUnits(aggAmm1ReserveA, 18));
    console.log("  Reserve B:", ethers.utils.formatUnits(aggAmm1ReserveB, 18));
    console.log("AMM2 Reserves from Aggregator:");
    console.log("  Reserve A:", ethers.utils.formatUnits(aggAmm2ReserveA, 18));
    console.log("  Reserve B:", ethers.utils.formatUnits(aggAmm2ReserveB, 18));

    // Test quote functionality
    console.log("\nTesting quote functionality:");
    const testAmount = ethers.utils.parseUnits("1", 18);
    const [bestAMM, bestOutput] = await dexAggregator.getBestQuote(testAmount, true);
    console.log("Quote for 1 TK1:");
    console.log("  Best AMM:", bestAMM);
    console.log("  Expected Output:", ethers.utils.formatUnits(bestOutput, 18), "TK2");

    console.log("\n=== Setup Check Complete ===");
    console.log("\nAll contracts verified and accessible!");
    
    // Print all contract addresses for reference
    console.log("\nContract Addresses:");
    console.log("TK1:", tk1.address);
    console.log("TK2:", tk2.address);
    console.log("AMM1:", amm1.address);
    console.log("AMM2:", amm2.address);
    console.log("DexAggregator:", dexAggregator.address);

  } catch (error) {
    console.error("\n!!! Setup Check Failed !!!");
    console.error("Error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  
