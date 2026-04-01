import { ethers } from "hardhat";

async function main() {
  console.log("Checking if contract is a proxy...");
  
  const poolAddress = "0x961c5Bcc8421D93C40D19Ac040d8e58d95cAedd3";
  const provider = ethers.provider;
  
  // Check common proxy implementation slots
  const slots = {
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc": "EIP-1967 implementation slot",
    "0xa5f3216be665802c926e7698c0ef0ed3212631d6103b9bf8027b7efd5110e8f5": "EIP-1822 implementation slot",
    "0x7050c9e042ef11a765327d5f6d8a39491010c4c4b638f845b8ea8b4ef836c8a5": "UUPS implementation slot",
  };
  
  for (const [slot, name] of Object.entries(slots)) {
    try {
      const value = await provider.getStorage(poolAddress, slot);
      console.log(`${name}: ${value}`);
      if (value !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        console.log(`  → Non-zero! This might be a proxy`);
      }
    } catch (err) {
      console.log(`Could not read ${name}`);
    }
  }
  
  // Check admin slot (OpenZeppelin proxy)
  try {
    const adminSlot = await provider.getStorage(poolAddress, "0xb53127684a568b31737813b23e8f87e0b477fcfd6f3c9f5a4c1d0c8e0e8a4d8e");
    console.log(`Admin slot: ${adminSlot}`);
  } catch (err) {
    console.log("Could not read admin slot");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
