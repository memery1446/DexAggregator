const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", () => {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("TestToken", "TST");
    return { token, owner, addr1, addr2 };
  }

  describe("Basic Transfer", () => {
    it("Should transfer tokens between accounts", async () => {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      await token.transfer(addr1.address, 50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);
    });

    it("Should fail if sender does not have enough tokens", async () => {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const initialBalance = await token.balanceOf(addr1.address);
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;
    });
  });

  describe("Reentrancy Protection", () => {
    it("Should detect reentrancy using testReentrancy", async () => {
      const { token } = await loadFixture(deployTokenFixture);
      await expect(token.testReentrancy()).to.be.revertedWith("Reentrant call");
    });
  });

  describe("Access Control", () => {
    it("Should set the right owner", async () => {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should assign MINTER_ROLE to owner", async () => {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.equal(true);
    });

    it("Should prevent non-minters from minting", async () => {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      await expect(
        token.connect(addr1).mint(addr1.address, 100)
      ).to.be.reverted;
    });
  });

  describe("TransferFrom and Allowance", () => {
    it("Should allow transferFrom after approval", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      // Owner approves addr1 to spend tokens
      await token.approve(addr1.address, 100);
      
      // addr1 transfers tokens from owner to addr2
      await token.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      expect(await token.balanceOf(addr2.address)).to.equal(50);
    });

    it("Should update allowance after transferFrom", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      await token.approve(addr1.address, 100);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      
      expect(await token.allowance(owner.address, addr1.address)).to.equal(50);
    });

    it("Should not allow transferFrom above allowance", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      await token.approve(addr1.address, 100);
      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, 150)
      ).to.be.reverted;
    });
  });

  describe("Edge Cases", () => {
    it("Should handle zero value transfers", async () => {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      await expect(token.transfer(addr1.address, 0)).to.not.be.reverted;
      await expect(token.approve(addr1.address, 0)).to.not.be.reverted;
    });

    it("Should fail on insufficient balance even if approved", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      
      // addr1 approves addr2 to spend tokens
      await token.connect(addr1).approve(addr2.address, 1000);
      
      // Should fail because addr1 has no tokens
      await expect(
        token.connect(addr2).transferFrom(addr1.address, owner.address, 100)
      ).to.be.reverted;
    });

    it("Should not allow approval to zero address", async () => {
      const { token } = await loadFixture(deployTokenFixture);
      await expect(
        token.approve(ethers.constants.AddressZero, 100)
      ).to.be.reverted;
    });
  });

  describe("AMM Integration Preparation", () => {
    it("Should have sufficient decimals for AMM operations", async () => {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.decimals()).to.equal(18);
    });

    it("Should handle large transfers for liquidity provision", async () => {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const largeAmount = ethers.utils.parseEther("1000000");
      await expect(token.transfer(addr1.address, largeAmount)).to.not.be.reverted;
    });
  });
    describe("Advanced AMM Scenarios", () => {
    it("Should handle maximum uint256 approvals for DEX router", async () => {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const maxUint256 = ethers.constants.MaxUint256;
      await expect(token.approve(addr1.address, maxUint256)).to.not.be.reverted;
      expect(await token.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should allow multiple transfers in same block", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      await token.transfer(addr1.address, 1000);
      await token.transfer(addr2.address, 1000);
      expect(await token.balanceOf(addr1.address)).to.equal(1000);
      expect(await token.balanceOf(addr2.address)).to.equal(1000);
    });

    it("Should maintain accurate balances after multiple operations", async () => {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const initialBalance = await token.balanceOf(owner.address);
      
      // Perform multiple operations
      await token.transfer(addr1.address, 100);
      await token.approve(addr2.address, 200);
      await token.connect(addr2).transferFrom(owner.address, addr1.address, 200);
      
      // Check final balances
      expect(await token.balanceOf(addr1.address)).to.equal(300);
      expect(await token.balanceOf(owner.address)).to.equal(initialBalance.sub(300));
    });
  });
});