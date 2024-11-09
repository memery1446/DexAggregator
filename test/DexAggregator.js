const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DexAggregator", function () {
    async function deployDexAggregatorFixture() {
        const [owner, user1, user2] = await ethers.getSigners();

        // Deploy tokens
        const Token = await ethers.getContractFactory("Token");
        const tokenA = await Token.deploy("TokenA", "TA");
        const tokenB = await Token.deploy("TokenB", "TB");

        // Deploy AMMs
        const AMM = await ethers.getContractFactory("AMM");
        const AMM2 = await ethers.getContractFactory("AMM2");
        const amm1 = await AMM.deploy(tokenA.address, tokenB.address);
        const amm2 = await AMM2.deploy(tokenA.address, tokenB.address);

        // Deploy Aggregator
        const DexAggregator = await ethers.getContractFactory("DexAggregator");
        const aggregator = await DexAggregator.deploy(amm1.address, amm2.address);

        // Setup initial liquidity
        const mintAmount = ethers.utils.parseEther("1000000");
        const initLiquidityAmount = ethers.utils.parseEther("1000");

        // Mint tokens to owner
        await tokenA.mint(owner.address, mintAmount);
        await tokenB.mint(owner.address, mintAmount);

        // Add liquidity to both AMMs
        await tokenA.approve(amm1.address, initLiquidityAmount);
        await tokenB.approve(amm1.address, initLiquidityAmount);
        await amm1.addLiquidity(initLiquidityAmount, initLiquidityAmount);

        await tokenA.approve(amm2.address, initLiquidityAmount);
        await tokenB.approve(amm2.address, initLiquidityAmount);
        await amm2.addLiquidity(initLiquidityAmount, initLiquidityAmount);

        return {
            aggregator,
            amm1,
            amm2,
            tokenA,
            tokenB,
            owner,
            user1,
            user2,
            initLiquidityAmount
        };
    }

    describe("Deployment", function () {
        it("Should set the correct AMM addresses", async function () {
            const { aggregator, amm1, amm2 } = await loadFixture(deployDexAggregatorFixture);
            expect(await aggregator.amm1()).to.equal(amm1.address);
            expect(await aggregator.amm2()).to.equal(amm2.address);
        });

        it("Should show correct initial reserves", async function () {
            const { aggregator, initLiquidityAmount } = await loadFixture(deployDexAggregatorFixture);
            const reserves = await aggregator.getReserves();
            expect(reserves.amm1ReserveA).to.equal(initLiquidityAmount);
            expect(reserves.amm1ReserveB).to.equal(initLiquidityAmount);
            expect(reserves.amm2ReserveA).to.equal(initLiquidityAmount);
            expect(reserves.amm2ReserveB).to.equal(initLiquidityAmount);
        });
    });

    describe("Quote Comparison", function () {
        it("Should get quotes from both AMMs", async function () {
            const { aggregator, user1 } = await loadFixture(deployDexAggregatorFixture);
            const swapAmount = ethers.utils.parseEther("1");
            
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(swapAmount, true);
            expect(bestOutput).to.be.gt(0);
        });

        it("Should return better quote from AMM1 (lower fees)", async function () {
            const { aggregator, amm1, amm2 } = await loadFixture(deployDexAggregatorFixture);
            const swapAmount = ethers.utils.parseEther("1");
            
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(swapAmount, true);
            expect(bestAMM).to.equal(amm1.address); // AMM1 has 0.3% fee vs AMM2's 0.5%
        });
    });
});
