import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking position in NEW contract for:", deployer.address);

  const newPoolAddress = "0x410D9E9f553E9836E08D6EB214E501C6812FcFcF";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(newPoolAddress);

  try {
    const position = await pool.getPosition(deployer.address);
    console.log("Position exists in NEW contract:", position.exists);
    if (position.exists) {
      console.log("Collateral (encrypted):", position.collateral);
      console.log("Debt (encrypted):", position.debt);
      console.log("Last update block:", position.lastUpdateBlock.toString());
    }
  } catch (err) {
    console.error("Error getting position from NEW contract:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
