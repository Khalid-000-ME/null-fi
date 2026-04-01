import { ethers } from "hardhat";

async function main() {
  console.log("Deploying fresh NullPool...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  // Get the contract factory
  const NullPool = await ethers.getContractFactory("NullPool");
  
  // Check bytecode before deployment
  console.log("Factory bytecode length:", NullPool.bytecode.length);
  
  // Deploy with dummy addresses first
  const pool = await NullPool.deploy(
    deployer.address, // collateralToken
    deployer.address, // debtToken  
    deployer.address  // oracle
  );
  
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("NullPool deployed at:", poolAddress);
  
  // Verify the deployed bytecode
  const deployedCode = await ethers.provider.getCode(poolAddress);
  console.log("Deployed bytecode length:", deployedCode.length);
  
  // Check if they match
  if (NullPool.bytecode.length === deployedCode.length) {
    console.log("✓ Bytecode lengths match!");
  } else {
    console.log("✗ Bytecode mismatch - expected:", NullPool.bytecode.length, "got:", deployedCode.length);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
