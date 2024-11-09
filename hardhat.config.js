require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",  // Updated to match your contracts
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
  }
};
