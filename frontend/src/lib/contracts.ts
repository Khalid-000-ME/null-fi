/**
 * Contract addresses — loaded from environment variables.
 * Set these in .env.local after deploying with `hardhat run scripts/deploy.ts`.
 */
export const CONTRACT_ADDRESSES = {
  nullPool:       process.env.NEXT_PUBLIC_NULL_POOL_ADDRESS       as `0x${string}`,
  nullOracle:     process.env.NEXT_PUBLIC_NULL_ORACLE_ADDRESS     as `0x${string}`,
  nullLiquidator: process.env.NEXT_PUBLIC_NULL_LIQUIDATOR_ADDRESS as `0x${string}`,
  nullToken:      process.env.NEXT_PUBLIC_NULL_TOKEN_ADDRESS      as `0x${string}`,
  collateral:     process.env.NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
} as const;

// ─── NullPool ABI (subset — used in frontend) ────────────────────────────────
export const NULL_POOL_ABI = [
  // deposit(externalEuint64 encAmount, bytes proof)
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  // borrow(externalEuint64 encAmount, bytes proof)
  {
    name: "borrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  // repay(externalEuint64 encAmount, bytes proof)
  {
    name: "repay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  // withdraw(externalEuint64 encAmount, bytes proof)
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
  // requestHealthCheck(address borrower)
  {
    name: "requestHealthCheck",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "borrower", type: "address" }],
    outputs: [],
  },
  // getPosition(address borrower)
  {
    name: "getPosition",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "borrower", type: "address" }],
    outputs: [
      { name: "collateral", type: "uint256" },
      { name: "debt", type: "uint256" },
      { name: "lastUpdateBlock", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
  // Events
  { name: "Deposited", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }] },
  { name: "Borrowed", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }] },
  { name: "Repaid", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }] },
  { name: "Liquidated", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "liquidator", type: "address", indexed: true }] },
  { name: "HealthConfirmed", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }] },
  { name: "HealthCheckRequested", type: "event", inputs: [{ name: "borrower", type: "address", indexed: true }, { name: "requestId", type: "uint256", indexed: false }] },
] as const;

// ─── NullLiquidator ABI ───────────────────────────────────────────────────────
export const NULL_LIQUIDATOR_ABI = [
  {
    name: "triggerHealthCheck",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "borrower", type: "address" }],
    outputs: [],
  },
  {
    name: "LiquidationTriggered",
    type: "event",
    inputs: [
      { name: "caller", type: "address", indexed: true },
      { name: "borrower", type: "address", indexed: true },
      { name: "requestId", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── nETH ABI ────────────────────────────────────────────────
export const MOCK_ERC20_ABI = [
  {
    name: "wrap",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "unwrap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint64" }],
    outputs: [],
  },
  {
    name: "ethWrapped",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// ─── Chain config ─────────────────────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;
export const FHEVM_GATEWAY_URL = process.env.NEXT_PUBLIC_FHEVM_GATEWAY_URL || "https://gateway.sepolia.zama.ai";
