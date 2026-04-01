import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking position for:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  try {
    const position = await pool.getPosition(deployer.address);
    console.log("Position exists:", position.exists);
    console.log("Collateral (encrypted):", position.collateral);
    console.log("Debt (encrypted):", position.debt);
    console.log("Last update block:", position.lastUpdateBlock.toString());
  } catch (err) {
    console.error("Error getting position:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
