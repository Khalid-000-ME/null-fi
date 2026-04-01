import { ethers } from "hardhat";

async function main() {
  const deployedAddress = "0x961c5Bcc8421D93C40D19Ac040d8e58d95cAedd3";
  const provider = ethers.provider;
  
  console.log("Checking what's actually deployed at:", deployedAddress);
  
  // Get the contract creation code
  const txHash = await provider.getTransactionCount(deployedAddress);
  console.log("Transaction count:", txHash);
  
  // Try to get the creation transaction
  const blockNumber = await provider.getBlockNumber();
  console.log("Current block:", blockNumber);
  
  // Check if it's a proxy contract
  const code = await provider.getCode(deployedAddress);
  console.log("Code length:", code.length);
  
  // Check for common proxy patterns
  if (code.includes("a9059cbb")) { // transfer selector
    console.log("Contains transfer selector - might be ERC20");
  }
  if (code.includes("360894a13")) { // admin selector
    console.log("Contains admin selector - might be proxy");
  }
  
  // Try to get slot 0 (common for proxy admin)
  try {
    const slot0 = await provider.getStorage(deployedAddress, "0x0");
    console.log("Storage slot 0:", slot0);
  } catch (err) {
    console.log("Could not read storage slot 0");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
