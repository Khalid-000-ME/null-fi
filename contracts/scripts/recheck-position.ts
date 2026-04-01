import { ethers } from "hardhat";

async function main() {
  const checksummedAddress = "0x1111d87736c9C90Bb9eAE83297BE83ae990699cE";
  console.log("Re-checking position for:", checksummedAddress);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  try {
    const position = await pool.getPosition(checksummedAddress);
    console.log("Position exists:", position.exists);
    console.log("Collateral (encrypted):", position.collateral);
    console.log("Debt (encrypted):", position.debt);
    console.log("Last update block:", position.lastUpdateBlock.toString());
    
    // Also check with lowercase address
    const lowercaseAddress = "0x1111d87736c9c90bb9eae83297be83ae990699ce";
    console.log("\nChecking with lowercase address:", lowercaseAddress);
    const position2 = await pool.getPosition(lowercaseAddress);
    console.log("Position exists with lowercase:", position2.exists);
    
  } catch (err) {
    console.error("Error getting position:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
