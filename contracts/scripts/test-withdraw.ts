import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing withdrawal for:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  // Try to withdraw a very small amount (0.000001)
  const amount = ethers.parseEther("0.000001");
  console.log(`Attempting to withdraw ${ethers.formatEther(amount)} ETH...`);

  try {
    // Estimate gas first to see the error
    const gasEstimate = await pool.withdraw.estimateGas("0x" + "00".repeat(64), "0x");
    console.log("Gas estimate:", gasEstimate.toString());
  } catch (err: any) {
    console.error("Gas estimate failed:", err.message);
    if (err.data) {
      console.error("Error data:", err.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
