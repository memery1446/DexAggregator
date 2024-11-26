const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== Adding Liquidity to AMMs ===\n");

  const ADDRESSES = {
    TK1: "0x83948078E863965393309B4E9e2C112F91f9fB14",
    TK2: "0xd95E02893187B054dFCb7FAC0862420f727CA484",
    AMM1: "0xe063B33FE970f74649Fa9e3562d7E293351b6c50",
    AMM2: "0xa09443f7F3F8594f14906Ada11bC2a68fE3A97A8"
  };

  try {
    // Get contract factories
    const AMM = await ethers.getContractFactory("AMM");
    const AMM2 = await ethers.getContractFactory("AMM2");
    const Token = await ethers.getContractFactory("Token");

    // Attach to contracts
    const amm1 = AMM.attach(ADDRESSES.AMM1);
    const amm2 = AMM2.attach(ADDRESSES.AMM2);
    const tk1 = Token.attach(ADDRESSES.TK1);
    const tk2 = Token.attach(ADDRESSES.TK2);

    const liquidityAmount = ethers.utils.parseEther("1000");

    // First approve AMM1
    console.log("Approving tokens for AMM1...");
    await tk1.approve(ADDRESSES.AMM1, liquidityAmount);
    await tk2.approve(ADDRESSES.AMM1, liquidityAmount);
    console.log("✓ AMM1 approved");

    // Add liquidity to AMM1
    console.log("\nAdding liquidity to AMM1...");
    try {
      await amm1.addLiquidity(liquidityAmount, liquidityAmount);
      console.log("✓ Liquidity added to AMM1");
    } catch (error) {
      console.error("Failed to add liquidity to AMM1:", error.message);
    }

    // Approve AMM2
    console.log("\nApproving tokens for AMM2...");
    await tk1.approve(ADDRESSES.AMM2, liquidityAmount);
    await tk2.approve(ADDRESSES.AMM2, liquidityAmount);
    console.log("✓ AMM2 approved");

    // Add liquidity to AMM2
    console.log("\nAdding liquidity to AMM2...");
    try {
      await amm2.addLiquidity(liquidityAmount, liquidityAmount);
      console.log("✓ Liquidity added to AMM2");
    } catch (error) {
      console.error("Failed to add liquidity to AMM2:", error.message);
    }

    // Verify the new liquidity
    console.log("\nVerifying new liquidity...");
    
    const [amm1ReserveA, amm1ReserveB] = await Promise.all([
      amm1.reserveA(),
      amm1.reserveB()
    ]);
    
    const [amm2ReserveA, amm2ReserveB] = await Promise.all([
      amm2.reserveA(),
      amm2.reserveB()
    ]);

    console.log("\nNew AMM1 Reserves:");
    console.log("  Token A:", ethers.utils.formatEther(amm1ReserveA));
    console.log("  Token B:", ethers.utils.formatEther(amm1ReserveB));
    
    console.log("\nNew AMM2 Reserves:");
    console.log("  Token A:", ethers.utils.formatEther(amm2ReserveA));
    console.log("  Token B:", ethers.utils.formatEther(amm2ReserveB));

  } catch (error) {
    console.error("\nError:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  