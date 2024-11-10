import { ethers } from 'ethers';

export const getHardhatProvider = () => {
  return new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
};

export const getHardhatSigner = async () => {
  const provider = getHardhatProvider();
  const signer = provider.getSigner();
  return signer;
};

export const getHardhatAccounts = async () => {
  const provider = getHardhatProvider();
  return await provider.listAccounts();
};
