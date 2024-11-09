const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy("Test Token", "TEST");
    await token.deployed();
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      await expect(token.testReentrancy()).to.be.revertedWith("Reentrant call");
    });

    it("Should allow normal transfers", async function () {
      await expect(token.transfer(addr1.address, 100)).to.not.be.reverted;
    });
  });
});