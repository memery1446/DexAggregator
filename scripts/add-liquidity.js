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
    // Get signer
    const [signer] = await ethers.getSigners();

    // Get contract factories
    const AMM = await ethers.getContractFactory("AMM");
    const AMM2 = await ethers.getContractFactory("AMM2");
    const Token = await ethers.getContractFactory("Token");

    // Attach to contracts
    const amm1 = AMM.attach(ADDRESSES.AMM1);
    const amm2 = AMM2.attach(ADDRESSES.AMM2);
    const tk1 = Token.attach(ADDRESSES.TK1);
    const tk2 = Token.attach(ADDRESSES.TK2);

    // Check initial balances
    const tk1Balance = await tk1.balanceOf(signer.address);
    const tk2Balance = await tk2.balanceOf(signer.address);
    console.log("Initial token balances:", {
      tk1: ethers.utils.formatEther(tk1Balance),
      tk2: ethers.utils.formatEther(tk2Balance)
    });

    const liquidityAmount = ethers.utils.parseEther("1000");

    // First approve AMM1
    console.log("\nApproving tokens for AMM1...");
    const approve1AMM1 = await tk1.approve(ADDRESSES.AMM1, liquidityAmount);
    await approve1AMM1.wait();
    const approve2AMM1 = await tk2.approve(ADDRESSES.AMM1, liquidityAmount);
    await approve2AMM1.wait();
    
    // Verify AMM1 allowances
    const amm1Allowance1 = await tk1.allowance(signer.address, ADDRESSES.AMM1);
    const amm1Allowance2 = await tk2.allowance(signer.address, ADDRESSES.AMM1);
    console.log("AMM1 Allowances after approval:", {
      tk1: ethers.utils.formatEther(amm1Allowance1),
      tk2: ethers.utils.formatEther(amm1Allowance2)
    });

    // Add liquidity to AMM1
    console.log("\nAdding liquidity to AMM1...");
    try {
      const addLiquidityAMM1 = await amm1.addLiquidity(liquidityAmount, liquidityAmount);
      await addLiquidityAMM1.wait();
      console.log("✓ Liquidity added to AMM1");
    } catch (error) {
      console.error("Failed to add liquidity to AMM1:", error.message);
    }

    // Approve AMM2
    console.log("\nApproving tokens for AMM2...");
    const approve1AMM2 = await tk1.approve(ADDRESSES.AMM2, liquidityAmount);
    await approve1AMM2.wait();
    const approve2AMM2 = await tk2.approve(ADDRESSES.AMM2, liquidityAmount);
    await approve2AMM2.wait();

    // Verify AMM2 allowances
    const amm2Allowance1 = await tk1.allowance(signer.address, ADDRESSES.AMM2);
    const amm2Allowance2 = await tk2.allowance(signer.address, ADDRESSES.AMM2);
    console.log("AMM2 Allowances after approval:", {
      tk1: ethers.utils.formatEther(amm2Allowance1),
      tk2: ethers.utils.formatEther(amm2Allowance2)
    });

    // Add liquidity to AMM2
    console.log("\nAdding liquidity to AMM2...");
    try {
      const addLiquidityAMM2 = await amm2.addLiquidity(liquidityAmount, liquidityAmount);
      await addLiquidityAMM2.wait();
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