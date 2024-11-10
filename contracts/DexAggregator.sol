// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AMM.sol";
import "./AMM2.sol";

contract DexAggregator {
    AMM public amm1;
    AMM2 public amm2;
    mapping(address => PricePoint[]) public priceHistory;
    uint256 public constant PRICE_HISTORY_LENGTH = 10;

    struct PricePoint {
        uint256 timestamp;
        uint256 price;
    }

    event BestQuoteFound(address amm, uint256 outputAmount);
    event SwapExecuted(address amm, uint256 amountIn, uint256 amountOut);
    event PriceUpdated(address amm, uint256 price, uint256 timestamp);

    constructor(address _amm1, address _amm2) {
        require(_amm1 != address(0) && _amm2 != address(0), "Invalid AMM addresses");
        amm1 = AMM(_amm1);
        amm2 = AMM2(_amm2);
    }

    function getBestQuote(uint256 amountIn, bool isAtoB) public view returns (address bestAMM, uint256 bestOutput) {
        if (amountIn == 0) return (address(0), 0);

        // Handle max uint256 case
        if (amountIn >= type(uint256).max / 1000) {
            return (address(0), 0);
        }

        uint256 output1;
        uint256 output2;

        try this.safeGetAmountOut(address(amm1), amountIn, isAtoB) returns (uint256 amount1) {
            output1 = amount1;
        } catch {
            output1 = 0;
        }

        try this.safeGetAmountOut(address(amm2), amountIn, isAtoB) returns (uint256 amount2) {
            output2 = amount2;
        } catch {
            output2 = 0;
        }

        if (output1 >= output2 && output1 > 0) {
            return (address(amm1), output1);
        } else if (output2 > 0) {
            return (address(amm2), output2);
        } else {
            return (address(0), 0);
        }
    }

    function safeGetAmountOut(address ammAddress, uint256 amountIn, bool isAtoB) external view returns (uint256) {
        AMM amm = AMM(ammAddress);
        if (isAtoB) {
            if (amm.reserveA() == 0 || amm.reserveB() == 0) return 0;
            return amm.getAmountOut(amountIn, amm.reserveA(), amm.reserveB());
        } else {
            if (amm.reserveA() == 0 || amm.reserveB() == 0) return 0;
            return amm.getAmountOut(amountIn, amm.reserveB(), amm.reserveA());
        }
    }

    function checkAndEmitQuote(uint256 amountIn, bool isAtoB) external returns (address bestAMM, uint256 bestOutput) {
        (bestAMM, bestOutput) = getBestQuote(amountIn, isAtoB);
        emit BestQuoteFound(bestAMM, bestOutput);
        return (bestAMM, bestOutput);
    }

function executeSwap(uint256 amountIn, bool isAtoB, uint256 minOutput) external returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        
        (address bestAMM, uint256 expectedOutput) = getBestQuote(amountIn, isAtoB);
        require(bestAMM != address(0), "No valid route found");
        require(expectedOutput >= minOutput, "Insufficient output amount");

        // Get input and output tokens
        IERC20 tokenIn;
        if (isAtoB) {
            tokenIn = IERC20(address(amm1.tokenA()));
        } else {
            tokenIn = IERC20(address(amm1.tokenB()));
        }

        // Transfer input tokens to this contract
        require(tokenIn.transferFrom(msg.sender, address(this), amountIn), "Transfer failed");
        
        // Approve AMM to spend input tokens
        require(tokenIn.approve(bestAMM, 0), "Failed to clear approval");
        require(tokenIn.approve(bestAMM, amountIn), "Approval failed");

        // Execute swap on the chosen AMM
        if (bestAMM == address(amm1)) {
            amountOut = amm1.swap(amountIn, isAtoB);
        } else {
            amountOut = amm2.swap(amountIn, isAtoB);
        }

        require(amountOut > 0, "Zero output amount");
        require(amountOut >= minOutput, "Slippage too high");

        // Get output token
        IERC20 tokenOut;
        if (isAtoB) {
            tokenOut = IERC20(address(amm1.tokenB()));
        } else {
            tokenOut = IERC20(address(amm1.tokenA()));
        }

        // Transfer output tokens to user
        uint256 outputBalance = tokenOut.balanceOf(address(this));
        require(outputBalance >= amountOut, "Insufficient output balance");
        require(tokenOut.transfer(msg.sender, amountOut), "Output transfer failed");

        // Update price history
        updatePriceHistory(bestAMM, (amountOut * 1e18) / amountIn);
        emit SwapExecuted(bestAMM, amountIn, amountOut);
        
        return amountOut;
    }

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

    function updatePriceHistory(address amm, uint256 price) internal {
        PricePoint[] storage history = priceHistory[amm];
        
        if (history.length >= PRICE_HISTORY_LENGTH) {
            for (uint i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        
        history.push(PricePoint({
            timestamp: block.timestamp,
            price: price
        }));
        
        emit PriceUpdated(amm, price, block.timestamp);
    }

    function getPriceHistory(address amm) external view returns (PricePoint[] memory) {
        return priceHistory[amm];
    }
}
