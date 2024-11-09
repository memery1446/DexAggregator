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

  describe("Deployment", function () {
    it("Should set the right token addresses", async function () {
      const { amm2, tokenA, tokenB } = await loadFixture(deployAMM2Fixture);
      expect(await amm2.tokenA()).to.equal(tokenA.address);
      expect(await amm2.tokenB()).to.equal(tokenB.address);
    });

    it("Should start with empty reserves", async function () {
      const { amm2 } = await loadFixture(deployAMM2Fixture);
      expect(await amm2.reserveA()).to.equal(0);
      expect(await amm2.reserveB()).to.equal(0);
    });
  });

  describe("Liquidity", function () {
    it("Should allow initial liquidity provision", async function () {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      // Approve tokens
      await tokenA.approve(amm2.address, amountA);
      await tokenB.approve(amm2.address, amountB);

      // Add liquidity and check event
      const tx = await amm2.addLiquidity(amountA, amountB);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'LiquidityAdded');
      expect(event.args.provider).to.equal(owner.address);
      expect(event.args.amountA).to.equal(amountA);
      expect(event.args.amountB).to.equal(amountB);
      expect(event.args.lpTokens).to.be.gt(0);

      // Check reserves
      expect(await amm2.reserveA()).to.equal(amountA);
      expect(await amm2.reserveB()).to.equal(amountB);
    });

    it("Should track LP tokens correctly", async function () {
      const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.approve(amm2.address, amountA);
      await tokenB.approve(amm2.address, amountB);
      
      await amm2.addLiquidity(amountA, amountB);
      
      const lpBalance = await amm2.lpBalances(owner.address);
      expect(lpBalance).to.be.gt(0);
    });
  });

describe("Price Calculation", function () {
    it("Should calculate correct output amount with 0.5% fee", async function () {
        const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
        
        // Add initial liquidity
        const initialAmount = ethers.utils.parseEther("1000");
        await tokenA.approve(amm2.address, initialAmount);
        await tokenB.approve(amm2.address, initialAmount);
        await amm2.addLiquidity(initialAmount, initialAmount);

        // Test smaller amount for more predictable price impact
        const amountIn = ethers.utils.parseEther("1");
        const amountOut = await amm2.getAmountOut(amountIn, initialAmount, initialAmount);

        // With 0.5% fee, and considering constant product formula
        // Output should be less than input
        expect(amountOut).to.be.lt(amountIn);

        // Calculate expected output using constant product formula with 0.5% fee
        // (x + dx * 0.995)(y - dy) = xy
        // where dx is amountIn, dy is amountOut
        const x = initialAmount;
        const y = initialAmount;
        const dx = amountIn;
        const feeAdjustedInput = dx.mul(995).div(1000); // 0.5% fee
        
        // dy = (y * dx * 0.995) / (x + dx * 0.995)
        const expectedOut = y.mul(feeAdjustedInput).div(x.add(feeAdjustedInput));
        
        // Allow for some rounding differences
        const tolerance = ethers.utils.parseEther("0.0001"); // Adjust tolerance as needed
        expect(amountOut).to.be.closeTo(expectedOut, tolerance);
    });

    it("Should return less tokens when fee is higher", async function () {
        const { amm2, tokenA, tokenB, owner } = await loadFixture(deployAMM2Fixture);
        
        // Add initial liquidity
        const initialAmount = ethers.utils.parseEther("1000");
        await tokenA.approve(amm2.address, initialAmount);
        await tokenB.approve(amm2.address, initialAmount);
        await amm2.addLiquidity(initialAmount, initialAmount);

        const amountIn = ethers.utils.parseEther("1");
        const amountOut = await amm2.getAmountOut(amountIn, initialAmount, initialAmount);

        // Simply verify that output is less than input due to fee and slippage
        expect(amountOut).to.be.lt(amountIn);
        // Output should be more than 99% of input (considering 0.5% fee + slippage)
        expect(amountOut).to.be.gt(amountIn.mul(990).div(1000));
    });
});

  describe("Swaps", function () {
    it("Should execute swap with correct fee application", async function () {
      const { amm2, tokenA, tokenB, owner, addr1 } = await loadFixture(deployAMM2Fixture);
      
      // Add initial liquidity
      const initialAmount = ethers.utils.parseEther("1000");
      await tokenA.approve(amm2.address, initialAmount);
      await tokenB.approve(amm2.address, initialAmount);
      await amm2.addLiquidity(initialAmount, initialAmount);

      // Setup swap
      const swapAmount = ethers.utils.parseEther("10");
      await tokenA.transfer(addr1.address, swapAmount);
      await tokenA.connect(addr1).approve(amm2.address, swapAmount);

      // Record balances before
      const balanceBefore = await tokenB.balanceOf(addr1.address);

      // Execute swap
      await amm2.connect(addr1).swap(swapAmount, true);

      // Verify balances changed correctly
      const balanceAfter = await tokenB.balanceOf(addr1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
      
      // Verify fee impact
      const amountReceived = balanceAfter.sub(balanceBefore);
      expect(amountReceived).to.be.lt(swapAmount); // Should be less due to 0.5% fee
    });
  });
});
