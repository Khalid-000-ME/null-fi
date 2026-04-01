import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking decrypted balance for:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  try {
    const position = await pool.getPosition(deployer.address);
    console.log("Position exists:", position.exists);
    console.log("Encrypted collateral:", position.collateral);
    
    // Try to decrypt the collateral (this might fail if we don't have the right method)
    // For now, let's just note that we can't easily decrypt it
    console.log("Note: Collateral is encrypted and cannot be easily read");
    
    // Let's check the token contract balance instead
    const tokenAddress = "0xb33E030948F4269F7835374Cc1D64e841CCD85D7";
    const MockConfidentialERC20 = await ethers.getContractFactory("MockConfidentialERC20");
    const token = MockConfidentialERC20.attach(tokenAddress);
    
    const balance = await token.balanceOf(deployer.address);
    console.log("Token balance (encrypted):", balance);
    
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
