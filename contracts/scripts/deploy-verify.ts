import { ethers } from "hardhat";

async function main() {
  console.log("Deploying NullPool with explicit bytecode verification...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  // Get the contract factory
  const NullPool = await ethers.getContractFactory("NullPool");
  
  // Check the bytecode before deployment
  console.log("Factory bytecode length:", NullPool.bytecode.length);
  console.log("Factory bytecode starts with:", NullPool.bytecode.slice(0, 20));
  
  // Get the deployment addresses
  const nullETH = "0xc02a4209a171b203d93da0b95aF5E42c00948468";
  const nullToken = "0xEcD23770bB81FB62Daa42dfaF31009aBE10bf3F7";
  const oracle = "0xE82f462b38f1715dCe6ec4d0C12979690df7327e";
  
  // Deploy with explicit parameters
  const pool = await NullPool.deploy(
    nullETH,
    nullToken,
    oracle
  );
  
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("NullPool deployed at:", poolAddress);
  
  // Verify the deployed bytecode
  const deployedCode = await ethers.provider.getCode(poolAddress);
  console.log("Deployed bytecode length:", deployedCode.length);
  console.log("Deployed bytecode starts with:", deployedCode.slice(0, 20));
  
  // Check if they match
  const expectedRuntime = NullPool.bytecode.slice(2);
  const deployedRuntime = deployedCode.slice(2);
  
  if (expectedRuntime.startsWith(deployedRuntime.slice(0, 20))) {
    console.log("✓ Bytecode matches!");
  } else {
    console.log("✗ Bytecode mismatch detected");
  }
  
  // Test basic functions
  try {
    const ltv = await pool.LTV_BPS();
    console.log("LTV_BPS:", ltv.toString());
    
    const collateral = await pool.collateralToken();
    console.log("Collateral token:", collateral);
  } catch (err) {
    console.error("Error calling functions:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
