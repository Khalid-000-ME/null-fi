// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { NullPool } from "./NullPool.sol";

/**
 * @notice Permissionless liquidation trigger.
 *
 * Emits an event for off-chain keepers to pick up and act on.
 * The actual liquidation check happens in FHE inside NullPool.
 */
contract NullLiquidator is ZamaEthereumConfig {

    NullPool public pool;

    event LiquidationTriggered(
        address indexed caller,
        address indexed borrower
    );

    event HealthCheckRequested(
        uint32 indexed requestId,
        address indexed borrower
    );

    constructor(address _pool) {
        pool = NullPool(_pool);
    }

    /**
     * @notice Request health check for a specific borrower.
     * @dev This emits an event that off-chain keepers can listen to.
     *      The keeper will then call requestHealthCheck on NullPool.
     * @param borrower Address of the position to check
     */
    function triggerHealthCheck(address borrower) external {
        emit LiquidationTriggered(msg.sender, borrower);
    }

    /**
     * @notice Request health check via Gateway (async decryption).
     * @dev This is the main entry point for liquidation keepers.
     *      It requests an encrypted health check from the pool.
     * @param borrower Address of the position to check
     */
    function requestHealthCheckForBorrower(address borrower) external {
        pool.requestHealthCheck(borrower);
        emit HealthCheckRequested(0, borrower);
    }

    receive() external payable {}
}
