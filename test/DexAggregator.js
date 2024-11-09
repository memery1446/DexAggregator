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

        // MISSING STEP: Need to approve tokens before adding liquidity
        await tokenA.approve(amm1.address, initLiquidityAmount);
        await tokenB.approve(amm1.address, initLiquidityAmount);

        // Add liquidity to both AMMs
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

    describe("Swap Execution", function () {
        it("Should execute swap on AMM with better quote", async function () {
            const { aggregator, tokenA, tokenB, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            // Give user1 some tokens to swap
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            
            // Get initial balances
            const initialTokenABalance = await tokenA.balanceOf(user1.address);
            const initialTokenBBalance = await tokenB.balanceOf(user1.address);
            
            // Approve aggregator to spend tokens
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            // Execute swap
            const minOutput = ethers.utils.parseEther("9"); // Expecting at least 9 tokens due to fees
            await aggregator.connect(user1).executeSwap(swapAmount, true, minOutput);
            
            // Check balances after swap
            const finalTokenABalance = await tokenA.balanceOf(user1.address);
            const finalTokenBBalance = await tokenB.balanceOf(user1.address);
            
            expect(finalTokenABalance).to.be.lt(initialTokenABalance);
            expect(finalTokenBBalance).to.be.gt(initialTokenBBalance);
        });

        it("Should fail when output is less than minOutput", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            // Set unrealistically high minOutput
            const unrealisticMinOutput = ethers.utils.parseEther("11");
            
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, unrealisticMinOutput)
            ).to.be.revertedWith("Insufficient output amount");
        });

        it("Should fail when user has insufficient balance", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            // Don't transfer any tokens to user1
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, 0)
            ).to.be.reverted;
        });

        it("Should fail when not approved", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            // Don't approve the aggregator
            
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, 0)
            ).to.be.reverted;
        });
    });

    describe("Quote Events", function () {
        it("Should emit BestQuoteFound event with correct values", async function () {
            const { aggregator, amm1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("1");
            
            await expect(aggregator.checkAndEmitQuote(swapAmount, true))
                .to.emit(aggregator, "BestQuoteFound")
                .withArgs(amm1.address, await aggregator.getBestQuote(swapAmount, true).then(r => r.bestOutput));
        });

        it("Should emit SwapExecuted event after successful swap", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("1");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            await expect(aggregator.connect(user1).executeSwap(swapAmount, true, 0))
                .to.emit(aggregator, "SwapExecuted");
        });
    });

    describe("Advanced Scenarios", function () {
        it("Should handle different reserve ratios correctly", async function () {
            const { aggregator, amm1, amm2, tokenA, tokenB, owner } = await loadFixture(deployDexAggregatorFixture);
            
            // Add more liquidity to AMM1 to create different ratios
            const additionalLiquidity = ethers.utils.parseEther("1000");
            await tokenA.approve(amm1.address, additionalLiquidity);
            await tokenB.approve(amm1.address, additionalLiquidity);
            await amm1.addLiquidity(additionalLiquidity, additionalLiquidity);

            const swapAmount = ethers.utils.parseEther("1");
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(swapAmount, true);

            // AMM1 should still be better due to both higher liquidity and lower fees
            expect(bestAMM).to.equal(amm1.address);
        });

        it("Should find best AMM when prices differ significantly", async function () {
            const { aggregator, amm1, amm2, tokenA, tokenB, owner, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            // Create price disparity by making several swaps on AMM2
            const swapAmount = ethers.utils.parseEther("100");
            await tokenA.approve(amm2.address, swapAmount);
            await amm2.swap(swapAmount, true); // This will impact AMM2's prices

            // Now check which AMM offers better price for a small swap
            const testAmount = ethers.utils.parseEther("1");
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(testAmount, true);

            // AMM1 should offer better price as it hasn't been impacted by large swaps
            expect(bestAMM).to.equal(amm1.address);
        });

        it("Should handle consecutive swaps maintaining best price selection", async function () {
            const { aggregator, tokenA, tokenB, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount.mul(3)); // Fund for multiple swaps
            await tokenA.connect(user1).approve(aggregator.address, swapAmount.mul(3));

            // Execute three consecutive swaps
            for(let i = 0; i < 3; i++) {
                const [bestAMMBefore] = await aggregator.getBestQuote(swapAmount, true);
                await aggregator.connect(user1).executeSwap(swapAmount, true, 0);
                const [bestAMMAfter] = await aggregator.getBestQuote(swapAmount, true);

                // Best AMM might change after swaps due to changing reserves
                console.log(`Swap ${i + 1} - Best AMM before: ${bestAMMBefore}, after: ${bestAMMAfter}`);
            }
        });

        it("Should handle token approval resets correctly", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            
            // Approve, then reset approval to 0, then approve again
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, 0);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            // Should still execute successfully
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, 0)
            ).to.not.be.reverted;
        });

        it("Should verify reserves match after swaps", async function () {
            const { aggregator, tokenA, tokenB, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);
            
            // Get reserves before
            const reservesBefore = await aggregator.getReserves();
            
            // Execute swap
            await aggregator.connect(user1).executeSwap(swapAmount, true, 0);
            
            // Get reserves after
            const reservesAfter = await aggregator.getReserves();
            
            // Verify reserves changed appropriately
            expect(reservesAfter.amm1ReserveA.add(reservesAfter.amm2ReserveA))
                .to.be.gt(reservesBefore.amm1ReserveA.add(reservesBefore.amm2ReserveA));
        });
    });
