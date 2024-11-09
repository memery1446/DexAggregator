// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
contract Token is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bool private _locked;
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    function transfer(address to, uint256 amount) public virtual override nonReentrant returns (bool) {
        return super.transfer(to, amount);
    }
    function transferFrom(address from, address to, uint256 amount) public virtual override nonReentrant returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    function testReentrancy() public nonReentrant {
        require(!_locked, "Reentrant call");
        this.testReentrancy();
    }
}