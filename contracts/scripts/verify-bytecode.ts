import { ethers } from "hardhat";

async function main() {
  console.log("Checking if deployed contract matches compiled NullPool...");
  
  const deployedAddress = "0x410D9E9f553E9836E08D6EB214E501C6812FcFcF";
  const NullPool = await ethers.getContractFactory("NullPool");
  
  // Get the deployed contract bytecode
  const deployedCode = await ethers.provider.getCode(deployedAddress);
  console.log("Deployed contract bytecode length:", deployedCode.length);
  
  // Get the expected bytecode from compilation
  const expectedBytecode = NullPool.bytecode;
  console.log("Expected bytecode length:", expectedBytecode.length);
  
  // Compare the runtime bytecode (excluding constructor)
  const deployedRuntime = deployedCode.slice(2); // Remove 0x
  const expectedRuntime = expectedBytecode.slice(2); // Remove 0x
  
  console.log("Deployed runtime starts with:", deployedRuntime.slice(0, 20));
  console.log("Expected runtime starts with:", expectedRuntime.slice(0, 20));
  
  // Check if they match (ignoring library placeholders)
  if (deployedRuntime.startsWith(expectedRuntime.slice(0, 20))) {
    console.log("✓ Contract bytecode matches compiled version");
  } else {
    console.log("✗ Contract bytecode does NOT match compiled version");
    console.log("This might be a different contract or version");
  }
  
  // Try to call a simple function to verify it's our contract
  const pool = NullPool.attach(deployedAddress);
  try {
    const ltv = await pool.LTV_BPS();
    console.log("LTV_BPS:", ltv.toString());
  } catch (err) {
    console.log("Failed to call LTV_BPS - not our NullPool contract");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