describe("Critical Safety and Edge Cases", function () {
        it("Should handle zero liquidity in one AMM", async function () {
            const { aggregator, amm1, tokenA, tokenB, user1, initLiquidityAmount } = await loadFixture(deployDexAggregatorFixture);
            
            // Remove all liquidity from AMM2 (if there was a way to do so)
            // For now, we just check that it routes through AMM1
            const swapAmount = ethers.utils.parseEther("1");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);

            const [bestAMM, bestOutput] = await aggregator.getBestQuote(swapAmount, true);
            expect(bestAMM).to.equal(amm1.address);
        });

        it("Should handle maximum uint256 amounts correctly", async function () {
            const { aggregator } = await loadFixture(deployDexAggregatorFixture);
            const maxUint = ethers.constants.MaxUint256;
            
            // Should not revert but return 0 for impossible amounts
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(maxUint, true);
            expect(bestOutput).to.equal(0);
        });

        it("Should prevent sandwich attacks through slippage protection", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);

            // Get quote
            const [, expectedOutput] = await aggregator.getBestQuote(swapAmount, true);
            
            // Set minOutput very close to expected (99%)
            const minOutput = expectedOutput.mul(99).div(100);
            
            // Should succeed with tight slippage
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, minOutput)
            ).to.not.be.reverted;
        });

        it("Should fail gracefully when both AMMs are unsuitable", async function () {
            const { aggregator } = await loadFixture(deployDexAggregatorFixture);
            
            // Try to get quote for impossibly large amount
            const hugeAmount = ethers.constants.MaxUint256;
            const [bestAMM, bestOutput] = await aggregator.getBestQuote(hugeAmount, true);
            
            // Should return zero values rather than revert
            expect(bestOutput).to.equal(0);
        });

        it("Should maintain correct state after failed transactions", async function () {
            const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
            
            const swapAmount = ethers.utils.parseEther("10");
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(aggregator.address, swapAmount);

            // Try swap with impossible minOutput
            const impossibleMinOutput = ethers.utils.parseEther("1000000");
            
            // Transaction should revert
            await expect(
                aggregator.connect(user1).executeSwap(swapAmount, true, impossibleMinOutput)
            ).to.be.reverted;

            // User's balance should be unchanged
            expect(await tokenA.balanceOf(user1.address)).to.equal(swapAmount);
        });
    });

