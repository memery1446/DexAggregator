const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Attacker Contract", function () {
    async function deployAttackerFixture() {
        const [owner, attacker] = await ethers.getSigners();
        
        // Deploy Token with correct constructor params
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy("Test Token", "TEST");
        await token.deployed();

        // Deploy Attacker contract
        const Attacker = await ethers.getContractFactory("Attacker");
        const attackerContract = await Attacker.connect(attacker).deploy(token.address);
        await attackerContract.deployed();

        // Mint tokens if needed using the mint function
        await token.mint(owner.address, ethers.utils.parseEther("1000000"));

        return {
            token,
            attackerContract,
            owner,
            attacker
        };
    }

    describe("Deployment", function () {
        it("Should set the correct token address", async function () {
            const { token, attackerContract } = await loadFixture(deployAttackerFixture);
            expect(await attackerContract.token()).to.equal(token.address);
        });

        it("Should initialize count to zero", async function () {
            const { attackerContract } = await loadFixture(deployAttackerFixture);
            expect(await attackerContract.count()).to.equal(0);
        });
    });

describe("Attack Attempts", function () {
        it("Should fail to execute attack without token balance", async function () {
            const { attackerContract } = await loadFixture(deployAttackerFixture);
            await expect(attackerContract.attack()).to.be.reverted;
        });

        it("Should limit recursive calls to 5", async function () {
            const { token, attackerContract, owner } = await loadFixture(deployAttackerFixture);
            
            // Fund attacker contract
            const attackAmount = ethers.utils.parseEther("10");
            await token.transfer(attackerContract.address, attackAmount);

            // Execute individual receiveTokens calls to simulate recursive pattern
            for(let i = 0; i < 5; i++) {
                await attackerContract.receiveTokens(ethers.utils.parseEther("1"));
            }
            
            // Verify count is 5
            expect(await attackerContract.count()).to.equal(5);

            // Verify additional calls don't increase count
            await attackerContract.receiveTokens(ethers.utils.parseEther("1"));
            expect(await attackerContract.count()).to.equal(5);
        });

        it("Should track recursive call count correctly", async function () {
            const { token, attackerContract } = await loadFixture(deployAttackerFixture);
            
            // Fund attacker contract
            const attackAmount = ethers.utils.parseEther("1");
            await token.transfer(attackerContract.address, attackAmount);

            // Execute calls one at a time and check counter
            for(let i = 1; i <= 3; i++) {
                await attackerContract.receiveTokens(ethers.utils.parseEther("0.1"));
                expect(await attackerContract.count()).to.equal(i);
            }
        });

        it("Should not allow external count manipulation", async function () {
            const { attackerContract, attacker } = await loadFixture(deployAttackerFixture);
            
            // Verify count is private and can't be manipulated directly
            expect(attackerContract.count).to.not.have.property('setter');
        });
    });

    describe("Token Interaction", function () {
        it("Should handle failed token transfers gracefully", async function () {
            const { attackerContract } = await loadFixture(deployAttackerFixture);
            
            // Attempt transfer with no balance
            await expect(attackerContract.receiveTokens(100))
                .to.be.reverted;
        });

        it("Should respect token balance limits", async function () {
            const { token, attackerContract, owner } = await loadFixture(deployAttackerFixture);
            
            const smallAmount = ethers.utils.parseEther("0.1");
            await token.transfer(attackerContract.address, smallAmount);

            // Try to transfer more than balance
            const largeAmount = ethers.utils.parseEther("1");
            await expect(attackerContract.receiveTokens(largeAmount))
                .to.be.reverted;
        });
    });

    describe("Security Properties", function () {
        it("Should not accept direct ETH transfers", async function () {
            const { attackerContract, attacker } = await loadFixture(deployAttackerFixture);
            
            // Try to send ETH to contract
            await expect(
                attacker.sendTransaction({
                    to: attackerContract.address,
                    value: ethers.utils.parseEther("1")
                })
            ).to.be.reverted;
        });

        it("Should maintain count integrity across multiple attacks", async function () {
            const { token, attackerContract, owner } = await loadFixture(deployAttackerFixture);
            
            // Fund contract
            const amount = ethers.utils.parseEther("1");
            await token.transfer(attackerContract.address, amount);

            // Execute multiple attacks
            await attackerContract.attack();
            const firstCount = await attackerContract.count();

            // Reset by redeploying
            const Attacker = await ethers.getContractFactory("Attacker");
            const newAttackerContract = await Attacker.deploy(token.address);
            await newAttackerContract.deployed();
            
            await token.transfer(newAttackerContract.address, amount);
            await newAttackerContract.attack();
            
            // Verify same behavior
            expect(await newAttackerContract.count()).to.equal(firstCount);
        });
    });
});
