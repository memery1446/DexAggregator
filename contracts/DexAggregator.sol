// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./AMM2.sol";

contract DexAggregator {
    AMM public amm1;
    AMM2 public amm2;
    
    event BestQuoteFound(address amm, uint256 outputAmount);
    event SwapExecuted(address amm, uint256 amountIn, uint256 amountOut);

    constructor(address _amm1, address _amm2) {
        require(_amm1 != address(0) && _amm2 != address(0), "Invalid AMM addresses");
        amm1 = AMM(_amm1);
        amm2 = AMM2(_amm2);
    }

    // Get best quote for a swap
    function getBestQuote(
        uint256 amountIn,
        bool isAtoB
    ) public view returns (address bestAMM, uint256 bestOutput) {
        // Get quotes from both AMMs
        uint256 quote1;
        uint256 quote2;

        // Try to get quote from AMM1
        try amm1.getAmountOut(
            amountIn,
            isAtoB ? amm1.reserveA() : amm1.reserveB(),
            isAtoB ? amm1.reserveB() : amm1.reserveA()
        ) returns (uint256 amount) {
            quote1 = amount;
        } catch {
            quote1 = 0;
        }

        // Try to get quote from AMM2
        try amm2.getAmountOut(
            amountIn,
            isAtoB ? amm2.reserveA() : amm2.reserveB(),
            isAtoB ? amm2.reserveB() : amm2.reserveA()
        ) returns (uint256 amount) {
            quote2 = amount;
        } catch {
            quote2 = 0;
        }

        // Compare quotes
        if (quote1 > quote2) {
            bestAMM = address(amm1);
            bestOutput = quote1;
        } else {
            bestAMM = address(amm2);
            bestOutput = quote2;
        }
    }

    // Check quote and emit event
    function checkAndEmitQuote(
        uint256 amountIn,
        bool isAtoB
    ) external returns (address bestAMM, uint256 bestOutput) {
        (bestAMM, bestOutput) = getBestQuote(amountIn, isAtoB);
        emit BestQuoteFound(bestAMM, bestOutput);
    }

    // Execute swap on best AMM
    function executeSwap(
        uint256 amountIn,
        bool isAtoB,
        uint256 minOutput
    ) external returns (uint256 amountOut) {
        // Get best quote
        (address bestAMM, uint256 expectedOutput) = getBestQuote(amountIn, isAtoB);
        require(expectedOutput >= minOutput, "Insufficient output amount");

        // Transfer tokens from user to this contract
        IERC20 tokenIn = IERC20(isAtoB ? amm1.tokenA() : amm1.tokenB());
        require(tokenIn.transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        // Approve tokens to best AMM
        require(tokenIn.approve(bestAMM, amountIn), "Approval failed");

        // Execute swap on best AMM
        if (bestAMM == address(amm1)) {
            amountOut = amm1.swap(amountIn, isAtoB);
        } else {
            amountOut = amm2.swap(amountIn, isAtoB);
        }

        // Transfer output tokens to user
        IERC20 tokenOut = IERC20(isAtoB ? amm1.tokenB() : amm1.tokenA());
        require(tokenOut.transfer(msg.sender, amountOut), "Output transfer failed");

        emit SwapExecuted(bestAMM, amountIn, amountOut);
    }

    // View function to check reserves of both AMMs
    function getReserves() external view returns (
        uint256 amm1ReserveA,
        uint256 amm1ReserveB,
        uint256 amm2ReserveA,
        uint256 amm2ReserveB
    ) {
        return (
            amm1.reserveA(),
            amm1.reserveB(),
            amm2.reserveA(),
            amm2.reserveB()
        );
    }
}
