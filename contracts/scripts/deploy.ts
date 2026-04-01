import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // --- NullOracle ---
  const CHAINLINK_ETH_USD = process.env.CHAINLINK_ETH_USD_FEED || "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const NullOracle = await ethers.getContractFactory("NullOracle");
  const oracle = await NullOracle.deploy(CHAINLINK_ETH_USD);
  await oracle.waitForDeployment();
  console.log("NullOracle deployed:", await oracle.getAddress());

  await sleep(2000); // Rate limit protection

  // --- nUSDC ---
  const nUSDC = await ethers.getContractFactory("nUSDC");
  const nullToken = await nUSDC.deploy();
  await nullToken.waitForDeployment();
  console.log("nUSDC deployed:", await nullToken.getAddress());

  await sleep(2000);

  // --- Collateral Token (nullETH — ConfidentialERC20) ---
  const MockERC20 = await ethers.getContractFactory("nETH");
  const nullETH = await MockERC20.deploy("NullFi ETH", "nullETH");
  await nullETH.waitForDeployment();
  console.log("nullETH deployed:", await nullETH.getAddress());

  await sleep(2000);

  // --- NullPool ---
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = await NullPool.deploy(
    await nullETH.getAddress(),
    await nullToken.getAddress(),
    await oracle.getAddress()
  );
  await pool.waitForDeployment();
  console.log("NullPool deployed:", await pool.getAddress());

  await sleep(2000);

  // --- Link nUSDC to Pool ---
  await nullToken.setPool(await pool.getAddress());
  console.log("nUSDC pool set");

  await sleep(2000);

  // --- NullLiquidator ---
  const NullLiquidator = await ethers.getContractFactory("NullLiquidator");
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei"); // fallback to 20 gwei
  const liquidator = await NullLiquidator.deploy(
    await pool.getAddress(),
    { gasPrice: gasPrice * BigInt(2) } // Double the gas price
  );
  await liquidator.waitForDeployment();
  console.log("NullLiquidator deployed:", await liquidator.getAddress());

  console.log("\n--- COPY TO .env.local ---");
  console.log(`NEXT_PUBLIC_NULL_POOL_ADDRESS=${await pool.getAddress()}`);
  console.log(`NEXT_PUBLIC_NULL_ORACLE_ADDRESS=${await oracle.getAddress()}`);
  console.log(`NEXT_PUBLIC_NULL_LIQUIDATOR_ADDRESS=${await liquidator.getAddress()}`);
  console.log(`NEXT_PUBLIC_NULL_TOKEN_ADDRESS=${await nullToken.getAddress()}`);
  console.log(`NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS=${await nullETH.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
