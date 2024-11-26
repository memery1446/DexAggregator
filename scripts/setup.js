const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== Initializing AMM System ===\n");

  const ADDRESSES = {
    TK1: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    TK2: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    AMM1: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    AMM2: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  };

  try {
    // Get contract factories
    const Token = await ethers.getContractFactory("Token");
    const tk1 = Token.attach(ADDRESSES.TK1);
    const tk2 = Token.attach(ADDRESSES.TK2);

    const [signer] = await ethers.getSigners();
    console.log("Initializing for address:", signer.address);

    const initAmount = ethers.utils.parseEther("2000"); // 2000 tokens for safety margin
    
    // Step 1: Mint tokens
    console.log("\nMinting initial tokens...");
    try {
      await tk1.mint(signer.address, initAmount);
      await tk2.mint(signer.address, initAmount);
      console.log("✓ Tokens minted successfully");
    } catch (error) {
      console.error("Failed to mint tokens:", error.message);
      return;
    }

    // Step 2: Approve AMMs
    console.log("\nApproving AMMs to spend tokens...");
    try {
      await tk1.approve(ADDRESSES.AMM1, initAmount);
      await tk2.approve(ADDRESSES.AMM1, initAmount);
      await tk1.approve(ADDRESSES.AMM2, initAmount);
      await tk2.approve(ADDRESSES.AMM2, initAmount);
      console.log("✓ AMMs approved successfully");
    } catch (error) {
      console.error("Failed to approve AMMs:", error.message);
      return;
    }

    // Step 3: Verify setup
    console.log("\nVerifying setup...");
    const balance1 = await tk1.balanceOf(signer.address);
    const balance2 = await tk2.balanceOf(signer.address);
    
    console.log("\nToken Balances:");
    console.log("TK1:", ethers.utils.formatEther(balance1));
    console.log("TK2:", ethers.utils.formatEther(balance2));
    
    const allowance1AMM1 = await tk1.allowance(signer.address, ADDRESSES.AMM1);
    const allowance2AMM1 = await tk2.allowance(signer.address, ADDRESSES.AMM1);
    const allowance1AMM2 = await tk1.allowance(signer.address, ADDRESSES.AMM2);
    const allowance2AMM2 = await tk2.allowance(signer.address, ADDRESSES.AMM2);

    console.log("\nAMM Allowances:");
    console.log("AMM1 - TK1:", ethers.utils.formatEther(allowance1AMM1));
    console.log("AMM1 - TK2:", ethers.utils.formatEther(allowance2AMM1));
    console.log("AMM2 - TK1:", ethers.utils.formatEther(allowance1AMM2));
    console.log("AMM2 - TK2:", ethers.utils.formatEther(allowance2AMM2));

    console.log("\n✓ Initialization complete! You can now run add-liquidity.js");

  } catch (error) {
    console.error("\nInitialization failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  