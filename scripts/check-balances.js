const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== Checking Token Balances ===\n");

  const ADDRESSES = {
    TK1: "0x83948078E863965393309B4E9e2C112F91f9fB14",
    TK2: "0xd95E02893187B054dFCb7FAC0862420f727CA484",
    AMM1: "0xe063B33FE970f74649Fa9e3562d7E293351b6c50",
    AMM2: "0xa09443f7F3F8594f14906Ada11bC2a68fE3A97A8"
  };

  const [signer] = await ethers.getSigners();
  console.log("Checking balances for:", signer.address);

  const Token = await ethers.getContractFactory("Token");
  const tk1 = Token.attach(ADDRESSES.TK1);
  const tk2 = Token.attach(ADDRESSES.TK2);

  // Check token allowances
  const tk1AllowanceAMM1 = await tk1.allowance(signer.address, ADDRESSES.AMM1);
  const tk2AllowanceAMM1 = await tk2.allowance(signer.address, ADDRESSES.AMM1);
  const tk1AllowanceAMM2 = await tk1.allowance(signer.address, ADDRESSES.AMM2);
  const tk2AllowanceAMM2 = await tk2.allowance(signer.address, ADDRESSES.AMM2);

  console.log("\nToken Balances:");
  console.log("TK1:", ethers.utils.formatEther(await tk1.balanceOf(signer.address)));
  console.log("TK2:", ethers.utils.formatEther(await tk2.balanceOf(signer.address)));

  console.log("\nToken Allowances for AMM1:");
  console.log("TK1:", ethers.utils.formatEther(tk1AllowanceAMM1));
  console.log("TK2:", ethers.utils.formatEther(tk2AllowanceAMM1));

  console.log("\nToken Allowances for AMM2:");
  console.log("TK1:", ethers.utils.formatEther(tk1AllowanceAMM2));
  console.log("TK2:", ethers.utils.formatEther(tk2AllowanceAMM2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  