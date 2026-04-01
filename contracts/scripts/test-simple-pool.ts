import { ethers } from "hardhat";

async function main() {
  console.log("Testing the deployed NullPool...");
  
  const poolAddress = "0xbCC1b5e4f44970780ACf6b43ACa6536003EC12b3";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);
  
  // Test basic functions
  try {
    const ltv = await pool.LTV_BPS();
    console.log("✓ LTV_BPS:", ltv.toString());
    
    const collateral = await pool.collateralToken();
    console.log("✓ Collateral token:", collateral);
    
    const debtToken = await pool.debtToken();
    console.log("✓ Debt token:", debtToken);
    
    // Test getPosition with deployer address
    const deployerAddress = "0x1111d87736c9C90Bb9eAE83297BE83ae990699cE";
    const position = await pool.getPosition(deployerAddress);
    console.log("✓ Position exists:", position.exists);
    
    // If position doesn't exist, try to create one with deposit
    if (!position.exists) {
      console.log("Position doesn't exist, need to deposit first");
    }
    
  } catch (err) {
    console.error("✗ Error testing contract:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