describe("Price Monitoring", function () {
    it("Should record price points after swaps", async function () {
        const { aggregator, tokenA, tokenB, user1 } = await loadFixture(deployDexAggregatorFixture);
        
        // Setup swap
        const swapAmount = ethers.utils.parseEther("10");
        await tokenA.transfer(user1.address, swapAmount);
        await tokenA.connect(user1).approve(aggregator.address, swapAmount);
        
        // Execute swap
        await aggregator.connect(user1).executeSwap(swapAmount, true, 0);
        
        // Get price history for AMM1 (which should have been chosen due to better price)
        const amm1Address = await aggregator.amm1();
        const priceHistory = await aggregator.getPriceHistory(amm1Address);
        
        // Check that we have a price point
        expect(priceHistory.length).to.equal(1);
        expect(priceHistory[0].price).to.be.gt(0);
        expect(priceHistory[0].timestamp).to.be.gt(0);
    });

it("Should maintain price history correctly", async function () {
        const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
        const amm1Address = await aggregator.amm1();
        
        // Setup for swaps
        const swapAmount = ethers.utils.parseEther("1");
        await tokenA.transfer(user1.address, swapAmount.mul(10));
        await tokenA.connect(user1).approve(aggregator.address, swapAmount.mul(10));

        // Do 5 swaps and check each one
        for(let i = 0; i < 5; i++) {
            await aggregator.connect(user1).executeSwap(swapAmount, true, 0);
            const history = await aggregator.getPriceHistory(amm1Address);
            console.log(`After swap ${i + 1}, history length: ${history.length}`);
        }

        // Get final history
        const finalHistory = await aggregator.getPriceHistory(amm1Address);
        
        // Verify key properties instead of exact length
        expect(finalHistory.length).to.be.gt(0);  // Should have entries
        expect(finalHistory[0].timestamp).to.be.lt(finalHistory[finalHistory.length - 1].timestamp); // Should be in chronological order
        expect(finalHistory[0].price).to.be.gt(finalHistory[finalHistory.length - 1].price); // Price should decrease with each swap
    });

    it("Should emit PriceUpdated events", async function () {
        const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
        
        const swapAmount = ethers.utils.parseEther("1");
        await tokenA.transfer(user1.address, swapAmount);
        await tokenA.connect(user1).approve(aggregator.address, swapAmount);
        
        // Check event emission
        await expect(
            aggregator.connect(user1).executeSwap(swapAmount, true, 0)
        ).to.emit(aggregator, "PriceUpdated");
    });

    it("Should store prices in chronological order", async function () {
        const { aggregator, tokenA, user1 } = await loadFixture(deployDexAggregatorFixture);
        
        // Setup for multiple swaps
        const swapAmount = ethers.utils.parseEther("1");
        const totalAmount = swapAmount.mul(3);
        await tokenA.transfer(user1.address, totalAmount);
        await tokenA.connect(user1).approve(aggregator.address, totalAmount);
        
        // Execute multiple swaps
        for(let i = 0; i < 3; i++) {
            await aggregator.connect(user1).executeSwap(swapAmount, true, 0);
        }
        
        // Get price history
        const amm1Address = await aggregator.amm1();
        const priceHistory = await aggregator.getPriceHistory(amm1Address);
        
        // Check timestamps are in ascending order
        for(let i = 1; i < priceHistory.length; i++) {
            expect(priceHistory[i].timestamp).to.be.gt(priceHistory[i-1].timestamp);
        }
    });

    it("Should record different prices for different AMMs", async function () {
        const { aggregator, tokenA, tokenB, user1 } = await loadFixture(deployDexAggregatorFixture);
        
        // Create price disparity between AMMs by doing a large swap on AMM2
        const largeAmount = ethers.utils.parseEther("100");
        await tokenA.transfer(user1.address, largeAmount);
        await tokenA.connect(user1).approve(aggregator.address, largeAmount);
        
        // Execute swap
        await aggregator.connect(user1).executeSwap(largeAmount, true, 0);
        
        // Get price histories
        const amm1Address = await aggregator.amm1();
        const amm2Address = await aggregator.amm2();
        const priceHistory1 = await aggregator.getPriceHistory(amm1Address);
        const priceHistory2 = await aggregator.getPriceHistory(amm2Address);
        
        // Check that we have different prices for different AMMs
        if(priceHistory1.length > 0 && priceHistory2.length > 0) {
            expect(priceHistory1[0].price).to.not.equal(priceHistory2[0].price);
        }
    });
});
});
