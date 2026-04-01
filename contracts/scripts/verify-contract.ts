import { ethers } from "hardhat";

async function main() {
  const poolAddress = "0x410D9E9f553E9836E08D6EB214E501C6812FcFcF";
  const provider = ethers.provider;
  
  console.log("Checking contract at:", poolAddress);
  
  // Get the contract code
  const code = await provider.getCode(poolAddress);
  console.log("Contract code length:", code.length);
  
  if (code === "0x") {
    console.log("No contract at this address!");
  } else {
    console.log("Contract exists at this address");
    
    // Try to call the position function directly
    const NullPool = await ethers.getContractFactory("NullPool");
    const pool = NullPool.attach(poolAddress);
    
    try {
      const owner = await pool.owner();
      console.log("Contract owner:", owner);
    } catch (err) {
      console.log("Could not call owner() - might not be the right contract");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
