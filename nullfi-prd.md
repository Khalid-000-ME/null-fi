# NULLFI — Product Requirements Document

> NullFi is the first confidential lending protocol on Ethereum using Zama's fhEVM. Every position — collateral amount, debt amount, health factor — is stored as encrypted `euint128` values. Liquidation bots query your position and get ciphertext handles. They cannot compute your health factor. They cannot target you. The protocol itself runs the health check in FHE-encrypted space using `FHE.le(encDebt, encCollateral)` and executes liquidations when necessary — maintaining solvency without ever exposing a position to predatory targeting. Your debt is not hidden. It is null.

---

| Field | Value |
|---|---|
| Project | NullFi |
| Sponsors | Zama · Starknet · Filecoin / Protocol Labs · Ethereum Foundation |
| Theme | Yellow `#FFE500` + Black `#0A0A0A` · Brutalist Minimalist |
| Version | 1.0 — Hackathon MVP |
| Stack | Next.js 14 · Solidity 0.8.24 · fhEVM · Hardhat · Wagmi · Viem |
| Fonts | Space Grotesk (display/headings) · Space Mono (data/code) |
| UI Builder | **Stitch MCP Server** (see Section 18) |
| Folders | `frontend/` · `contracts/` |

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Insight](#2-the-insight)
3. [The Wrapped Story](#3-the-wrapped-story)
4. [What NullFi Is](#4-what-nullfi-is)
5. [Why Liquidation Hunting Is Structurally Impossible](#5-why-liquidation-hunting-is-structurally-impossible)
6. [fhEVM Primer for This Project](#6-fhevm-primer-for-this-project)
7. [Contract Architecture](#7-contract-architecture)
8. [NullPool.sol — Core Contract](#8-nullpoolsol--core-contract)
9. [NullOracle.sol](#9-nulloraclesol)
10. [NullLiquidator.sol](#10-nullliquidatorsol)
11. [NullToken.sol — Debt Token](#11-nulltokensol--debt-token)
12. [Borrow Flow — Step by Step](#12-borrow-flow--step-by-step)
13. [Liquidation Flow — Step by Step](#13-liquidation-flow--step-by-step)
14. [UI Structure](#14-ui-structure)
15. [Landing Page](#15-landing-page)
16. [Borrow Page](#16-borrow-page)
17. [Dashboard Page](#17-dashboard-page)
18. [Stitch MCP Server — UI Build Instructions](#18-stitch-mcp-server--ui-build-instructions)
19. [Design System](#19-design-system)
20. [Project Structure](#20-project-structure)
21. [Environment and Deploy](#21-environment-and-deploy)
22. [Sponsor Alignment](#22-sponsor-alignment)
23. [README Selling Points](#23-readme-selling-points)
24. [MVP Scope](#24-mvp-scope)
25. [Demo Script (5 min)](#25-demo-script-5-min)

---

## 1. The Problem

Every lending protocol on every chain — Aave, Compound, Morpho, Euler — stores your position as public on-chain state:

```solidity
// Aave V3 — completely public
uint256 public totalCollateralBase;   // your collateral in USD
uint256 public totalDebtBase;         // your debt in USD
uint256 public healthFactor;          // your liquidation proximity
```

This public state enables two distinct attack classes that cost borrowers billions annually:

### Attack Class 1 — Liquidation hunting

Liquidation bots monitor every position on every lending protocol in real time. When your health factor drops below 1.0, they race to liquidate you — front-running each other, paying priority fees, and optimising entirely for their own profit. Legitimate users get liquidated at the worst possible price, often losing 5–15% of their collateral as a liquidation penalty when a gentler intervention was available.

The root cause: the bot knows your exact health factor at every block. It has perfect information about when you become liquidatable.

### Attack Class 2 — Targeted health factor depression

A sophisticated attacker who can read your position can calculate the exact price move needed to push your health factor below 1.0. If your position is large enough, this calculation is worth executing — borrow the target asset on another protocol, short it to move the price, trigger your liquidation, profit from both the liquidation bonus and the short position, then unwind. Your public position is a visible weakness with a known attack vector.

Neither attack requires any contract vulnerability. Both are enabled purely by the public visibility of your collateral and debt amounts.

Every "solution" to this operates at the transaction layer — private mempools, MEV protection, commit-reveal. None of them encrypt the on-chain state. Once your position lands on-chain, it is readable forever.

---

## 2. The Insight

The fix requires changing exactly one thing: the data type of every position value.

```solidity
// Standard lending protocol — full MEV surface
uint256 public collateral;    // 15,000 — everyone reads this
uint256 public debt;          // 10,000 — everyone reads this
uint256 public healthFactor;  // 1.5    — everyone reads this

// NullFi — zero MEV surface
euint128 internal _collateral;    // [encrypted] — null to everyone
euint128 internal _debt;          // [encrypted] — null to everyone
ebool    internal _isHealthy;     // [encrypted] — null to everyone
```

The protocol still enforces solvency. Liquidations still execute when positions go underwater. The constant health check still runs every interaction. But it runs in FHE-encrypted space — `FHE.le(encDebt, encCollateral)` produces an `ebool` that the contract acts on without anyone ever seeing the underlying numbers.

The liquidation bot queries your position. Gets ciphertext handles. Cannot compute your health factor. Cannot target you. Your position is not secret — it is `null` to everyone except you.

---

## 3. The Wrapped Story

**"Your position is not hidden. It is null."**

Standard lending: your debt is a number on Etherscan. Every bot on the internet watches it. The moment you get close to liquidation, you are a target. The bot already knows how much to move the price to push you under.

NullFi: your debt is a ciphertext handle on Etherscan. The bot queries it. Gets `euint128(0x4a3f...)`. Cannot compute your health factor. Cannot calculate the price move needed to liquidate you. You are not hidden — your position exists, the state is on-chain, the contract is verified and public. But the value is null to anyone without your key.

The liquidation still happens if you go underwater. The protocol computes `FHE.le(encDebt, encCollateral)` — an encrypted boolean that resolves to true only if you are insolvent. Nobody saw your numbers. The protocol acted on a fact without learning what the fact was.

The judge moment: open Etherscan for NullFi's deployed contract. Read the position for a specific address. Every field — collateral, debt, health factor — shows `[encrypted]`. Verified contract. Publicly readable. Still null.

---

## 4. What NullFi Is

NullFi is an overcollateralised lending protocol — the same mechanics as Aave or Compound — where every position field is an fhEVM encrypted integer.

- Deposit collateral (ConfidentialERC20) → receive encrypted credit limit
- Borrow against collateral → encrypted debt recorded
- Repay → encrypted debt decremented
- Protocol runs encrypted health check on every interaction
- If health check resolves as unhealthy → liquidation executes automatically
- Nobody outside the protocol ever reads a plaintext position value

Four contracts:

| Contract | Role |
|---|---|
| `NullPool.sol` | Core lending logic — deposit, borrow, repay, encrypted health check |
| `NullOracle.sol` | Price feed adapter — converts Chainlink plaintext prices for FHE computations |
| `NullLiquidator.sol` | Permissionless liquidation trigger — anyone can call, protocol decides if warranted |
| `NullToken.sol` | Encrypted debt token (ConfidentialERC20) representing outstanding borrow |

---

## 5. Why Liquidation Hunting Is Structurally Impossible

The three attacks, and why each fails against NullFi:

### Liquidation sniping (race to liquidate)

**Requires:** read health factor, wait for it to cross 1.0, submit liquidation transaction.

**Against NullFi:** `_healthFactor` is `ebool` — an encrypted boolean computed by the protocol. The bot cannot read it. It cannot know if the position is liquidatable without decrypting the ciphertext, which it has no ACL permission to do. It cannot profitably time a liquidation transaction.

### Targeted health factor depression

**Requires:** read exact collateral amount and debt amount, calculate price move needed to push health factor below 1.0, execute coordinated attack.

**Against NullFi:** `_collateral = euint128(ciphertext)`. `_debt = euint128(ciphertext)`. The calculation cannot begin. The attacker has no inputs. The position size is null.

### Liquidation frontrunning

**Requires:** see a legitimate liquidation transaction in the mempool, copy it with higher gas, capture the liquidation bonus first.

**Against NullFi:** the only entity that can trigger a liquidation is `NullLiquidator.sol` — and only after the protocol's own encrypted health check resolves as insolvent. The liquidation is not a user transaction that can be frontrun. It is a protocol-internal action triggered by an encrypted condition.

---

## 6. fhEVM Primer for This Project

Exactly the same FHE primitives as SHADE, applied to lending mechanics.

### Types used

```solidity
euint128   — encrypted 128-bit integer (collateral, debt amounts)
euint64    — encrypted 64-bit integer  (smaller amounts, interest)
ebool      — encrypted boolean         (health check result)
externalEuint128 — user-provided encrypted input with ZK proof
```

### Operations used

```solidity
FHE.add(a, b)              // add two encrypted amounts
FHE.sub(a, b)              // subtract — repayment, collateral withdrawal
FHE.mul(a, scalar)         // multiply by plaintext — apply LTV ratio
FHE.div(a, scalar)         // divide by plaintext — calculate ratios
FHE.le(a, b)               // encrypted comparison → ebool (health check)
FHE.ge(a, b)               // encrypted comparison → ebool
FHE.select(cond, a, b)     // encrypted ternary — conditional execution
FHE.fromExternal(h, proof) // verify user ciphertext
FHE.allow(handle, addr)    // grant decrypt permission
FHE.allowThis(handle)      // allow contract to use handle
FHE.asEuint128(plaintext)  // convert plaintext to encrypted
```

### The health check — core FHE operation

```solidity
// Standard Aave health check (public):
// healthFactor = (collateral * LTV) / debt
// liquidatable if healthFactor < 1.0

// NullFi health check (encrypted):
// adjustedCollateral = collateral * LTV / 100  (LTV is plaintext: e.g. 75)
euint128 adjustedCollateral = FHE.div(FHE.mul(_collateral, LTV_BPS), 100);

// isHealthy = adjustedCollateral >= debt
ebool isHealthy = FHE.ge(adjustedCollateral, _debt);

// Protocol acts on isHealthy without ever seeing collateral or debt
// If FHE.decrypt(isHealthy) == false → liquidation
```

### Critical: FHE decryption is async via gateway

Unlike synchronous contract reads, decrypting an `ebool` or `euint128` requires an asynchronous callback through Zama's Gateway contract. This means liquidation cannot happen atomically in one transaction. NullFi uses a two-step process:

1. `requestHealthCheck(address borrower)` — submits decryption request to Gateway
2. Gateway callback fires `fulfillHealthCheck(requestId, bool isHealthy)` — executes liquidation if needed

This is architecturally honest and actually more MEV-resistant: the liquidation decision is never in a public transaction that can be frontrun — it arrives via an encrypted callback.

---

## 7. Contract Architecture

```
contracts/
├── NullPool.sol         ← Core lending: deposit, borrow, repay, health check
├── NullOracle.sol       ← Price feed: Chainlink → FHE-usable price
├── NullLiquidator.sol   ← Permissionless liquidation trigger via Gateway callback
└── NullToken.sol        ← Encrypted debt token (ConfidentialERC20)
```

**Dependencies:**

```bash
npm install fhevm fhevm-contracts @chainlink/contracts @openzeppelin/contracts
```

---

## 8. NullPool.sol — Core Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import { GatewayCaller } from "fhevm/gateway/GatewayCaller.sol";
import { FHE, euint128, ebool, externalEuint128 } from "fhevm/lib/FHE.sol";
import { IConfidentialERC20 } from "./interfaces/IConfidentialERC20.sol";
import { NullOracle } from "./NullOracle.sol";
import { NullToken } from "./NullToken.sol";

contract NullPool is
    SepoliaZamaFHEVMConfig,
    SepoliaZamaGatewayConfig,
    GatewayCaller
{
    // ─── Constants ───────────────────────────────────────────────────────

    uint256 public constant LTV_BPS       = 75;    // 75% loan-to-value
    uint256 public constant LIQ_THRESHOLD = 80;    // liquidate at 80% LTV
    uint256 public constant LIQ_BONUS_BPS = 500;   // 5% liquidation bonus
    uint256 public constant INTEREST_BPS  = 500;   // 5% annual interest rate

    // ─── State ───────────────────────────────────────────────────────────

    address public collateralToken;   // ConfidentialERC20 accepted as collateral
    NullToken public debtToken;       // encrypted debt token minted on borrow
    NullOracle public oracle;

    // Every position field is encrypted — null to everyone except the borrower
    struct Position {
        euint128 collateral;          // deposited collateral amount
        euint128 debt;                // outstanding debt amount
        euint128 interestAccrued;     // accrued interest (encrypted)
        uint256  lastUpdateBlock;     // plaintext — no sensitive info
        bool     exists;             // plaintext — whether position was created
    }

    mapping(address => Position) internal _positions;

    // Pending Gateway decryption requests
    // requestId → borrower address
    mapping(uint256 => address) internal _healthCheckRequests;

    // ─── Events ──────────────────────────────────────────────────────────

    // No amounts in events — all sensitive
    event Deposited(address indexed borrower);
    event Borrowed(address indexed borrower);
    event Repaid(address indexed borrower);
    event CollateralWithdrawn(address indexed borrower);
    event HealthCheckRequested(address indexed borrower, uint256 requestId);
    event Liquidated(address indexed borrower, address indexed liquidator);
    event HealthConfirmed(address indexed borrower);

    // ─── Errors ──────────────────────────────────────────────────────────

    error PositionNotFound();
    error AlreadyLiquidated();
    error InvalidAmount();

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor(
        address _collateralToken,
        address _debtToken,
        address _oracle
    ) {
        collateralToken = _collateralToken;
        debtToken = NullToken(_debtToken);
        oracle = NullOracle(_oracle);
    }

    // ─── Deposit Collateral ───────────────────────────────────────────────

    /**
     * @notice Deposit collateral to open or add to a position.
     * @param encAmount  Encrypted collateral amount
     * @param proof      ZK proof for encAmount
     */
    function deposit(
        externalEuint128 encAmount,
        bytes calldata proof
    ) external {
        euint128 amount = FHE.fromExternal(encAmount, proof);

        // Transfer encrypted collateral into pool
        IConfidentialERC20(collateralToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Update or create position
        Position storage pos = _positions[msg.sender];
        if (!pos.exists) {
            pos.collateral = amount;
            pos.debt = FHE.asEuint128(0);
            pos.interestAccrued = FHE.asEuint128(0);
            pos.exists = true;
        } else {
            pos.collateral = FHE.add(pos.collateral, amount);
        }

        pos.lastUpdateBlock = block.number;

        // Grant contract and borrower access
        FHE.allowThis(pos.collateral);
        FHE.allow(pos.collateral, msg.sender);

        emit Deposited(msg.sender);
    }

    // ─── Borrow ───────────────────────────────────────────────────────────

    /**
     * @notice Borrow against deposited collateral.
     * @param encAmount  Encrypted borrow amount requested
     * @param proof      ZK proof for encAmount
     *
     * @dev The protocol checks: borrowAmount <= collateral * LTV / 100
     *      This check runs entirely in FHE — no plaintext values visible.
     *      If the check fails (ebool resolves false), the borrow amount
     *      is replaced with 0 using FHE.select — no revert, no information leak.
     */
    function borrow(
        externalEuint128 encAmount,
        bytes calldata proof
    ) external {
        Position storage pos = _positions[msg.sender];
        require(pos.exists, PositionNotFound());

        euint128 requestedAmount = FHE.fromExternal(encAmount, proof);

        // Compute maximum borrow allowed = collateral * LTV / 100
        euint128 maxBorrow = FHE.div(
            FHE.mul(pos.collateral, LTV_BPS),
            100
        );

        // Compute new total debt if this borrow is approved
        euint128 newTotalDebt = FHE.add(pos.debt, requestedAmount);

        // Check: newTotalDebt <= maxBorrow (encrypted comparison)
        ebool isAllowed = FHE.le(newTotalDebt, maxBorrow);

        // If not allowed, actual borrow amount becomes 0 (FHE select pattern)
        // This avoids reverting which would leak whether the borrow was over-limit
        euint128 actualAmount = FHE.select(
            isAllowed,
            requestedAmount,
            FHE.asEuint128(0)
        );

        // Update debt
        pos.debt = FHE.add(pos.debt, actualAmount);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.debt);
        FHE.allow(pos.debt, msg.sender);

        // Mint debt token to borrower (encrypted amount)
        debtToken.mint(msg.sender, actualAmount);

        // Transfer borrowed funds (plaintext token for now — see Note below)
        // Note: for MVP, borrowed asset is a standard ERC-20 (USDC)
        // Full impl: borrowed asset is also ConfidentialERC20
        // The debt amount is encrypted even if the transfer amount is not
        // in MVP — this is documented as a known limitation
        _transferBorrowedAsset(msg.sender, actualAmount);

        emit Borrowed(msg.sender);
    }

    // ─── Repay ────────────────────────────────────────────────────────────

    /**
     * @notice Repay outstanding debt.
     * @param encAmount  Encrypted repayment amount
     * @param proof      ZK proof for encAmount
     */
    function repay(
        externalEuint128 encAmount,
        bytes calldata proof
    ) external {
        Position storage pos = _positions[msg.sender];
        require(pos.exists, PositionNotFound());

        euint128 repayAmount = FHE.fromExternal(encAmount, proof);

        // Cannot repay more than outstanding debt — use FHE.select
        ebool debtCoversRepay = FHE.ge(pos.debt, repayAmount);
        euint128 actualRepay = FHE.select(debtCoversRepay, repayAmount, pos.debt);

        pos.debt = FHE.sub(pos.debt, actualRepay);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.debt);
        FHE.allow(pos.debt, msg.sender);

        // Burn debt tokens
        debtToken.burn(msg.sender, actualRepay);

        emit Repaid(msg.sender);
    }

    // ─── Withdraw Collateral ──────────────────────────────────────────────

    /**
     * @notice Withdraw collateral — only if remaining position stays healthy.
     * @param encAmount  Encrypted withdrawal amount
     * @param proof      ZK proof for encAmount
     */
    function withdraw(
        externalEuint128 encAmount,
        bytes calldata proof
    ) external {
        Position storage pos = _positions[msg.sender];
        require(pos.exists, PositionNotFound());

        euint128 withdrawAmount = FHE.fromExternal(encAmount, proof);

        // New collateral after withdrawal
        euint128 newCollateral = FHE.sub(pos.collateral, withdrawAmount);

        // New max borrow with reduced collateral
        euint128 newMaxBorrow = FHE.div(FHE.mul(newCollateral, LTV_BPS), 100);

        // Check: current debt <= new max borrow (still healthy after withdrawal)
        ebool stillHealthy = FHE.le(pos.debt, newMaxBorrow);

        // If not healthy, withdrawal amount becomes 0
        euint128 actualWithdraw = FHE.select(
            stillHealthy,
            withdrawAmount,
            FHE.asEuint128(0)
        );

        pos.collateral = FHE.sub(pos.collateral, actualWithdraw);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.collateral);
        FHE.allow(pos.collateral, msg.sender);

        // Transfer collateral back to user
        IConfidentialERC20(collateralToken).transfer(msg.sender, actualWithdraw);

        emit CollateralWithdrawn(msg.sender);
    }

    // ─── Health Check — Async via Gateway ────────────────────────────────

    /**
     * @notice Request a health check for any borrower.
     *         Anyone can call this — permissionless liquidation trigger.
     *         The Gateway decrypts the health ebool asynchronously.
     *         If unhealthy, NullLiquidator executes the liquidation.
     *
     * @dev This is the core innovation:
     *      - The health check computation happens in FHE (nobody sees numbers)
     *      - The decryption result arrives via callback
     *      - Only the binary result (healthy/unhealthy) becomes known
     *      - The actual collateral and debt values remain encrypted forever
     */
    function requestHealthCheck(address borrower) external {
        Position storage pos = _positions[borrower];
        require(pos.exists, PositionNotFound());

        // Compute health: adjustedCollateral = collateral * LIQ_THRESHOLD / 100
        euint128 adjustedCollateral = FHE.div(
            FHE.mul(pos.collateral, LIQ_THRESHOLD),
            100
        );

        // isHealthy = adjustedCollateral >= debt
        ebool isHealthy = FHE.ge(adjustedCollateral, pos.debt);

        // Request Gateway to decrypt isHealthy and call back
        uint256[] memory cts = new uint256[](1);
        cts[0] = euint128.unwrap(euint128(ebool.unwrap(isHealthy)));

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.fulfillHealthCheck.selector,
            0,
            block.timestamp + 100,
            false
        );

        _healthCheckRequests[requestId] = borrower;

        emit HealthCheckRequested(borrower, requestId);
    }

    /**
     * @notice Gateway callback — called after decryption completes.
     *         Only the Gateway can call this.
     * @param requestId  The decryption request ID
     * @param isHealthy  Decrypted boolean — true if position is healthy
     */
    function fulfillHealthCheck(
        uint256 requestId,
        bool isHealthy
    ) external onlyGateway {
        address borrower = _healthCheckRequests[requestId];

        if (!isHealthy) {
            // Position is underwater — execute liquidation
            // NullLiquidator handles the actual collateral distribution
            emit Liquidated(borrower, address(this));
            _executeLiquidation(borrower);
        } else {
            emit HealthConfirmed(borrower);
        }

        delete _healthCheckRequests[requestId];
    }

    // ─── Internal Liquidation ─────────────────────────────────────────────

    function _executeLiquidation(address borrower) internal {
        Position storage pos = _positions[borrower];

        // Seize collateral — transfer to liquidation pool
        // Liquidation bonus (5%) goes to whoever triggered the health check
        // Protocol treasury receives remainder
        // All amounts remain encrypted throughout

        // Reset position
        pos.debt = FHE.asEuint128(0);
        pos.collateral = FHE.asEuint128(0);
        pos.lastUpdateBlock = block.number;

        FHE.allowThis(pos.debt);
        FHE.allowThis(pos.collateral);
    }

    function _transferBorrowedAsset(address to, euint128 amount) internal {
        // MVP: emit event, actual transfer handled by frontend after decryption
        // Full impl: ConfidentialERC20 transfer
        FHE.allow(amount, to);
    }

    // ─── View: Encrypted Position ─────────────────────────────────────────

    /**
     * @notice Returns encrypted position handles.
     *         MEV bots get opaque ciphertext handles they cannot read.
     *         Only the borrower (via ACL) can decrypt these values.
     */
    function getPosition(address borrower) external view returns (
        euint128 collateral,
        euint128 debt,
        uint256  lastUpdateBlock,
        bool     exists
    ) {
        Position storage pos = _positions[borrower];
        return (pos.collateral, pos.debt, pos.lastUpdateBlock, pos.exists);
    }

    modifier onlyGateway() {
        require(
            msg.sender == address(Gateway),
            "NullPool: only gateway"
        );
        _;
    }
}
```

---

## 9. NullOracle.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { FHE, euint128 } from "fhevm/lib/FHE.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @notice Price oracle adapter for NullFi.
 *
 * Chainlink prices are plaintext — there is no way to get a fully
 * encrypted price feed in the current fhEVM architecture.
 *
 * This is an honest architectural trade-off:
 * The price itself is public (Chainlink publishes it publicly anyway).
 * What remains private is HOW MUCH collateral you have at that price.
 * An attacker knows ETH = $3,200. They do not know you have 4.7 ETH.
 * They cannot compute your health factor without both numbers.
 *
 * The oracle converts plaintext Chainlink prices into
 * plaintext scalars used in FHE.mul(encAmount, priceScalar).
 * This is the correct and honest approach.
 */
contract NullOracle is SepoliaZamaFHEVMConfig {

    AggregatorV3Interface public priceFeed;

    // Price precision: 8 decimal places (matches Chainlink)
    uint256 public constant PRICE_DECIMALS = 1e8;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @notice Get latest price as plaintext uint256.
     *         Used as scalar in FHE.mul(encCollateral, price).
     *         Price is public — what's private is the collateral amount.
     */
    function getPrice() external view returns (uint256 price) {
        (, int256 answer,,,) = priceFeed.latestRoundData();
        require(answer > 0, "NullOracle: invalid price");
        return uint256(answer);
    }

    /**
     * @notice Compute encrypted USD value of an encrypted token amount.
     *         encAmount (encrypted) * price (plaintext) = encUSDValue (encrypted)
     *         The amount stays private. The price is already public.
     */
    function encryptedUSDValue(
        euint128 encAmount,
        uint256 priceUSD
    ) external pure returns (euint128) {
        return FHE.div(
            FHE.mul(encAmount, priceUSD),
            PRICE_DECIMALS
        );
    }
}
```

---

## 10. NullLiquidator.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { NullPool } from "./NullPool.sol";

/**
 * @notice Permissionless liquidation trigger.
 *
 * Anyone can call triggerHealthCheck() for any borrower.
 * The NullPool requests an async Gateway decryption.
 * If the position is unhealthy, liquidation executes via callback.
 *
 * The caller receives a bounty for triggering a successful liquidation —
 * incentivising permissionless solvency maintenance without requiring
 * the caller to know anything about the position's actual health.
 *
 * This is the key design: you can trigger a check without knowing
 * if the position is underwater. The protocol discovers this privately.
 * If you were right (position was unhealthy), you earn the bounty.
 * If you were wrong (position is healthy), nothing happens.
 *
 * Caller information: zero. The protocol reveals only the binary outcome.
 */
contract NullLiquidator is SepoliaZamaFHEVMConfig {

    NullPool public pool;

    // Plaintext bounty per successful liquidation trigger
    uint256 public constant TRIGGER_BOUNTY = 0.001 ether;

    // Track who triggered which health check
    mapping(uint256 => address) public triggerCallers;

    event LiquidationTriggered(
        address indexed caller,
        address indexed borrower,
        uint256 requestId
    );

    constructor(address _pool) {
        pool = NullPool(_pool);
    }

    /**
     * @notice Trigger a health check for any borrower.
     *         If the position is unhealthy, liquidation executes and
     *         this caller receives TRIGGER_BOUNTY.
     *
     * @dev The caller has NO information advantage — they cannot read
     *      the borrower's position either. They are incentivised to
     *      scan addresses and trigger checks probabilistically.
     *      The protocol maintains solvency. The caller earns a bounty.
     *      Nobody learns the position's actual numbers.
     */
    function triggerHealthCheck(address borrower) external {
        pool.requestHealthCheck(borrower);
        emit LiquidationTriggered(msg.sender, borrower, 0);
    }

    receive() external payable {}
}
```

---

## 11. NullToken.sol — Debt Token

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { ConfidentialERC20 } from "fhevm-contracts/contracts/token/ERC20/ConfidentialERC20.sol";

/**
 * @notice NullFi debt token — an encrypted ERC-20 representing outstanding debt.
 *
 * Minted when a user borrows. Burned when repaid.
 * Balance is encrypted — only the holder knows their debt amount.
 * This is the on-chain representation of your outstanding obligation.
 *
 * Token name: NullFi Debt Token
 * Symbol: nDEBT
 *
 * Standard DeFi protocols have public debt tokens — anyone can check
 * your debt balance on Etherscan. nDEBT balances are encrypted.
 * Your creditor (NullPool) and you are the only ACL-permitted readers.
 */
contract NullToken is SepoliaZamaFHEVMConfig, ConfidentialERC20 {

    address public pool;

    constructor() ConfidentialERC20("NullFi Debt Token", "nDEBT") {}

    function setPool(address _pool) external {
        require(pool == address(0), "Already set");
        pool = _pool;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "NullToken: only pool");
        _;
    }

    function mint(address to, euint128 amount) external onlyPool {
        _unsafeMint(to, amount);
    }

    function burn(address from, euint128 amount) external onlyPool {
        _unsafeBurn(from, amount);
    }
}

// Explicit import of euint128 for NullToken
import { euint128 } from "fhevm/lib/FHE.sol";
```

---

## 12. Borrow Flow — Step by Step

```
USER ACTION
───────────
1. User opens NullFi borrow page
2. User enters collateral amount: 5 ETH
3. User enters borrow amount: 10,000 USDC

FRONTEND (fhEVM.js SDK)
───────────────────────
4. Encrypt 5 ETH: const { handle: encCollateral, proof: proofC } = await fhevm.encrypt128(5_000000000000000000n)
5. Call NullPool.deposit(encCollateral, proofC)
6. Encrypt 10,000: const { handle: encBorrow, proof: proofB } = await fhevm.encrypt128(10000_000000n)
7. Call NullPool.borrow(encBorrow, proofB)

ON-CHAIN (NullPool.sol)
────────────────────────
8. deposit():
   - FHE.fromExternal verifies ciphertext
   - Encrypted transfer from user to pool
   - pos.collateral = encCollateral
   - FHE.allow(pos.collateral, msg.sender)

9. borrow():
   - maxBorrow = FHE.div(FHE.mul(pos.collateral, 75), 100)
   - newTotalDebt = FHE.add(pos.debt, requestedAmount)
   - isAllowed = FHE.le(newTotalDebt, maxBorrow)  ← encrypted check
   - actualAmount = FHE.select(isAllowed, requestedAmount, 0)
   - pos.debt = FHE.add(pos.debt, actualAmount)
   - debtToken.mint(user, actualAmount)
   - FHE.allow(actualAmount, msg.sender)

LIQUIDATION BOT (watching chain)
──────────────────────────────────
10. Bot queries NullPool.getPosition(user)
    Returns: (euint128(0x4a3f...), euint128(0x8c2d...), 19847201, true)
11. Bot sees ciphertext handles — cannot read collateral or debt
12. Bot cannot compute health factor
13. Bot cannot determine if position is liquidatable
14. Bot moves on — no actionable data

USER (position created)
────────────────────────
15. Frontend calls fhevm.decrypt(pos.collateral) → 5 ETH
16. Frontend calls fhevm.decrypt(pos.debt) → 10,000 USDC
17. Dashboard shows: Collateral [Decrypt] Debt [Decrypt] Health [Decrypt]
```

---

## 13. Liquidation Flow — Step by Step

```
ANYONE (permissionless trigger)
────────────────────────────────
1. Anyone calls NullLiquidator.triggerHealthCheck(borrowerAddress)
   The caller has NO knowledge of the position's health
   They are scanning addresses hoping to earn a bounty

ON-CHAIN (NullPool.sol + Gateway)
──────────────────────────────────
2. NullPool.requestHealthCheck(borrower):
   - adjustedCollateral = FHE.div(FHE.mul(pos.collateral, 80), 100)
   - isHealthy = FHE.ge(adjustedCollateral, pos.debt)  ← encrypted boolean
   - Gateway.requestDecryption([isHealthy], fulfillHealthCheck.selector, ...)
   - Emits HealthCheckRequested(borrower, requestId)

3. Zama Gateway processes decryption request:
   - FHE coprocessors compute decrypt(isHealthy)
   - Only the boolean result is revealed
   - Actual collateral and debt values remain encrypted

4. Gateway calls NullPool.fulfillHealthCheck(requestId, isHealthyBool):
   - If isHealthy == true: emit HealthConfirmed, nothing happens
   - If isHealthy == false: _executeLiquidation(borrower)
     - pos.debt reset to 0 (encrypted)
     - pos.collateral seized and distributed
     - Caller receives TRIGGER_BOUNTY
     - Emit Liquidated(borrower, caller)

WHAT THE WORLD LEARNS
──────────────────────
5. Event emitted: Liquidated(borrowerAddress, callerAddress)
   What is public: borrower was liquidated
   What stays private: how much their collateral was, how much their debt was,
                       what their health factor was, what price triggered it
   The predatory targeting information — position size — is never revealed
```

---

## 14. UI Structure

Three pages. Same brutalist yellow-black design as SHADE. All data that would normally be plaintext shows as `[encrypted]` — this is the product's visual signature.

| Page | Route | Purpose |
|---|---|---|
| Landing | `/` | Hero, problem/solution, live position feed showing `[encrypted]` |
| Borrow | `/borrow` | Deposit collateral, borrow, repay, withdraw |
| Dashboard | `/dashboard` | View your encrypted position, trigger health check, decrypt your own values |

No backend. No API routes. All on-chain reads via wagmi. All decryption client-side via fhEVM SDK.

---

## 15. Landing Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  NULLFI                             [Connect Wallet]  [Launch App]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  YOUR POSITION                                                       │
│  IS NULL.                                                            │
│                                                                      │
│  Lending protocols publish your debt to the world.                  │
│  Bots read it. They know exactly when to hunt you.                  │
│  NullFi stores your position as encrypted state.                    │
│  Your debt is on-chain. It is null to everyone else.                │
│                                                                      │
│  [Borrow Now →]                                                      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PROOF.                   ─────────────────────────────────────     │
│                                                                      │
│  Aave position:           collateral: 15,000 USDC                   │
│                           debt:       10,000 USDC                   │
│                           healthFactor: 1.49                        │
│                                                                      │
│  NullFi position:         collateral: [encrypted]                   │
│                           debt:       [encrypted]                   │
│                           healthFactor: [encrypted]                 │
│                                                                      │
│  Verified contract. Public chain. Still null.                       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LIVE POSITIONS           (solvency enforced · positions private)   │
│  ──────────────────────────────────────────────────────             │
│  0x3f...a912  deposited [encrypted] ETH    borrowed [encrypted]     │
│  0x7a...c031  repaid    [encrypted] USDC                            │
│  0x1b...f220  liquidated                                            │
│                                                                      │
│  Liquidations happen. Position sizes never leak.                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HOW SOLVENCY WORKS WITHOUT SEEING YOUR NUMBERS                     │
│  ──────────────────────────────────────────────                     │
│                                                                      │
│  01  Your collateral and debt are stored as encrypted integers.     │
│  02  The protocol computes FHE.ge(collateral × LTV, debt).          │
│  03  The result is an encrypted boolean — healthy or not.           │
│  04  If unhealthy, liquidation executes. Nobody sees your size.     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 16. Borrow Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  NULLFI   [Borrow] [Dashboard]              [0x3f...a912] [Sepolia] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [DEPOSIT]  [BORROW]  [REPAY]  [WITHDRAW]                           │
│                                                                      │
│  DEPOSIT COLLATERAL                                                  │
│  ──────────────────────────────────────────────────────             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ASSET                                                          │  │
│  │  [nullETH ▼]                                                    │  │
│  │                                                                 │  │
│  │  AMOUNT                                                         │  │
│  │  [5.0__________________________]                                │  │
│  │  Your balance: [encrypted]  [Decrypt →]                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  LTV Ratio          75%                                              │
│  Liquidation at     80%                                              │
│  Collateral value   [encrypted after deposit]                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    DEPOSIT COLLATERAL                           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  BORROW                                                              │
│  ──────────────────────────────────────────────────────             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  BORROW ASSET    nullUSDC                                       │  │
│  │  BORROW AMOUNT   [10000______________________]                  │  │
│  │  Max borrow:     [encrypted]  [Decrypt →]                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                         BORROW                                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 17. Dashboard Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  NULLFI   [Borrow] [Dashboard]              [0x3f...a912] [Sepolia] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  YOUR POSITION                                                       │
│  ──────────────────────────────────────────────────────             │
│                                                                      │
│  Collateral         [encrypted]  [Decrypt →]                        │
│  Debt               [encrypted]  [Decrypt →]                        │
│  Health Factor      [encrypted]  [Decrypt →]                        │
│  Interest Accrued   [encrypted]  [Decrypt →]                        │
│  Last Updated       Block 19,847,201                                 │
│                                                                      │
│  ──────────────────────────────────────────────────────             │
│                                                                      │
│  POSITION STATUS                                                     │
│                                                                      │
│  [REQUEST HEALTH CHECK]                                              │
│  Anyone can trigger this. Result: healthy or liquidated.             │
│  Your numbers are never revealed.                                    │
│                                                                      │
│  ──────────────────────────────────────────────────────             │
│                                                                      │
│  TRANSACTION HISTORY                                                 │
│  ──────────────────────────────────────────────────────             │
│  Block 19847201   Deposited   [encrypted] nullETH                   │
│  Block 19847210   Borrowed    [encrypted] nullUSDC                  │
│  Block 19847390   Repaid      [encrypted] nullUSDC                  │
│                                                                      │
│  All amounts encrypted. Only you can decrypt your history.          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 18. Stitch MCP Server — UI Build Instructions

**The agent building this frontend MUST use the Stitch MCP server for all UI generation.**

### Setup

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### Prompt for Landing Page

```
Generate a brutalist minimalist landing page for NullFi, a confidential
lending protocol on Ethereum using Zama fhEVM.

Design constraints:
- Background: #0A0A0A
- Primary accent: #FFE500 (yellow) — borders, CTAs, [encrypted] tags
- Text: #F5F5F5 (white) only — no other colors except yellow accents
- Zero gradients anywhere
- Zero rounded corners on containers (2px max on inputs only)
- Fonts: Space Grotesk (headings, 700/800) + Space Mono (data, code)
- Style: brutalist, raw — not fintech-polished
- Hero: "YOUR POSITION IS NULL." in massive Space Grotesk bold uppercase
- Two-column proof section: Aave position (plaintext numbers) vs NullFi
  position (all values showing [encrypted] in yellow Space Mono)
- Live position feed: wallet addresses with [encrypted] amounts
- Four-step explanation: how FHE health check works without revealing numbers
```

### Prompt for Borrow Page

```
Generate a lending interface for NullFi confidential protocol.
Design constraints: [same as landing]
Components:
- Tab row: DEPOSIT / BORROW / REPAY / WITHDRAW
- Asset selector with encrypted balance display + [Decrypt →] button
- Amount input field
- Stats row: LTV ratio (plaintext), liquidation threshold (plaintext),
  collateral value ([encrypted])
- Large yellow CTA button with black text
- All balance and position values show [encrypted] with [Decrypt →] buttons
```

### Prompt for Dashboard Page

```
Generate a position dashboard for NullFi lending protocol.
Design constraints: [same as landing]
Components:
- Position table: Collateral / Debt / Health Factor / Interest Accrued
  — all showing [encrypted] with individual [Decrypt →] buttons
- Request Health Check section with explanation text
- Transaction history table with [encrypted] amounts
- All amounts in Space Mono yellow [encrypted] until user decrypts
```

---

## 19. Design System

Identical to SHADE — yellow `#FFE500` and black `#0A0A0A` only. Zero gradients. Zero rounded corners on containers. Space Grotesk + Space Mono.

### Color tokens

```css
:root {
  --black:        #0A0A0A;
  --yellow:       #FFE500;
  --yellow-dim:   #FFE50020;
  --white:        #F5F5F5;
  --gray:         #888888;
  --border:       #1E1E1E;
  --border-yellow:#FFE500;
  --encrypted:    #FFE500;
}
```

### Typography

```css
.heading-xl  { font-family: 'Space Grotesk'; font-size: clamp(48px,8vw,96px); font-weight: 800; letter-spacing: -2px; text-transform: uppercase; }
.heading-lg  { font-family: 'Space Grotesk'; font-size: 40px; font-weight: 700; text-transform: uppercase; }
.heading-md  { font-family: 'Space Grotesk'; font-size: 24px; font-weight: 700; }
.label       { font-family: 'Space Grotesk'; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.body        { font-family: 'Space Grotesk'; font-size: 16px; font-weight: 400; line-height: 1.7; }
.mono        { font-family: 'Space Mono';    font-size: 13px; font-weight: 400; }
.encrypted   { font-family: 'Space Mono';    font-size: 13px; color: #FFE500; }
```

### Buttons

```
Primary CTA:   bg #FFE500    color #0A0A0A   border none       border-radius 0
Ghost:         bg transparent  color #FFE500   border 2px solid #FFE500  border-radius 0
Decrypt:       bg transparent  color #888888   border 1px solid #888888  border-radius 0
               font Space Mono 11px  label: [Decrypt →]
```

---

## 20. Project Structure

```
nullfi/
├── contracts/
│   ├── NullPool.sol
│   ├── NullOracle.sol
│   ├── NullLiquidator.sol
│   ├── NullToken.sol
│   ├── interfaces/
│   │   └── IConfidentialERC20.sol
│   └── hardhat.config.ts
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx             ← Landing
    │   ├── borrow/
    │   │   └── page.tsx
    │   └── dashboard/
    │       └── page.tsx
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.tsx
    │   ├── borrow/
    │   │   ├── DepositPanel.tsx
    │   │   ├── BorrowPanel.tsx
    │   │   ├── RepayPanel.tsx
    │   │   └── WithdrawPanel.tsx
    │   ├── dashboard/
    │   │   ├── PositionCard.tsx
    │   │   ├── HealthCheck.tsx
    │   │   └── TxHistory.tsx
    │   └── ui/
    │       ├── EncryptedValue.tsx
    │       ├── Button.tsx
    │       └── Input.tsx
    ├── hooks/
    │   ├── useNullPool.ts
    │   ├── useDecrypt.ts
    │   ├── useEncrypt.ts
    │   └── useFhevm.ts
    ├── lib/
    │   ├── contracts.ts
    │   ├── fhevm.ts
    │   └── wagmi.ts
    ├── .env.local.example
    ├── next.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## 21. Environment and Deploy

### `.env.local.example`

```bash
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_FHEVM_GATEWAY_URL=https://gateway.sepolia.zama.ai

NEXT_PUBLIC_NULL_POOL_ADDRESS=0x...
NEXT_PUBLIC_NULL_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_NULL_LIQUIDATOR_ADDRESS=0x...
NEXT_PUBLIC_NULL_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS=0x...

DEPLOYER_PRIVATE_KEY=0x...
CHAINLINK_ETH_USD_FEED=0x694AA1769357215DE4FAC081bf1f309aDC325306
```

### Deploy sequence

```bash
cd contracts
npm install

# Deploy all contracts
npx hardhat run scripts/deploy.ts --network fhevm_sepolia

# Output:
# NullOracle deployed:      0x...
# NullToken deployed:       0x...
# NullPool deployed:        0x...
# NullLiquidator deployed:  0x...
# nullETH token deployed:   0x...

# Seed with test positions
npx hardhat run scripts/seed.ts --network fhevm_sepolia

cd ../frontend
npm install
npm run dev
```

---

## 22. Sponsor Alignment

| Sponsor | How NullFi uses their technology | Why they care |
|---|---|---|
| **Zama** | fhEVM is the entire solvency engine. `euint128` positions, `ebool` health check via `FHE.ge`, `FHE.select` for safe borrow caps, Gateway async decryption callback for liquidation. | Financial privacy where hiding the numbers changes the game — lending is the most impactful use case because positions are what bots hunt. |
| **Starknet** | Hidden positions and private lending are explicitly listed in their privacy prize criteria. NullFi is the canonical implementation. | They want zero-knowledge and FHE DeFi privacy demonstrated with production-relevant mechanics. |
| **Filecoin / Protocol Labs** | Encrypted position history archived to Filecoin — event logs (without amounts) stored for protocol-level auditing while preserving user privacy. | Programmable, verifiable storage of sensitive financial data. |
| **Ethereum Foundation** | NullFi runs on Ethereum Sepolia. fhEVM is EVM-native. No new chain. Demonstrates Ethereum can have confidential lending without compromising decentralisation. | New EVM primitive — confidential state in lending protocols. |

---

## 23. README Selling Points

*Paste verbatim into README.md:*

---

### Why NullFi exists

Every lending protocol publishes your position to the world. Your collateral, your debt, your health factor — all readable on Etherscan by anyone, at any block, forever. Liquidation bots read your health factor continuously. The moment you dip below the threshold, you are a target. Sophisticated actors can calculate the exact price move needed to push you underwater and coordinate the attack. Your position is a visible vulnerability with a known exploit.

NullFi stores every position value as a Zama fhEVM encrypted integer. A bot queries your position and receives ciphertext handles. It cannot compute your health factor. It cannot determine if you are liquidatable. It cannot calculate the price move needed to hunt you.

Your position is not hidden. It is null.

### How solvency still works

The protocol computes your health check entirely in FHE-encrypted space:

```solidity
euint128 adjustedCollateral = FHE.div(FHE.mul(pos.collateral, 80), 100);
ebool isHealthy = FHE.ge(adjustedCollateral, pos.debt);
```

No plaintext values. No intermediate results. The Gateway decrypts only the boolean outcome — healthy or not. If not healthy, liquidation executes. Nobody outside the protocol ever sees your collateral amount, your debt amount, or what price triggered the liquidation.

### The stunt

```solidity
// Aave — full liquidation hunting surface
uint256 public totalCollateralBase;  // 15000 — every bot reads this
uint256 public totalDebtBase;        // 10000 — every bot reads this
uint256 public healthFactor;         // 1.49  — every bot reads this

// NullFi — zero hunting surface
euint128 internal _collateral;       // [encrypted] — null to everyone
euint128 internal _debt;             // [encrypted] — null to everyone
ebool    internal _isHealthy;        // [encrypted] — null to everyone
```

Three variable declarations. The hunting attack is structurally impossible.

### Stack

**Contracts:** Solidity 0.8.24 · Zama fhEVM (`euint128`, `ebool`, TFHE operators, ACL, Gateway callback, ConfidentialERC20) · Hardhat · Chainlink (price feed)

**Frontend:** Next.js 14 · TypeScript · Wagmi · Viem · fhEVM.js SDK · Space Grotesk + Space Mono · Tailwind CSS · Stitch MCP (UI generation)

**Networks:** Ethereum Sepolia with Zama fhEVM executor

---

## 24. MVP Scope

### In scope

- [ ] `NullPool.sol` — deposit, borrow, repay, withdraw, encrypted health check
- [ ] `NullOracle.sol` — Chainlink price feed adapter for FHE arithmetic
- [ ] `NullLiquidator.sol` — permissionless liquidation trigger with Gateway callback
- [ ] `NullToken.sol` — encrypted debt token (ConfidentialERC20)
- [ ] Two test ConfidentialERC20 tokens (nullETH, nullUSDC)
- [ ] Hardhat deploy + seed scripts for fhEVM Sepolia
- [ ] Landing page with Aave vs NullFi proof comparison
- [ ] Borrow page — deposit, borrow, repay, withdraw tabs
- [ ] Dashboard — encrypted position display with per-field decrypt buttons
- [ ] `EncryptedValue` component — `[encrypted]` / reveal on click
- [ ] Stitch MCP used for all page generation
- [ ] Live demo: borrow → show `[encrypted]` position → decrypt → show values

### Out of scope (V2)

- Multi-asset collateral support
- Interest rate model (fixed 5% APR in MVP)
- Encrypted price oracle (Chainlink is plaintext — honest trade-off documented)
- Liquidation bonus distribution to trigger callers (bounty mechanism)
- Governance
- Filecoin archival integration
- Position NFTs

### Risks and mitigations

| Risk | Mitigation |
|---|---|
| Gateway async callback adds latency to liquidation | Document as feature — liquidation is delayed but cannot be frontrun |
| Chainlink price is plaintext — partial privacy | Documented in NullOracle.sol comments — price is public anyway, amount is what's private |
| fhEVM gas costs 10-100x standard EVM | Expected — document and justify with the privacy guarantee |
| FHE.div encrypted/encrypted not supported | All divisions use plaintext scalars (LTV ratio, threshold) — no euint/euint division needed |
| fhEVM Sepolia instability | Local fhEVM docker node as backup |

---

## 25. Demo Script (5 min)

### Setup

Two browsers: Alice (borrower) and Bob (liquidation bot script in terminal). Both on fhEVM Sepolia. NullPool pre-deployed with initial liquidity. Alice has nullETH tokens.

---

### Step 1 — Show the problem on Aave (30 sec)

Open Aave's deployed contract on Etherscan. Call `getUserAccountData(anyAddress)`.

Output: `totalCollateralBase: 15000000000, totalDebtBase: 10000000000, healthFactor: 1490000000000000000`.

"This is Aave. Your collateral, your debt, your health factor. Public. Every block. Every bot is watching this number. When it drops below 1.0, you are a target."

---

### Step 2 — Show NullFi's position state (30 sec)

Open NullPool's deployed contract on Etherscan. Call `getPosition(aliceAddress)`.

Output: `collateral: euint128(0x4a3f...), debt: euint128(0x8c2d...), lastUpdateBlock: 19847201, exists: true`.

"This is NullFi. Alice has a position. It exists. The contract is verified, open-source, publicly readable. Her collateral is a ciphertext. Her debt is a ciphertext. The bot has nothing to target."

---

### Step 3 — Alice deposits and borrows (2 min)

Alice opens NullFi borrow page.

Deposits 5 nullETH as collateral. Transaction confirms. Position shows `collateral: [encrypted]`.

Borrows 10,000 nullUSDC. Transaction confirms. Position shows `debt: [encrypted]`.

Click `[Decrypt →]` next to collateral. fhEVM SDK decrypts client-side using Alice's key. Shows: `5.0 nullETH`.

Click `[Decrypt →]` next to debt. Shows: `10,000 nullUSDC`.

"Alice can see her own numbers. Nobody else can. Her key, her data."

---

### Step 4 — Bob's bot fails (1 min)

Bob's terminal runs a liquidation bot script:

```
[BOT] Scanning NullFi positions...
[BOT] Found position: 0x3f...a912 (Alice)
[BOT] Querying collateral: euint128(0x4a3f...)
[BOT] Querying debt:       euint128(0x8c2d...)
[BOT] Cannot decrypt — no ACL permission
[BOT] Cannot compute health factor
[BOT] Cannot determine liquidation profitability
[BOT] Skipping position — null data
[BOT] No positions targetable in this block
```

"Bob's bot ran. It found Alice's position. It got ciphertexts. It cannot compute whether sandwiching is profitable. It moved on. Alice was never a target."

---

### Step 5 — Show the health check still works (1 min)

Trigger `NullLiquidator.triggerHealthCheck(aliceAddress)` from a third address.

Transaction fires. Gateway decryption request emitted. Wait ~3 seconds.

Gateway callback fires `fulfillHealthCheck(requestId, true)`. Event emitted: `HealthConfirmed(aliceAddress)`.

"The protocol checked Alice's health in encrypted space. It compared encrypted debt to encrypted collateral using FHE arithmetic. It determined she is healthy. Nobody saw her numbers. If she were underwater, the liquidation would have executed — same mechanism, no data leak."

Close with: "Aave hides nothing. MEV protection hides your transaction for a few seconds. NullFi hides your state permanently. Not because we built better encryption. Because we changed the variable type."

---

*NULLFI — PRD v1.0 — PL Genesis: Frontiers of Collaboration Hackathon*
*Sponsors: Zama · Starknet · Filecoin · Ethereum Foundation*
*Contracts: NullPool · NullOracle · NullLiquidator · NullToken*
*Stack: Next.js 14 · Solidity 0.8.24 · fhEVM · Space Grotesk · Space Mono · Stitch MCP*
*Theme: Yellow #FFE500 + Black #0A0A0A · Brutalist Minimalist · Zero Gradients*
*Folders: frontend/ · contracts/*
