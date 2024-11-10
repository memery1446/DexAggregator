const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DEX System Integration", function () {
    async function deployFullSystemFixture() {
        const [owner, user1, user2, attacker] = await ethers.getSigners();
        
        // Deploy Tokens
        const Token = await ethers.getContractFactory("Token");
        const tk1 = await Token.deploy("Token1", "TK1");
        const tk2 = await Token.deploy("Token2", "TK2");
        
        // Deploy AMMs
        const AMM = await ethers.getContractFactory("AMM");
        const AMM2 = await ethers.getContractFactory("AMM2");
        const amm1 = await AMM.deploy(tk1.address, tk2.address);
        const amm2 = await AMM2.deploy(tk1.address, tk2.address);
        
        // Deploy DexAggregator
        const DexAggregator = await ethers.getContractFactory("DexAggregator");
        const dexAggregator = await DexAggregator.deploy(amm1.address, amm2.address);
        
        // Deploy Attacker contract
        const Attacker = await ethers.getContractFactory("Attacker");
        const attackerContract = await Attacker.connect(attacker).deploy(tk1.address);

        // Setup initial liquidity
        const initialMint = ethers.utils.parseEther("1000000");
        const initialLiquidity = ethers.utils.parseEther("10000");
        
        // Mint tokens
        await tk1.mint(owner.address, initialMint);
        await tk2.mint(owner.address, initialMint);
        
        // Add liquidity to AMMs
        await tk1.approve(amm1.address, initialLiquidity);
        await tk2.approve(amm1.address, initialLiquidity);
        await amm1.addLiquidity(initialLiquidity, initialLiquidity);
        
        await tk1.approve(amm2.address, initialLiquidity);
        await tk2.approve(amm2.address, initialLiquidity);
        await amm2.addLiquidity(initialLiquidity, initialLiquidity);
        
        // Fund users for testing
        const userFunds = ethers.utils.parseEther("1000");
        await tk1.transfer(user1.address, userFunds);
        await tk2.transfer(user1.address, userFunds);
        await tk1.transfer(user2.address, userFunds);
        await tk2.transfer(user2.address, userFunds);

        return {
            tk1, tk2,
            amm1, amm2,
            dexAggregator,
            attackerContract,
            owner, user1, user2, attacker,
            initialLiquidity, userFunds
        };
    }

    describe("Cross-Contract Liquidity", function () {
        it("Should maintain consistent reserves across AMMs after multiple operations", async function () {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            // Get initial reserves
            const initialReserves = await dexAggregator.getReserves();
            
            // Perform multiple swaps
            const swapAmount = ethers.utils.parseEther("100");
            await tk1.connect(user1).approve(dexAggregator.address, swapAmount.mul(3));
            
            for(let i = 0; i < 3; i++) {
                await dexAggregator.connect(user1).executeSwap(swapAmount, true, 0);
            }
            
            // Get final reserves
            const finalReserves = await dexAggregator.getReserves();
            
            // Verify reserve changes are consistent
            const amm1ReserveChange = finalReserves.amm1ReserveA.sub(initialReserves.amm1ReserveA);
            const amm2ReserveChange = finalReserves.amm2ReserveA.sub(initialReserves.amm2ReserveA);
            
            // One AMM should have absorbed most of the trades
            expect(amm1ReserveChange.abs()).to.be.gt(amm2ReserveChange.abs());
        });

        it("Should handle simultaneous liquidity changes in both AMMs", async function () {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const addAmount = ethers.utils.parseEther("1000");
            
            // Add liquidity to both AMMs simultaneously
            await tk1.connect(user1).approve(amm1.address, addAmount);
            await tk2.connect(user1).approve(amm1.address, addAmount);
            await tk1.connect(user2).approve(amm2.address, addAmount);
            await tk2.connect(user2).approve(amm2.address, addAmount);
            
            await Promise.all([
                amm1.connect(user1).addLiquidity(addAmount, addAmount),
                amm2.connect(user2).addLiquidity(addAmount, addAmount)
            ]);
            
            // Verify aggregator sees updated reserves
            const reserves = await dexAggregator.getReserves();
            expect(reserves.amm1ReserveA).to.be.gt(ethers.utils.parseEther("10000"));
            expect(reserves.amm2ReserveA).to.be.gt(ethers.utils.parseEther("10000"));
        });
    });

    describe("Price Impact and Routing", function () {
        it("Should route large trades through AMM with better liquidity", async function () {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            // Ensure user has enough tokens
            const largeAmount = ethers.utils.parseEther("5000");
            await tk1.mint(user1.address, largeAmount);
            await tk1.connect(user1).approve(dexAggregator.address, largeAmount);
            
            // Get quotes from both AMMs directly
            const amm1Quote = await amm1.getAmountOut(largeAmount, await amm1.reserveA(), await amm1.reserveB());
            const amm2Quote = await amm2.getAmountOut(largeAmount, await amm2.reserveA(), await amm2.reserveB());
            
            // Get aggregator's choice
            const [bestAMM, bestOutput] = await dexAggregator.getBestQuote(largeAmount, true);
            
            // Verify AMM1 gives better quote (due to lower fees)
            expect(amm1Quote).to.be.gt(amm2Quote);
            
            // Verify aggregator chose the better AMM
            expect(bestAMM).to.equal(amm1.address);
            expect(bestOutput).to.equal(amm1Quote);
            
            // Execute swap
            const tx = await dexAggregator.connect(user1).executeSwap(largeAmount, true, 0);
            const receipt = await tx.wait();
            
            // Verify the swap was executed on the chosen AMM
            const swapEvent = receipt.events?.find(e => e.event === "SwapExecuted");
            expect(swapEvent.args.amm).to.equal(bestAMM);
        });

        it("Should handle price divergence between AMMs", async function () {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            // Create price divergence by swapping in AMM2
            const divergeAmount = ethers.utils.parseEther("1000");
            await tk1.connect(user2).approve(amm2.address, divergeAmount);
            await amm2.connect(user2).swap(divergeAmount, true);
            
            // Test aggregator routing
            const swapAmount = ethers.utils.parseEther("100");
            await tk1.connect(user1).approve(dexAggregator.address, swapAmount);
            
            // Should route through AMM1 due to better price
            const [bestAMM] = await dexAggregator.getBestQuote(swapAmount, true);
            expect(bestAMM).to.equal(amm1.address);
        });
    });
});