import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Minting with:", deployer.address);

  const nullETHAddress = "0x6945a84E678451a289cAdBEb998FDb0c4c2d23C3"; // latest wrap/unwrap deployment
  const userAddress = "0x1111d87736c9C90Bb9eAE83297BE83ae990699cE"; // Your wallet address

  // Attach to the nullETH contract
  const MockConfidentialERC20 = await ethers.getContractFactory("MockConfidentialERC20");
  const nullETH = MockConfidentialERC20.attach(nullETHAddress);

  // Mint 10 nullETH to the user using mintPlaintext
  // The contract stores amounts as uint64 with 18-decimal wei representation
  // 10 ETH = 10 * 10^18 — but uint64 max is ~18.44 * 10^18, so cap at 10 ETH
  const amount = BigInt("10000000000000000000"); // 10 ETH in wei as uint64
  console.log(`Minting ${amount} nullETH (10 ETH) to ${userAddress}`);
  
  const tx = await (nullETH as any).mintPlaintext(userAddress, amount);
  await tx.wait();
  console.log("Minted successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
