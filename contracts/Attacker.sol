// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Token.sol";
contract Attacker {
    Token public token;
    uint256 public count;
    bool private locked;

    constructor(address _token) {
        token = Token(_token);
    }

    function attack() external {
        require(token.balanceOf(address(this)) > 0, "Need tokens to attack");
        require(!locked, "Attack in progress");
        
        locked = true;
        count = 0;  // Reset count before attack
        receiveTokens(1);  // Start with initial call
        locked = false;
    }

    function receiveTokens(uint256 amount) public {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance for attack");
        
        // First increment the count
        if (count < 5) {
            count++;
            // Only make the recursive call if we haven't hit 5 yet
            if (count < 5) {
                token.transfer(address(this), amount);
            }
        }
    }
}
