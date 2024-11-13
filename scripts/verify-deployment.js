const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== Verifying Deployment and Initial Setup ===\n");

  const ADDRESSES = {
    TK1: "0x83948078E863965393309B4E9e2C112F91f9fB14",
    TK2: "0xd95E02893187B054dFCb7FAC0862420f727CA484",
    AMM1: "0xe063B33FE970f74649Fa9e3562d7E293351b6c50",
    AMM2: "0xa09443f7F3F8594f14906Ada11bC2a68fE3A97A8",
    DEX_AGGREGATOR: "0x38fDC0538085E1E2c3046e934ceb3C2a1966472C"
  };

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Checking with account:", deployer.address);

    // Get contract factories
    const Token = await ethers.getContractFactory("Token");
    const AMM = await ethers.getContractFactory("AMM");
    const AMM2 = await ethers.getContractFactory("AMM2");
    const DexAggregator = await ethers.getContractFactory("DexAggregator");

    // Attach to contracts
    const tk1 = await Token.attach(ADDRESSES.TK1);
    const tk2 = await Token.attach(ADDRESSES.TK2);
    const amm1 = await AMM.attach(ADDRESSES.AMM1);
    const amm2 = await AMM2.attach(ADDRESSES.AMM2);
    const dexAgg = await DexAggregator.attach(ADDRESSES.DEX_AGGREGATOR);

    // Verify contract configurations
    console.log("\nVerifying contract configurations:");
    
    // Check AMM token addresses
    const amm1TokenA = await amm1.tokenA();
    const amm1TokenB = await amm1.tokenB();
    console.log("\nAMM1 Token Configuration:");
    console.log("  TokenA:", amm1TokenA === ADDRESSES.TK1 ? "✓ Correct" : "❌ Incorrect");
    console.log("  TokenB:", amm1TokenB === ADDRESSES.TK2 ? "✓ Correct" : "❌ Incorrect");

    const amm2TokenA = await amm2.tokenA();
    const amm2TokenB = await amm2.tokenB();
    console.log("\nAMM2 Token Configuration:");
    console.log("  TokenA:", amm2TokenA === ADDRESSES.TK1 ? "✓ Correct" : "❌ Incorrect");
    console.log("  TokenB:", amm2TokenB === ADDRESSES.TK2 ? "✓ Correct" : "❌ Incorrect");

    // Check DexAggregator AMM addresses
    const dexAmm1 = await dexAgg.amm1();
    const dexAmm2 = await dexAgg.amm2();
    console.log("\nDexAggregator Configuration:");
    console.log("  AMM1:", dexAmm1 === ADDRESSES.AMM1 ? "✓ Correct" : "❌ Incorrect");
    console.log("  AMM2:", dexAmm2 === ADDRESSES.AMM2 ? "✓ Correct" : "❌ Incorrect");

    // Check liquidity
    console.log("\nChecking Liquidity:");
    
    const [amm1ReserveA, amm1ReserveB] = await Promise.all([
      amm1.reserveA(),
      amm1.reserveB()
    ]);
    console.log("\nAMM1 Reserves:");
    console.log("  Token A:", ethers.utils.formatEther(amm1ReserveA));
    console.log("  Token B:", ethers.utils.formatEther(amm1ReserveB));

    const [amm2ReserveA, amm2ReserveB] = await Promise.all([
      amm2.reserveA(),
      amm2.reserveB()
    ]);
    console.log("\nAMM2 Reserves:");
    console.log("  Token A:", ethers.utils.formatEther(amm2ReserveA));
    console.log("  Token B:", ethers.utils.formatEther(amm2ReserveB));

    if (amm1ReserveA.isZero() && amm1ReserveB.isZero() && 
        amm2ReserveA.isZero() && amm2ReserveB.isZero()) {
      console.log("\n⚠️  No liquidity found in either AMM!");
      console.log("Would you like to redeploy or add liquidity now?");
    }

  } catch (error) {
    console.error("\nVerification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  