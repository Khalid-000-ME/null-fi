import { ethers } from "hardhat";

async function main() {
  console.log("Testing manual borrow call...");
  
  const [deployer] = await ethers.getSigners();
  const poolAddress = "0x3f38Ea98C15a9B56199FaCd498CC69cD8dceDe4";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress).connect(deployer);
  
  // Check position
  const deployerAddress = "0x1111d87736c9C90Bb9eAE83297BE83ae990699cE";
  const position = await pool.getPosition(deployerAddress);
  console.log("Position exists:", position.exists);
  console.log("Position collateral:", position.collateral);
  
  if (!position.exists) {
    console.log("Creating a position first with a small deposit...");
    
    // We can't easily encrypt from here, so let's just check if the borrow function exists
    const borrowSelector = pool.interface.getFunction("borrow")?.selector;
    console.log("Borrow selector:", borrowSelector);
    
    // Try to call borrow with dummy data to see the exact error
    try {
      const tx = await pool.borrow.populateTransaction(
        "0x" + "00".repeat(64),
        "0x" + "00".repeat(128)
      );
      console.log("Borrow transaction data:", tx.data?.slice(0, 50) + "...");
    } catch (err) {
      console.log("Error creating borrow transaction:", err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
