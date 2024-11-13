const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AMM2 Contract", function () {
  async function deployAMM2Fixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy tokens
    const Token = await ethers.getContractFactory("Token");
    const tokenA = await Token.deploy("TokenA", "TA");
    const tokenB = await Token.deploy("TokenB", "TB");
    
    // Deploy AMM2
    const AMM2 = await ethers.getContractFactory("AMM2");
    const amm2 = await AMM2.deploy(tokenA.address, tokenB.address);

    // Mint some tokens to owner for testing
    const mintAmount = ethers.utils.parseEther("1000000");
    await tokenA.mint(owner.address, mintAmount);
    await tokenB.mint(owner.address, mintAmount);

    return { amm2, tokenA, tokenB, owner, addr1, addr2, mintAmount };
  }

  describe("Deployment", () => {
    it("Should set the right token addresses", async () => {
      const { amm2, tokenA, tokenB } = await loadFixture(deployAMM2Fixture);
      expect(await amm2.tokenA()).to.equal(tokenA.address);
      expect(await amm2.tokenB()).to.equal(tokenB.address);
    });

    it("Should start with empty reserves", async () => {
      const { amm2 } = await loadFixture(deployAMM2Fixture);
      expect(await amm2.reserveA()).to.equal(0);
      expect(await amm2.reserveB()).to.equal(0);
    });
  });

  describe("Liquidity", () => {
    it("Should allow initial liquidity provision", async () => {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.approve(amm2.address, amountA);
      await tokenB.approve(amm2.address, amountB);

      const tx = await amm2.addLiquidity(amountA, amountB);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'LiquidityAdded');
      expect(event.args.provider).to.equal(owner.address);
      expect(event.args.amountA).to.equal(amountA);
      expect(event.args.amountB).to.equal(amountB);
      expect(event.args.lpTokens).to.be.gt(0);

      expect(await amm2.reserveA()).to.equal(amountA);
      expect(await amm2.reserveB()).to.equal(amountB);
    });

    it("Should track LP tokens correctly", async () => {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.approve(amm2.address, amountA);
      await tokenB.approve(amm2.address, amountB);
      
      await amm2.addLiquidity(amountA, amountB);
      
      const lpBalance = await amm2.lpBalances(owner.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("Should fail when adding zero liquidity", async () => {
      const { amm2 } = await loadFixture(deployAMM2Fixture);
      await expect(
        amm2.addLiquidity(0, 0)
      ).to.be.revertedWith("Insufficient liquidity amounts");
    });

    it("Should fail without token approval", async () => {
      const { amm2 } = await loadFixture(deployAMM2Fixture);
      const amount = ethers.utils.parseEther("100");
      
      await expect(
        amm2.addLiquidity(amount, amount)
      ).to.be.reverted;
    });
  });

  describe("Price Calculation", () => {
    it("Should calculate correct output amount with 0.5% fee", async () => {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      const initialAmount = ethers.utils.parseEther("1000");
      await tokenA.approve(amm2.address, initialAmount);
      await tokenB.approve(amm2.address, initialAmount);
      await amm2.addLiquidity(initialAmount, initialAmount);

      const amountIn = ethers.utils.parseEther("1");
      const amountOut = await amm2.getAmountOut(amountIn, initialAmount, initialAmount);
      
      expect(amountOut).to.be.lt(amountIn);
      const expectedApprox = amountIn.mul(995).div(1000);
      const tolerance = amountIn.div(100);
      expect(amountOut).to.be.closeTo(expectedApprox, tolerance);
    });
  });

  describe("Swap Limits", () => {
    it("Should fail when swap amount exceeds reserve limit", async () => {
      const { amm2, tokenA, tokenB, owner, addr1 } = await loadFixture(deployAMM2Fixture);
      
      // Add liquidity
      const liquidityAmount = ethers.utils.parseEther("1");
      await tokenA.approve(amm2.address, liquidityAmount);
      await tokenB.approve(amm2.address, liquidityAmount);
      await amm2.addLiquidity(liquidityAmount, liquidityAmount);

      // Try to swap amount larger than 2x reserves
      const largeAmount = ethers.utils.parseEther("3");
      await tokenA.transfer(addr1.address, largeAmount);
      await tokenA.connect(addr1).approve(amm2.address, largeAmount);

      await expect(
        amm2.connect(addr1).swap(largeAmount, true)
      ).to.be.revertedWith("Swap amount too large");
    });

    it("Should allow swaps up to reserve limit", async () => {
      const { amm2, tokenA, tokenB, owner, addr1 } = await loadFixture(deployAMM2Fixture);
      
      // Add liquidity
      const liquidityAmount = ethers.utils.parseEther("1");
      await tokenA.approve(amm2.address, liquidityAmount);
      await tokenB.approve(amm2.address, liquidityAmount);
      await amm2.addLiquidity(liquidityAmount, liquidityAmount);

      // Swap amount equal to reserves should work
      const validAmount = ethers.utils.parseEther("1");
      await tokenA.transfer(addr1.address, validAmount);
      await tokenA.connect(addr1).approve(amm2.address, validAmount);

      // This should not revert
      await expect(
        amm2.connect(addr1).swap(validAmount, true)
      ).to.not.be.reverted;
    });
  });

  describe("AMM2 Specific Behaviors", () => {
    it("Should provide different output than AMM1 for same input", async () => {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      
      const AMM = await ethers.getContractFactory("AMM");
      const amm1 = await AMM.deploy(tokenA.address, tokenB.address);

      const initialAmount = ethers.utils.parseEther("1000");
      await tokenA.approve(amm2.address, initialAmount);
      await tokenB.approve(amm2.address, initialAmount);
      await amm2.addLiquidity(initialAmount, initialAmount);

      await tokenA.approve(amm1.address, initialAmount);
      await tokenB.approve(amm1.address, initialAmount);
      await amm1.addLiquidity(initialAmount, initialAmount);

      const testAmount = ethers.utils.parseEther("1");
      const quote1 = await amm1.getAmountOut(testAmount, initialAmount, initialAmount);
      const quote2 = await amm2.getAmountOut(testAmount, initialAmount, initialAmount);

      expect(quote2).to.be.lt(quote1);
    });

    it("Should maintain reserves correctly after multiple swaps", async () => {
      const { amm2, tokenA, tokenB, owner, addr1 } = await loadFixture(deployAMM2Fixture);
      
      const initialAmount = ethers.utils.parseEther("1000");
      await tokenA.approve(amm2.address, initialAmount);
      await tokenB.approve(amm2.address, initialAmount);
      await amm2.addLiquidity(initialAmount, initialAmount);

      const swapAmount = ethers.utils.parseEther("1");
      await tokenA.transfer(addr1.address, swapAmount.mul(3));
      await tokenA.connect(addr1).approve(amm2.address, swapAmount.mul(3));

      for(let i = 0; i < 3; i++) {
        await amm2.connect(addr1).swap(swapAmount, true);
      }

      const reserveA = await amm2.reserveA();
      const reserveB = await amm2.reserveB();
      expect(reserveA).to.be.gt(initialAmount);
      expect(reserveB).to.be.lt(initialAmount);
    });

    it("Should handle large and small trades appropriately", async () => {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      
      const initialAmount = ethers.utils.parseEther("1000");
      await tokenA.approve(amm2.address, initialAmount);
      await tokenB.approve(amm2.address, initialAmount);
      await amm2.addLiquidity(initialAmount, initialAmount);

      const smallAmount = ethers.utils.parseEther("0.1");
      const smallOutput = await amm2.getAmountOut(smallAmount, initialAmount, initialAmount);
      
      const largeAmount = ethers.utils.parseEther("100");
      const largeOutput = await amm2.getAmountOut(largeAmount, initialAmount, initialAmount);

      const smallPrice = smallOutput.mul(ethers.utils.parseEther("1")).div(smallAmount);
      const largePrice = largeOutput.mul(ethers.utils.parseEther("1")).div(largeAmount);

      expect(largePrice).to.be.lt(smallPrice);
    });
    it("Should show different price impacts between AMMs", async () => {
    const { amm2, tokenA, tokenB } = await loadFixture(deployAMM2Fixture);
    const AMM = await ethers.getContractFactory("AMM");
    const amm1 = await AMM.deploy(tokenA.address, tokenB.address);

    // Add different liquidity amounts to each AMM
    const amm1Liquidity = ethers.utils.parseEther("100");
    const amm2Liquidity = ethers.utils.parseEther("50");

    // Setup AMM1
    await tokenA.approve(amm1.address, amm1Liquidity);
    await tokenB.approve(amm1.address, amm1Liquidity);
    await amm1.addLiquidity(amm1Liquidity, amm1Liquidity);

    // Setup AMM2
    await tokenA.approve(amm2.address, amm2Liquidity);
    await tokenB.approve(amm2.address, amm2Liquidity);
    await amm2.addLiquidity(amm2Liquidity, amm2Liquidity);

    // Test same swap amount on both
    const swapAmount = ethers.utils.parseEther("10");
    const output1 = await amm1.getAmountOut(swapAmount, amm1Liquidity, amm1Liquidity);
    const output2 = await amm2.getAmountOut(swapAmount, amm2Liquidity, amm2Liquidity);

    // AMM2 should have higher price impact due to lower liquidity
    const priceImpact1 = output1.mul(ethers.utils.parseEther("1")).div(swapAmount);
    const priceImpact2 = output2.mul(ethers.utils.parseEther("1")).div(swapAmount);
    expect(priceImpact2).to.be.lt(priceImpact1);
});
  });
});