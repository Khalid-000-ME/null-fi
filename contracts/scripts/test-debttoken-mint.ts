import { ethers } from "hardhat";

async function main() {
  console.log("Testing debtToken mint...");
  
  const poolAddress = "0x7f0d2b6672257e4370d97842419293B62c39fE91";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);
  
  // Get the debtToken address
  const debtTokenAddress = await pool.debtToken();
  console.log("DebtToken address:", debtTokenAddress);
  
  // Check if we can call mint on debtToken directly
  const NullToken = await ethers.getContractFactory("NullToken");
  const debtToken = NullToken.attach(debtTokenAddress);
  
  try {
    // Try to get token info
    const name = await debtToken.name();
    console.log("Token name:", name);
    
    const totalSupply = await debtToken.totalSupply();
    console.log("Total supply:", totalSupply.toString());
  } catch (err) {
    console.error("Error with debtToken:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
