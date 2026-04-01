import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing borrow directly with address:", deployer.address);

  const poolAddress = "0x410D9E9f553E9836E08D6EB214E501C6812FcFcF";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress).connect(deployer);

  // Check position
  const position = await pool.getPosition(deployer.address);
  console.log("Position exists:", position.exists);
  console.log("Position collateral:", position.collateral);

  if (!position.exists) {
    console.log("No position found, cannot borrow");
    return;
  }

  // Check contract code
  const code = await ethers.provider.getCode(poolAddress);
  console.log("Contract code length:", code.length);

  // List all functions in the ABI
  console.log("\nFunctions in contract:");
  for (const fragment of pool.interface.fragments) {
    if (fragment.type === "function") {
      console.log(`- ${fragment.format("sighash")}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
