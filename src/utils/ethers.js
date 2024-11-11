import { ethers } from 'ethers'
import { TK1_ADDRESS, TK2_ADDRESS } from '../contracts/contractAddresses'
import { TOKEN_ABI } from '../contracts/contractABIs'

export const getTokenBalance = async (tokenAddress, walletAddress) => {
  if (typeof window.ethereum !== 'undefined' && walletAddress) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider)
      const balance = await contract.balanceOf(walletAddress)
      return ethers.utils.formatUnits(balance, 18)
    } catch (error) {
      console.error('Error fetching token balance:', error)
      return '0'
    }
  }
  return '0'
}

export const getTK1Balance = (walletAddress) => getTokenBalance(TK1_ADDRESS, walletAddress)
export const getTK2Balance = (walletAddress) => getTokenBalance(TK2_ADDRESS, walletAddress)
