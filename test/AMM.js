const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AMM Contract", function () {
  async function deployAMMFixture() {
    // Get signers
    const [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy tokens
    const Token = await ethers.getContractFactory("Token");
    const tokenA = await Token.deploy("TokenA", "TA");
    const tokenB = await Token.deploy("TokenB", "TB");

    // Deploy AMM
    const AMM = await ethers.getContractFactory("AMM");
    const amm = await AMM.deploy(tokenA.address, tokenB.address);

    return { amm, tokenA, tokenB, owner, addr1, addr2 };
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
});
