import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing borrow with address:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  // Try to call a simple view function first
  try {
    const pos = await pool.getPosition(deployer.address);
    console.log("Position check - exists:", pos.exists);
  } catch (err) {
    console.error("getPosition failed:", err);
  }

  // Now try to estimate gas for borrow with dummy data
  try {
    const gasEstimate = await pool.borrow.estimateGas(
      "0x" + "00".repeat(64), // dummy handle
      "0x" + "00".repeat(128)  // dummy proof
    );
    console.log("Gas estimate for borrow:", gasEstimate.toString());
  } catch (err: any) {
    console.error("Borrow gas estimate failed:", err.message);
    if (err.data) {
      console.error("Error data:", err.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
