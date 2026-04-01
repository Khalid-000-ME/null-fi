import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing borrow from script with address:", deployer.address);

  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const NullPool = await ethers.getContractFactory("NullPool");
  const pool = NullPool.attach(poolAddress);

  // First check position
  const position = await pool.getPosition(deployer.address);
  console.log("Position exists:", position.exists);

  // Try to borrow with a very small amount (0.000001 ETH = 1000000000000000 wei)
  const borrowAmount = ethers.parseEther("0.000001");
  console.log("Trying to borrow:", ethers.formatEther(borrowAmount));

  // We need to encrypt this amount first
  console.log("Note: Cannot encrypt from hardhat script - need frontend encryption");
  console.log("The issue might be with the encryption format or proof generation");

  // Let's check the borrow function selector
  const borrowSelector = pool.interface.getFunction("borrow")?.selector;
  console.log("Borrow function selector:", borrowSelector);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
