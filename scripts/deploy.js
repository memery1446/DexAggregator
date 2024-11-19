// deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  try {
    // Deploy TK1
    console.log("\nDeploying TK1...");
    const Token = await ethers.getContractFactory("Token");
    const tk1 = await Token.deploy("Token1", "TK1");
    await tk1.deployed();
    console.log("TK1 deployed to:", tk1.address);

    // Deploy TK2
    console.log("\nDeploying TK2...");
    const tk2 = await Token.deploy("Token2", "TK2");
    await tk2.deployed();
    console.log("TK2 deployed to:", tk2.address);

    // Deploy AMM
    console.log("\nDeploying AMM...");
    const AMM = await ethers.getContractFactory("AMM");
    const amm = await AMM.deploy(tk1.address, tk2.address);
    await amm.deployed();
    console.log("AMM deployed to:", amm.address);

    // Deploy AMM2
    console.log("\nDeploying AMM2...");
    const AMM2 = await ethers.getContractFactory("AMM2");
    const amm2 = await AMM2.deploy(tk1.address, tk2.address);
    await amm2.deployed();
    console.log("AMM2 deployed to:", amm2.address);

    // Deploy DexAggregator
    console.log("\nDeploying DexAggregator...");
    const DexAggregator = await ethers.getContractFactory("DexAggregator");
    const dexAggregator = await DexAggregator.deploy(amm.address, amm2.address);
    await dexAggregator.deployed();
    console.log("DexAggregator deployed to:", dexAggregator.address);

    // Initialize liquidity pools
    console.log("\nInitializing liquidity pools...");
    const initLiquidityAmount = ethers.utils.parseEther("1000");
    
    // Mint tokens to deployer for initial liquidity
    await tk1.mint(deployer.address, initLiquidityAmount.mul(2));
    await tk2.mint(deployer.address, initLiquidityAmount.mul(2));

    // Approve AMMs to spend tokens
    await tk1.approve(amm.address, initLiquidityAmount);
    await tk2.approve(amm.address, initLiquidityAmount);
    await tk1.approve(amm2.address, initLiquidityAmount);
    await tk2.approve(amm2.address, initLiquidityAmount);

    // Add initial liquidity
    await amm.addLiquidity(initLiquidityAmount, initLiquidityAmount);
    await amm2.addLiquidity(initLiquidityAmount, initLiquidityAmount);
    console.log("Initial liquidity added to both AMMs");

    // Save deployment addresses
    const deploymentInfo = {
      network: network.name,
      tk1: tk1.address,
      tk2: tk2.address,
      amm: amm.address,
      amm2: amm2.address,
      dexAggregator: dexAggregator.address,
      timestamp: new Date().toISOString()
    };

 
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save deployment info to JSON file
    fs.writeFileSync(
      path.join(deploymentsDir, `${network.name}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment complete! Addresses saved to deployments/", network.name, ".json");
    
    // Verify contracts on Etherscan if not on hardhat network
    if (network.name !== "hardhat") {
      console.log("\nVerifying contracts on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: tk1.address,
          constructorArguments: ["Token1", "TK1"]
        });
        await hre.run("verify:verify", {
          address: tk2.address,
          constructorArguments: ["Token2", "TK2"]
        });
        await hre.run("verify:verify", {
          address: amm.address,
          constructorArguments: [tk1.address, tk2.address]
        });
        await hre.run("verify:verify", {
          address: amm2.address,
          constructorArguments: [tk1.address, tk2.address]
        });
        await hre.run("verify:verify", {
          address: dexAggregator.address,
          constructorArguments: [amm.address, amm2.address]
        });
        console.log("Contract verification complete!");
      } catch (error) {
        console.error("Error verifying contracts:", error);
      }
    }
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  