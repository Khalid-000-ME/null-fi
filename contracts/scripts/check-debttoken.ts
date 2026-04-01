import { ethers } from "hardhat";

async function main() {
  console.log("Checking debtToken contract...");
  
  const poolAddress = "0x961c5Bcc8421D93C40D19Ac040d8e58d95cAedd3";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);
  
  // Get the debtToken address from the pool
  const debtTokenAddress = await pool.debtToken();
  console.log("DebtToken address from pool:", debtTokenAddress);
  
  // Check if the debtToken exists
  const code = await ethers.provider.getCode(debtTokenAddress);
  console.log("DebtToken bytecode length:", code.length);
  
  if (code === "0x") {
    console.log("❌ DebtToken contract not found!");
  } else {
    console.log("✅ DebtToken contract exists");
    
    // Try to get the contract info
    const nUSDC = await ethers.getContractFactory("nUSDC");
    try {
      const token = nUSDC.attach(debtTokenAddress);
      const name = await token.name();
      console.log("Token name:", name);
    } catch (err) {
      console.log("Could not call name() - might not be nUSDC");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
