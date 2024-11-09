const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AMM Contract", function () {
  async function deployAMMFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy tokens
    const Token = await ethers.getContractFactory("Token");
    const tokenA = await Token.deploy("TokenA", "TA");
    const tokenB = await Token.deploy("TokenB", "TB");
    
    // Deploy AMM
    const AMM = await ethers.getContractFactory("AMM");
    const amm = await AMM.deploy(tokenA.address, tokenB.address);

    // Mint some tokens to owner for testing
    const mintAmount = ethers.utils.parseEther("1000000");
    await tokenA.mint(owner.address, mintAmount);
    await tokenB.mint(owner.address, mintAmount);

    return { amm, tokenA, tokenB, owner, addr1, addr2, mintAmount };
  }

  describe("Deployment", function () {
    it("Should set the right token addresses", async function () {
      const { amm, tokenA, tokenB } = await loadFixture(deployAMMFixture);
      expect(await amm.tokenA()).to.equal(tokenA.address);
      expect(await amm.tokenB()).to.equal(tokenB.address);
    });

    it("Should start with empty reserves", async function () {
      const { amm } = await loadFixture(deployAMMFixture);
      expect(await amm.reserveA()).to.equal(0);
      expect(await amm.reserveB()).to.equal(0);
    });
  });

  describe("Liquidity", function () {
    it("Should allow initial liquidity provision", async function () {
      const { amm, tokenA, tokenB, owner } = await loadFixture(deployAMMFixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      // Approve tokens
      await tokenA.approve(amm.address, amountA);
      await tokenB.approve(amm.address, amountB);

      // Add liquidity and check event
      const tx = await amm.addLiquidity(amountA, amountB);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'LiquidityAdded');
      expect(event.args.provider).to.equal(owner.address);
      expect(event.args.amountA).to.equal(amountA);
      expect(event.args.amountB).to.equal(amountB);
      expect(event.args.lpTokens).to.be.gt(0);

      // Check reserves
      expect(await amm.reserveA()).to.equal(amountA);
      expect(await amm.reserveB()).to.equal(amountB);
    });

    it("Should track LP tokens correctly", async function () {
      const { amm, tokenA, tokenB, owner } = await loadFixture(deployAMMFixture);
      const amountA = ethers.utils.parseEther("100");
      const amountB = ethers.utils.parseEther("100");

      await tokenA.approve(amm.address, amountA);
      await tokenB.approve(amm.address, amountB);
      
      await amm.addLiquidity(amountA, amountB);
      
      const lpBalance = await amm.lpBalances(owner.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("Should fail when adding zero liquidity", async function () {
      const { amm } = await loadFixture(deployAMMFixture);
      await expect(
        amm.addLiquidity(0, 0)
      ).to.be.revertedWith("Insufficient liquidity amounts");
    });

    it("Should fail without token approval", async function () {
      const { amm } = await loadFixture(deployAMMFixture);
      const amount = ethers.utils.parseEther("100");
      
      await expect(
        amm.addLiquidity(amount, amount)
      ).to.be.reverted;
    });
  });
});