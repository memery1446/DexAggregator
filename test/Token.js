const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("TestToken", "TST");
    return { token, owner, addr1, addr2 };
  }

  describe("Basic Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      await token.transfer(addr1.address, 50);
      expect(await token.balanceOf(addr1.address)).to.equal(50);
    });

    it("Should fail if sender does not have enough tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const initialBalance = await token.balanceOf(addr1.address);
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should detect reentrancy using testReentrancy", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      await expect(token.testReentrancy()).to.be.revertedWith("Reentrant call");
    });
  });

  describe("Access Control", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should assign MINTER_ROLE to owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.equal(true);
    });

    it("Should prevent non-minters from minting", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      await expect(
        token.connect(addr1).mint(addr1.address, 100)
      ).to.be.reverted;
    });
  });
});