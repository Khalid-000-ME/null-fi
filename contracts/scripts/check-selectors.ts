import { ethers } from "hardhat";

async function main() {
  const poolAddress = "0x410D9E9f553E9836E08D6EB214E501C6812FcFcF";
  const provider = ethers.provider;
  
  // Try to get the function selectors
  console.log("Checking function selectors at:", poolAddress);
  
  // Common function selectors to check
  const selectors = {
    "0x13c5d38f": "borrow",
    "0x4a2e35ba": "withdraw", 
    "0x8d65ff61": "deposit",
    "0x2e1a7d4d": "repay",
    "0x598c2749": "getPosition",
    "0x8da5cb5b": "owner"
  };
  
  for (const [selector, name] of Object.entries(selectors)) {
    try {
      const result = await provider.call({
        to: poolAddress,
        data: selector + "0".repeat(56) // Minimal calldata
      });
      console.log(`${name} (${selector}): Exists (returned ${result.length} bytes)`);
    } catch (err) {
      console.log(`${name} (${selector}): Not found or failed`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
