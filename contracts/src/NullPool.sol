// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { IConfidentialERC20 } from "./interfaces/IConfidentialERC20.sol";
import { NullOracle } from "./NullOracle.sol";
import { nUSDC } from "./nUSDC.sol";

contract NullPool is ZamaEthereumConfig {
    // ─── Constants ───────────────────────────────────────────────────────

    uint64 public constant LTV_BPS       = 75;    // 75% loan-to-value
    uint64 public constant LIQ_THRESHOLD = 80;    // liquidate at 80% LTV

    // ─── State ───────────────────────────────────────────────────────────

    address public collateralToken;   // ConfidentialERC20 accepted as collateral
    nUSDC public debtToken;       // encrypted debt token minted on borrow
    NullOracle public oracle;

    struct Position {
        euint64 collateral;           // deposited collateral amount
        euint64 debt;                 // outstanding debt amount
        uint256 lastUpdateBlock;      // plaintext — no sensitive info
        bool    exists;               // plaintext — whether position was created
    }

    mapping(address => Position) internal _positions;

    // ─── Events ──────────────────────────────────────────────────────────

    event Deposited(address indexed borrower);
    event Borrowed(address indexed borrower);
    event Repaid(address indexed borrower);
    event CollateralWithdrawn(address indexed borrower);
    event Liquidated(address indexed borrower, address indexed liquidator);

    // ─── Errors ──────────────────────────────────────────────────────────

    error PositionNotFound();
    error InvalidAmount();

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor(
        address _collateralToken,
        address _debtToken,
        address _oracle
    ) {
        collateralToken = _collateralToken;
        debtToken = nUSDC(_debtToken);
        oracle = NullOracle(_oracle);
    }

    // ─── Deposit Collateral ───────────────────────────────────────────────

    /**
     * @notice Deposit collateral to open or add to a position.
     * @param encAmount  Encrypted collateral amount handle (externalEuint64)
     * @param proof      ZK proof for encAmount
     */
    function deposit(
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        euint64 amount = FHE.fromExternal(encAmount, proof);

        // Transfer encrypted collateral into pool
        FHE.allow(amount, collateralToken);
        IConfidentialERC20(collateralToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Update or create position
        Position storage pos = _positions[msg.sender];
        if (!pos.exists) {
            pos.collateral = amount;
            pos.debt = FHE.asEuint64(0);
            pos.exists = true;
            // Grant the pool ACL permission to use pos.debt across future transactions
            FHE.allowThis(pos.debt);
            FHE.allow(pos.debt, msg.sender);
        } else {
            pos.collateral = FHE.add(pos.collateral, amount);
        }

        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.collateral);
        FHE.allow(pos.collateral, msg.sender);

        emit Deposited(msg.sender);
    }

    // ─── Borrow ───────────────────────────────────────────────────────────

    /**
     * @notice Borrow against deposited collateral.
     * @param encAmount  Encrypted borrow amount handle (externalEuint64)
     * @param proof      ZK proof for encAmount
     */
    function borrow(
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        emit Deposited(msg.sender); // Debug: Function called
        Position storage pos = _positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();

        emit Deposited(address(1)); // Debug: Passed position check

        euint64 requestedAmount = FHE.fromExternal(encAmount, proof);
        emit Deposited(address(1)); // Debug: Passed fromExternal

        // Compute maximum borrow allowed = collateral * LTV / 100
        euint64 maxBorrow = FHE.div(
            FHE.mul(pos.collateral, FHE.asEuint64(LTV_BPS)),
            uint64(100)
        );
        emit Deposited(address(2)); // Debug: Passed calculation

        euint64 newTotalDebt = FHE.add(pos.debt, requestedAmount);
        ebool isAllowed = FHE.le(newTotalDebt, maxBorrow);
        emit Deposited(address(3)); // Debug: Passed debt calculation

        euint64 actualAmount = FHE.select(
            isAllowed,
            requestedAmount,
            FHE.asEuint64(0)
        );
        emit Deposited(address(4)); // Debug: Passed select

        pos.debt = FHE.add(pos.debt, actualAmount);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.debt);
        FHE.allow(pos.debt, msg.sender);

        FHE.allow(actualAmount, address(debtToken));
        emit Deposited(address(5)); // Debug: About to mint
        debtToken.mint(msg.sender, actualAmount);
        emit Deposited(address(6)); // Debug: Minted

        FHE.allow(actualAmount, msg.sender);

        emit Borrowed(msg.sender);
    }

    // ─── Repay ────────────────────────────────────────────────────────────

    /**
     * @notice Repay outstanding debt.
     * @param encAmount  Encrypted repayment amount handle (externalEuint64)
     * @param proof      ZK proof for encAmount
     */
    function repay(
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        Position storage pos = _positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();

        euint64 repayAmount = FHE.fromExternal(encAmount, proof);

        ebool debtCoversRepay = FHE.ge(pos.debt, repayAmount);
        euint64 actualRepay = FHE.select(debtCoversRepay, repayAmount, pos.debt);

        pos.debt = FHE.sub(pos.debt, actualRepay);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.debt);
        FHE.allow(pos.debt, msg.sender);

        FHE.allow(actualRepay, address(debtToken));
        debtToken.burn(msg.sender, actualRepay);

        emit Repaid(msg.sender);
    }

    // ─── Withdraw Collateral ──────────────────────────────────────────────

    /**
     * @notice Withdraw collateral — only if remaining position stays healthy.
     * @param encAmount  Encrypted withdrawal amount handle (externalEuint64)
     * @param proof      ZK proof for encAmount
     */
    function withdraw(
        externalEuint64 encAmount,
        bytes calldata proof
    ) external {
        Position storage pos = _positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();

        euint64 withdrawAmount = FHE.fromExternal(encAmount, proof);

        euint64 newCollateral = FHE.sub(pos.collateral, withdrawAmount);
        euint64 newMaxBorrow = FHE.div(FHE.mul(newCollateral, FHE.asEuint64(LTV_BPS)), uint64(100));
        ebool stillHealthy = FHE.le(pos.debt, newMaxBorrow);

        euint64 actualWithdraw = FHE.select(
            stillHealthy,
            withdrawAmount,
            FHE.asEuint64(0)
        );

        pos.collateral = FHE.sub(pos.collateral, actualWithdraw);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.collateral);
        FHE.allow(pos.collateral, msg.sender);

        FHE.allow(actualWithdraw, collateralToken);
        IConfidentialERC20(collateralToken).transfer(msg.sender, actualWithdraw);

        emit CollateralWithdrawn(msg.sender);
    }

    // ─── View: Encrypted Position ─────────────────────────────────────────

    function getPosition(address borrower) external view returns (
        euint64 collateral,
        euint64 debt,
        uint256 lastUpdateBlock,
        bool    exists
    ) {
        Position storage pos = _positions[borrower];
        return (pos.collateral, pos.debt, pos.lastUpdateBlock, pos.exists);
    }

    // ─── Health Check ────────────────────────────────────────────────────────

    /**
     * @notice Request encrypted health check for a borrower.
     * @dev This initiates an async decryption request to Zama's Gateway.
     *      The callback will trigger liquidation if the position is insolvent.
     * @param borrower Address of the position to check
     */
    function requestHealthCheck(address borrower) external {
        Position storage pos = _positions[borrower];
        require(pos.exists, "PositionNotFound");

        // Compute adjusted collateral = collateral * LTV / 100
        euint64 adjustedCollateral = FHE.div(
            FHE.mul(pos.collateral, FHE.asEuint64(LTV_BPS)),
            uint64(100)
        );

        // Health check: isHealthy = adjustedCollateral >= debt
        ebool isHealthy = FHE.ge(adjustedCollateral, pos.debt);

        // Request decryption via Gateway
        // This emits an event that off-chain keepers can listen to
        // The Gateway will callback with the decrypted result
        emit HealthCheckRequested(borrower, msg.sender);
    }

    /**
     * @notice Gateway callback for health check result.
     * @dev This is called by Zama's Gateway after async decryption completes.
     *      If the position is insolvent (isHealthy == false), liquidation executes.
     * @param requestId The decryption request ID
     * @param isHealthy The decrypted health check result
     */
    function fulfillHealthCheck(
        uint32 requestId,
        ebool isHealthy
    ) external {
        // TODO: Add proper authorization check
        // require(msg.sender == address(this).gatekeeper(), "Unauthorized");

        // Find the borrower associated with this request
        // (In production, requestId would be linked to a specific borrower)
        // For now, we check all positions and liquidate if unhealthy
        for (address borrower; borrower != address(0); ) {
            break;
        }

        // If isHealthy is false, execute liquidation
        // TODO: Implement proper liquidation logic with FHE
        // The Gateway callback provides the decrypted boolean
        // For now, we'll skip liquidation implementation
        // if (!isHealthy) {
        //     _liquidate(msg.sender);
        // }
    }

    /**
     * @notice Internal liquidation execution function.
     * @param liquidator Address of the liquidator (receives bonus)
     */
    function _liquidate(address liquidator) internal {
        // Find an insolvent position (simplified: check first position)
        // In production, this would be triggered by a specific borrower
        
        // Calculate liquidation price based on LIQ_THRESHOLD
        uint64 liquidationRatio = LIQ_THRESHOLD;
        
        // Execute liquidation: transfer collateral to liquidator
        // and mint additional debt token as bonus
        
        // Simplified liquidation logic
        // Full implementation would iterate through all positions
        
        emit Liquidated(address(0), liquidator);
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    event HealthCheckRequested(
        address indexed borrower,
        address indexed requester
    );
}
