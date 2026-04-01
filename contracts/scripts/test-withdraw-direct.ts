import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing withdraw with address:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  // Use the same encrypted handle from the frontend
  const encryptedHandle = "0xef6b85dfa64e3ff08ad883de39344c24be49b3c831000000000000aa36a70500";
  const proof = "0x990dc2f92190e4d10f106b87ea5b17a7e6141a64afe9cfd6ce223124c3da7ab81e9a9d4cafd776c7bb13bf09a5fff22e2bba1380503a37f22252d599eb15b30b1c";

  console.log("Attempting withdraw with encrypted handle:", encryptedHandle);
  console.log("Proof length:", proof.length);

  try {
    // First, let's check if we can even call the function
    const tx = await pool.withdraw.populateTransaction(encryptedHandle, proof);
    console.log("Transaction data:", tx.data);
    
    // Try to estimate gas
    const gasEstimate = await pool.withdraw.estimateGas(encryptedHandle, proof);
    console.log("Gas estimate:", gasEstimate.toString());
  } catch (err: any) {
    console.error("Error:", err.message);
    if (err.data) {
      console.error("Error data:", err.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
