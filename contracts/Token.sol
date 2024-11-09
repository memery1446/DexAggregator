// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC20, ERC20Burnable, ReentrancyGuard, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    
    mapping(address => uint256) private _lastTransferTimestamp;
    uint256 public constant TRANSFER_COOLDOWN = 1 minutes;

    event RateLimit(address indexed from, address indexed to, uint256 amount);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        
        // Mint initial supply to the deployer
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) {
        _burn(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyRole(BURNER_ROLE) {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    function transfer(address to, uint256 amount) public virtual override nonReentrant returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override nonReentrant returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 currentTimestamp = block.timestamp;
        if (currentTimestamp - _lastTransferTimestamp[from] < TRANSFER_COOLDOWN) {
            emit RateLimit(from, to, amount);
            return;
        }
        _lastTransferTimestamp[from] = currentTimestamp;

        super._transfer(from, to, amount);
    }

    // Function to check the cooldown status
    function canTransfer(address from) public view returns (bool) {
        return block.timestamp - _lastTransferTimestamp[from] >= TRANSFER_COOLDOWN;
    }
}
