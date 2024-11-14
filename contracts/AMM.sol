// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AMM is ReentrancyGuard {
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    // Track liquidity providers
    mapping(address => uint256) public lpBalances;
    uint256 public totalLpTokens;

    event LiquidityAdded(address provider, uint256 amountA, uint256 amountB, uint256 lpTokens);
    event LiquidityRemoved(address provider, uint256 amountA, uint256 amountB, uint256 lpTokens);
    event Swap(address user, uint256 amountIn, uint256 amountOut, bool isAtoB);

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token addresses");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant returns (uint256 lpTokens) {
        require(amountA > 0 && amountB > 0, "Insufficient liquidity amounts");

        // Transfer tokens to AMM
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        // Calculate LP tokens to mint
        if (totalLpTokens == 0) {
            lpTokens = _sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            totalLpTokens = lpTokens + MINIMUM_LIQUIDITY;
        } else {
            uint256 lpTokensA = (amountA * totalLpTokens) / reserveA;
            uint256 lpTokensB = (amountB * totalLpTokens) / reserveB;
            lpTokens = lpTokensA < lpTokensB ? lpTokensA : lpTokensB;
        }

        require(lpTokens > 0, "Insufficient LP tokens minted");

        // Update reserves and balances
        reserveA += amountA;
        reserveB += amountB;
        lpBalances[msg.sender] += lpTokens;

        emit LiquidityAdded(msg.sender, amountA, amountB, lpTokens);
    }

    function swap(uint256 amountIn, bool isAtoB) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");

        if (isAtoB) {
            tokenA.transferFrom(msg.sender, address(this), amountIn);
            amountOut = getAmountOut(amountIn, reserveA, reserveB);
            require(amountOut > 0 && amountOut <= reserveB, "Invalid output amount");
            tokenB.transfer(msg.sender, amountOut);
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            tokenB.transferFrom(msg.sender, address(this), amountIn);
            amountOut = getAmountOut(amountIn, reserveB, reserveA);
            require(amountOut > 0 && amountOut <= reserveA, "Invalid output amount");
            tokenA.transfer(msg.sender, amountOut);
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut, isAtoB);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        
        return numerator / denominator;
    }

    // Internal function to calculate square root
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}

