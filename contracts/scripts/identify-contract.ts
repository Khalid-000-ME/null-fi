import { ethers } from "hardhat";

async function main() {
  const poolAddress = "0x42Dde192EC4cd1495150B39A4956281460932090";
  const provider = ethers.provider;
  
  console.log("Identifying contract at:", poolAddress);
  
  // Try to get contract info
  try {
    // Get the first 4 bytes of the contract code to check for known patterns
    const code = await provider.getCode(poolAddress);
    console.log("Contract code starts with:", code.slice(0, 10));
    
    // Try common ERC20 functions
    const erc20Selectors = {
      "0x70a08231": "balanceOf",
      "0x18160ddd": "totalSupply",
      "0xa9059cbb": "transfer"
    };
    
    for (const [selector, name] of Object.entries(erc20Selectors)) {
      try {
        const result = await provider.call({
          to: poolAddress,
          data: selector + "0000000000000000000000001111d87736c9c90bb9eae83297be83ae990699ce"
        });
        console.log(`${name} (${selector}): Exists`);
      } catch (err) {
        console.log(`${name} (${selector}): Not found`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
