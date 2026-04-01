// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";

/**
 * @notice NullFi debt token — an encrypted ERC-20 representing outstanding debt.
 *
 * Minted when a user borrows. Burned when repaid.
 * Balance is encrypted — only the holder knows their debt amount.
 *
 * Standard DeFi protocols have public debt tokens — anyone can check
 * your debt balance on Etherscan. nDEBT balances are encrypted.
 * Your creditor (NullPool) and you are the only ACL-permitted readers.
 */
contract NullToken is ZamaEthereumConfig {

    address public pool;

    mapping(address => euint64) public encBalances;

    string public name = "NullFi Debt Token";
    string public symbol = "nDEBT";

    constructor() {}

    function setPool(address _pool) external {
        require(pool == address(0), "Already set");
        pool = _pool;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "NullToken: only pool");
        _;
    }

    function mint(address to, euint64 amount) external onlyPool {
        euint64 existing = encBalances[to];
        euint64 newBalance;
        // euint64 handle == 0 means uninitialized (first borrow ever)
        if (euint64.unwrap(existing) != 0) {
            newBalance = FHE.add(existing, amount);
        } else {
            // First mint — no existing balance; use the amount directly
            newBalance = amount;
        }
        encBalances[to] = newBalance;
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, to);
        FHE.allow(newBalance, pool);
    }

    function burn(address from, euint64 amount) external onlyPool {
        euint64 existing = encBalances[from];
        // Guard: if somehow uninitialized, treat as zero (no-op)
        if (euint64.unwrap(existing) == 0) return;
        euint64 newBalance = FHE.sub(existing, amount);
        encBalances[from] = newBalance;
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, from);
        FHE.allow(newBalance, pool);
    }

    function balanceOf(address account) external view returns (euint64) {
        return encBalances[account];
    }
}
