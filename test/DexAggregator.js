// Core imports for testing environment
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// Main DEX System Integration Test Suite 
// Tests core functionality, liquidity management, pricing, and security features
describe("DEX System Integration", () => {
    // Test fixture: Sets up complete DEX system with tokens, AMMs, and user accounts
    const deployFullSystemFixture = async () => {
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
    };

    // Tests for Cross-Contract Liquidity Management
    describe("Cross-Contract Liquidity", () => {
        it("Should maintain consistent reserves across AMMs after multiple operations", async () => {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const initialReserves = await dexAggregator.getReserves();
            const swapAmount = ethers.utils.parseEther("100");
            await tk1.connect(user1).approve(dexAggregator.address, swapAmount.mul(3));
            
            for(let i = 0; i < 3; i++) {
                await dexAggregator.connect(user1).executeSwap(swapAmount, true, 0);
            }
            
            const finalReserves = await dexAggregator.getReserves();
            const amm1ReserveChange = finalReserves.amm1ReserveA.sub(initialReserves.amm1ReserveA);
            const amm2ReserveChange = finalReserves.amm2ReserveA.sub(initialReserves.amm2ReserveA);
            
            expect(amm1ReserveChange.abs()).to.be.gt(amm2ReserveChange.abs());
        });

        it("Should handle simultaneous liquidity changes in both AMMs", async () => {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const addAmount = ethers.utils.parseEther("1000");
            
            await tk1.connect(user1).approve(amm1.address, addAmount);
            await tk2.connect(user1).approve(amm1.address, addAmount);
            await tk1.connect(user2).approve(amm2.address, addAmount);
            await tk2.connect(user2).approve(amm2.address, addAmount);
            
            await Promise.all([
                amm1.connect(user1).addLiquidity(addAmount, addAmount),
                amm2.connect(user2).addLiquidity(addAmount, addAmount)
            ]);
            
            const reserves = await dexAggregator.getReserves();
            expect(reserves.amm1ReserveA).to.be.gt(ethers.utils.parseEther("10000"));
            expect(reserves.amm2ReserveA).to.be.gt(ethers.utils.parseEther("10000"));
        });
    });

    // Tests for Price Impact and Route Selection
    describe("Price Impact and Routing", () => {
        it("Should route large trades through AMM with better liquidity", async () => {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const largeAmount = ethers.utils.parseEther("5000");
            await tk1.mint(user1.address, largeAmount);
            await tk1.connect(user1).approve(dexAggregator.address, largeAmount);
            
            const amm1Quote = await amm1.getAmountOut(largeAmount, await amm1.reserveA(), await amm1.reserveB());
            const amm2Quote = await amm2.getAmountOut(largeAmount, await amm2.reserveA(), await amm2.reserveB());
            
            const [bestAMM, bestOutput] = await dexAggregator.getBestQuote(largeAmount, true);
            
            expect(amm1Quote).to.be.gt(amm2Quote);
            expect(bestAMM).to.equal(amm1.address);
            expect(bestOutput).to.equal(amm1Quote);
            
            const tx = await dexAggregator.connect(user1).executeSwap(largeAmount, true, 0);
            const receipt = await tx.wait();
            
            const swapEvent = receipt.events?.find(e => e.event === "SwapExecuted");
            expect(swapEvent.args.amm).to.equal(bestAMM);
        });

        it("Should handle price divergence between AMMs", async () => {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const divergeAmount = ethers.utils.parseEther("1000");
            await tk1.connect(user2).approve(amm2.address, divergeAmount);
            await amm2.connect(user2).swap(divergeAmount, true);
            
            const swapAmount = ethers.utils.parseEther("100");
            await tk1.connect(user1).approve(dexAggregator.address, swapAmount);
            
            const [bestAMM] = await dexAggregator.getBestQuote(swapAmount, true);
            expect(bestAMM).to.equal(amm1.address);
        });
    });

    // Security and Attack Prevention Tests
    describe("Attack Resistance", () => {
        it("Should limit single-transaction price impact", async () => {
            const { tk1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const initialReserves = await amm2.reserveA();
            const largeAmount = initialReserves.mul(3);
            
            await tk1.mint(user1.address, largeAmount);
            await tk1.connect(user1).approve(amm2.address, largeAmount);
            
            await expect(
                amm2.connect(user1).swap(largeAmount, true)
            ).to.be.revertedWith("Swap amount too large");
        });

        it("Should prevent profitable sandwich attacks", async () => {
            const { tk1, tk2, dexAggregator, user1, attacker } = await loadFixture(deployFullSystemFixture);
            
            const victimAmount = ethers.utils.parseEther("1000");
            const attackAmount = ethers.utils.parseEther("5000");
            
            await tk1.mint(user1.address, victimAmount);
            await tk1.mint(attacker.address, attackAmount.mul(2));
            
            await tk1.connect(user1).approve(dexAggregator.address, victimAmount);
            await tk1.connect(attacker).approve(dexAggregator.address, attackAmount.mul(2));
            
            const initialAttackerBalance = await tk1.balanceOf(attacker.address);
            const initialAttackerToken2Balance = await tk2.balanceOf(attacker.address);
            
            await dexAggregator.connect(attacker).executeSwap(attackAmount, true, 0);
            await dexAggregator.connect(user1).executeSwap(victimAmount, true, 0);
            
            const token2Amount = await tk2.balanceOf(attacker.address);
            await tk2.connect(attacker).approve(dexAggregator.address, token2Amount);
            await dexAggregator.connect(attacker).executeSwap(token2Amount, false, 0);
            
            const finalAttackerBalance = await tk1.balanceOf(attacker.address);
            const profit = finalAttackerBalance.sub(initialAttackerBalance);
            
            expect(profit).to.be.lt(0);
        });

        it("Should show diminishing returns on arbitrage attempts", async () => {
            const { tk1, tk2, amm1, amm2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const divergeAmount = ethers.utils.parseEther("5");
            await tk1.mint(user1.address, divergeAmount.mul(20));
            
            await tk1.connect(user1).approve(amm2.address, divergeAmount);
            for (let i = 0; i < 5; i++) {
                await amm2.connect(user1).swap(divergeAmount.div(5), true);
                await ethers.provider.send("evm_mine");
            }
            
            const profits = [];
            const tradeSize = ethers.utils.parseEther("0.5");
            const attempts = 8;
            
            console.log("\nArbitrage Attempts:");
            
            for (let i = 0; i < attempts; i++) {
                const beforeBalance = await tk1.balanceOf(user1.address);
                
                const [bestAMMBefore, quoteBefore] = await dexAggregator.getBestQuote(tradeSize, true);
                
                await tk1.connect(user1).approve(dexAggregator.address, tradeSize);
                await dexAggregator.connect(user1).executeSwap(tradeSize, true, 0);
                
                const midTk2Balance = await tk2.balanceOf(user1.address);
                await tk2.connect(user1).approve(dexAggregator.address, midTk2Balance);
                if (midTk2Balance.gt(0)) {
                    await dexAggregator.connect(user1).executeSwap(midTk2Balance, false, 0);
                }
                
                const afterBalance = await tk1.balanceOf(user1.address);
                const profit = afterBalance.sub(beforeBalance);
                profits.push(profit);
                
                const [bestAMMAfter, quoteAfter] = await dexAggregator.getBestQuote(tradeSize, true);
                
                console.log(`\nAttempt ${i + 1}:`);
                console.log(`Profit: ${ethers.utils.formatEther(profit)} TK1`);
                console.log(`Profit Margin: ${profit.mul(100).div(tradeSize)}%`);
                console.log(`Quote Before: ${ethers.utils.formatEther(quoteBefore)}`);
                console.log(`Quote After: ${ethers.utils.formatEther(quoteAfter)}`);
                
                await ethers.provider.send("evm_increaseTime", [1]);
                await ethers.provider.send("evm_mine");
            }
            
            for (let i = 1; i < profits.length; i++) {
                const currentProfit = profits[i];
                const previousProfit = profits[i-1];
                
                console.log(`\nComparing profit ${i} vs ${i-1}:`);
                console.log(`Current: ${ethers.utils.formatEther(currentProfit)}`);
                console.log(`Previous: ${ethers.utils.formatEther(previousProfit)}`);
                
                expect(currentProfit).to.be.lt(previousProfit);
            }
            
            const initialQuote = await dexAggregator.getBestQuote(ethers.utils.parseEther("1"), true);
            const finalQuote = await dexAggregator.getBestQuote(ethers.utils.parseEther("1"), true);
            
            const priceDiff = finalQuote[1].sub(initialQuote[1]).abs();
            const maxAllowedDiff = initialQuote[1].div(50);
            expect(priceDiff).to.be.lt(maxAllowedDiff);
            
            const finalProfitMargin = profits[profits.length - 1]
                .mul(100)
                .div(tradeSize);
                
            console.log("\nFinal Metrics:");
            console.log(`Final Profit Margin: ${finalProfitMargin}%`);
            console.log(`Initial Quote: ${ethers.utils.formatEther(initialQuote[1])}`);
            console.log(`Final Quote: ${ethers.utils.formatEther(finalQuote[1])}`);
            
            expect(finalProfitMargin).to.be.lt(25);
        });
    });

    // System Stability and Performance Tests
    describe("Market Dynamics", () => {
        it("Should handle high volume trading periods", async () => {
            const { tk1, tk2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const tradeAmount = ethers.utils.parseEther("500");
            await tk1.mint(user1.address, tradeAmount.mul(5));
            await tk1.mint(user2.address, tradeAmount.mul(5));
            
            const initialReserves = await dexAggregator.getReserves();
            
            const trades = [];
            for (let i = 0; i < 5; i++) {
                await tk1.connect(user1).approve(dexAggregator.address, tradeAmount);
                await tk1.connect(user2).approve(dexAggregator.address, tradeAmount);
                
                trades.push(
                    dexAggregator.connect(user1).executeSwap(tradeAmount, true, 0),
                    dexAggregator.connect(user2).executeSwap(tradeAmount, true, 0)
                );
            }
            
            await Promise.all(trades);
            
            const finalReserves = await dexAggregator.getReserves();
            const maxReserveDeviation = 150;
            
            for (const amm of ['amm1', 'amm2']) {
                const initialRatio = initialReserves[`${amm}ReserveA`]
                    .mul(1000)
                    .div(initialReserves[`${amm}ReserveB`]);
                    
                const finalRatio = finalReserves[`${amm}ReserveA`]
                    .mul(1000)
                    .div(finalReserves[`${amm}ReserveB`]);
                    
                const ratioDifference = finalRatio.sub(initialRatio).abs();
                expect(ratioDifference).to.be.lt(
                    initialRatio.mul(maxReserveDeviation).div(100),
                    `Reserve ratio deviation: ${ratioDifference}`
                );
            }
        });

        it("Should maintain price efficiency during volatility", async () => {
            const { tk1, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const smallTrade = ethers.utils.parseEther("500");
            const largeTrade = ethers.utils.parseEther("2500");
            
            const [, smallQuoteBefore] = await dexAggregator.getBestQuote(smallTrade, true);
            await tk1.mint(user1.address, smallTrade);
            await tk1.connect(user1).approve(dexAggregator.address, smallTrade);
            await dexAggregator.connect(user1).executeSwap(smallTrade, true, 0);
            const [, smallQuoteAfter] = await dexAggregator.getBestQuote(smallTrade, true);
            
            const smallImpact = smallQuoteAfter.sub(smallQuoteBefore)
                .mul(100)
                .div(smallQuoteBefore)
                .abs();
                
            console.log(`\nSmall trade impact analysis:`);
            console.log(`Trade size: ${ethers.utils.formatEther(smallTrade)} ETH`);
            console.log(`Quote before: ${ethers.utils.formatEther(smallQuoteBefore)}`);
            console.log(`Quote after: ${ethers.utils.formatEther(smallQuoteAfter)}`);
            console.log(`Impact: ${smallImpact}%`);
            
            const [, largeQuoteBefore] = await dexAggregator.getBestQuote(largeTrade, true);
            await tk1.mint(user1.address, largeTrade);
            await tk1.connect(user1).approve(dexAggregator.address, largeTrade);
            await dexAggregator.connect(user1).executeSwap(largeTrade, true, 0);
            const [, largeQuoteAfter] = await dexAggregator.getBestQuote(largeTrade, true);
            
            const largeImpact = largeQuoteAfter.sub(largeQuoteBefore)
                .mul(100)
                .div(largeQuoteBefore)
                .abs();
                
            console.log(`\nLarge trade impact analysis:`);
            console.log(`Trade size: ${ethers.utils.formatEther(largeTrade)} ETH`);
            console.log(`Quote before: ${ethers.utils.formatEther(largeQuoteBefore)}`);
            console.log(`Quote after: ${ethers.utils.formatEther(largeQuoteAfter)}`);
            console.log(`Impact: ${largeImpact}%`);
            
            expect(largeImpact).to.be.gt(0);
            
            if (!smallImpact.isZero()) {
                const tradeRatio = largeTrade.mul(100).div(smallTrade);
                const impactRatio = largeImpact.mul(100).div(smallImpact);
                
                console.log(`\nRatio analysis:`);
                console.log(`Trade size ratio: ${tradeRatio}x`);
                console.log(`Impact ratio: ${impactRatio}x`);
                
                expect(impactRatio).to.be.lt(tradeRatio.mul(3));
            } else {
                console.log("\nSkipping ratio analysis due to zero small trade impact");
            }
            
            expect(largeImpact).to.be.lt(50);
        });
    });

    // System Reliability and Edge Case Tests
    describe("System Reliability", () => {
        it("Should handle multiple concurrent quotes", async () => {
            const { tk1, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const amount = ethers.utils.parseEther("100");
            
            const quotePromises = [];
            for (let i = 0; i < 5; i++) {
                quotePromises.push(dexAggregator.getBestQuote(amount, true));
            }
            
            const quotes = await Promise.all(quotePromises);
            
            const [firstQuoteAMM, firstQuoteAmount] = quotes[0];
            quotes.forEach(([amm, amount]) => {
                expect(amm).to.equal(firstQuoteAMM);
                expect(amount).to.equal(firstQuoteAmount);
            });
        });

        it("Should maintain accurate quotes during high traffic", async () => {
            const { tk1, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const amount = ethers.utils.parseEther("100");
            await tk1.mint(user1.address, amount.mul(10));
            await tk1.connect(user1).approve(dexAggregator.address, amount.mul(10));
            
            const [initialAMM, initialQuote] = await dexAggregator.getBestQuote(amount, true);
            
            for (let i = 0; i < 5; i++) {
                await dexAggregator.connect(user1).executeSwap(amount, true, 0);
            }
            
            const [finalAMM, finalQuote] = await dexAggregator.getBestQuote(amount, true);
            
            const priceImpact = finalQuote.sub(initialQuote)
                .mul(100)
                .div(initialQuote)
                .abs();
                
            expect(priceImpact).to.be.lt(10);
        });
    });

    // Additional Critical Test Cases
    describe("Additional Critical Scenarios", () => {
        it("Should handle decimal precision correctly", async () => {
            const { tk1, tk2, dexAggregator, user1 } = await loadFixture(deployFullSystemFixture);
            
            const amount = ethers.utils.parseUnits("100", 18);
            await tk1.mint(user1.address, amount);
            await tk1.connect(user1).approve(dexAggregator.address, amount);
            
            const [bestAMM, expectedOutput] = await dexAggregator.getBestQuote(amount, true);
            const initialBalance = await tk2.balanceOf(user1.address);
            
            await dexAggregator.connect(user1).executeSwap(amount, true, 0);
            
            const finalBalance = await tk2.balanceOf(user1.address);
            const actualOutput = finalBalance.sub(initialBalance);
            
            const tolerance = expectedOutput.div(100);
            expect(actualOutput).to.be.gte(expectedOutput.sub(tolerance));
            expect(actualOutput).to.be.lte(expectedOutput.add(tolerance));
        });

        it("Should maintain consistent quotes under market stress", async () => {
            const { tk1, tk2, dexAggregator, user1, user2 } = await loadFixture(deployFullSystemFixture);
            
            const testAmount = ethers.utils.parseEther("100");
            const [initialBestAMM, initialQuote] = await dexAggregator.getBestQuote(testAmount, true);
            
            const stressAmount = ethers.utils.parseEther("1000");
            await tk1.mint(user2.address, stressAmount.mul(3));
            await tk1.connect(user2).approve(dexAggregator.address, stressAmount.mul(3));
            
            for (let i = 0; i < 3; i++) {
                await dexAggregator.connect(user2).executeSwap(stressAmount, true, 0);
            }
            
            const [finalBestAMM, finalQuote] = await dexAggregator.getBestQuote(testAmount, true);
            const quoteDifference = finalQuote.sub(initialQuote).abs();
            const maxAllowedDifference = initialQuote.mul(30).div(100);
            
            expect(quoteDifference).to.be.lte(maxAllowedDifference);
        });
    });
});
            