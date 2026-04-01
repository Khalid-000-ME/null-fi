// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";

contract nETH is ZamaEthereumConfig {
    string public name;
    string public symbol;

    mapping(address => euint64) internal balances;
    mapping(address => mapping(address => euint64)) internal allowances;

    /// @notice Tracks how much ETH each user wrapped so unwrap is bounded.
    mapping(address => uint256) public ethDeposited;

    event Wrapped(address indexed user, uint64 amount);
    event Unwrapped(address indexed user, uint64 amount);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    // ─── Wrap / Unwrap ────────────────────────────────────────────────────

    /**
     * @notice Wrap Sepolia ETH → nullETH 1:1 in wei units (uint64-safe, max ~18.4 ETH).
     */
    function wrap() external payable {
        require(msg.value > 0, "Send ETH to wrap");
        require(msg.value <= type(uint64).max, "Amount exceeds uint64 max (~18 ETH)");

        uint64 amount = uint64(msg.value);
        ethDeposited[msg.sender] += msg.value;

        balances[msg.sender] = FHE.add(balances[msg.sender], FHE.asEuint64(amount));
        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);

        emit Wrapped(msg.sender, amount);
    }

    /**
     * @notice Unwrap nullETH → Sepolia ETH. Capped at amount originally wrapped.
     */
    function unwrap(uint64 amount) external {
        require(ethDeposited[msg.sender] >= uint256(amount), "Exceeds wrapped balance");
        ethDeposited[msg.sender] -= uint256(amount);

        euint64 existing = balances[msg.sender];
        if (euint64.unwrap(existing) != 0) {
            balances[msg.sender] = FHE.sub(existing, FHE.asEuint64(amount));
            FHE.allowThis(balances[msg.sender]);
            FHE.allow(balances[msg.sender], msg.sender);
        }

        (bool ok, ) = payable(msg.sender).call{value: uint256(amount)}("");
        require(ok, "ETH transfer failed");

        emit Unwrapped(msg.sender, amount);
    }

    receive() external payable {}

    // ─── Testing helpers ──────────────────────────────────────────────────

    function mint(externalEuint64 encryptedAmount, bytes calldata proof) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);
        balances[msg.sender] = FHE.add(balances[msg.sender], amount);
        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);
    }

    function mintPlaintext(address to, uint64 amount) external {
        balances[to] = FHE.add(balances[to], FHE.asEuint64(amount));
        FHE.allowThis(balances[to]);
        FHE.allow(balances[to], to);
    }

    // ─── Standard interface ───────────────────────────────────────────────

    function balanceOf(address account) external view returns (euint64) {
        return balances[account];
    }

    function ethWrapped(address account) external view returns (uint256) {
        return ethDeposited[account];
    }

    function transfer(address to, euint64 amount) external returns (bool) {
        balances[msg.sender] = FHE.sub(balances[msg.sender], amount);
        balances[to] = FHE.add(balances[to], amount);
        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);
        FHE.allowThis(balances[to]);
        FHE.allow(balances[to], to);
        return true;
    }

    function transferFrom(address from, address to, euint64 amount) external returns (bool) {
        allowances[from][msg.sender] = FHE.sub(allowances[from][msg.sender], amount);
        balances[from] = FHE.sub(balances[from], amount);
        balances[to] = FHE.add(balances[to], amount);
        FHE.allowThis(allowances[from][msg.sender]);
        FHE.allow(allowances[from][msg.sender], from);
        FHE.allow(allowances[from][msg.sender], msg.sender);
        FHE.allowThis(balances[from]);
        FHE.allow(balances[from], from);
        FHE.allowThis(balances[to]);
        FHE.allow(balances[to], to);
        return true;
    }

    function approve(address spender, externalEuint64 encryptedAmount, bytes calldata proof) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);
        allowances[msg.sender][spender] = amount;
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        FHE.allow(amount, spender);
        return true;
    }

    function allowance(address owner, address spender) external view returns (euint64) {
        return allowances[owner][spender];
    }
}
