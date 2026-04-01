import { ethers } from "hardhat";

async function main() {
  // The error data includes the contract address at the end
  const fullErrorData = "0x9de3392cb5a69a094a9c8f891daba894e1f57e01ebc1b31cb6ff0000000000aa36a70500000000000000000000000000410d9e9f553e9836e08d6eb214e501c6812fcfcf";
  
  // Extract just the error signature (first 4 bytes)
  const errorSignature = fullErrorData.slice(0, 10);
  
  console.log("Full error data:", fullErrorData);
  console.log("Error signature:", errorSignature);
  
  // Try with common error signatures
  const commonErrors = {
    "0x4e487b71": "Panic(uint256)",
    "0x08c379a0": "Error(string)",
    "0x9de3392c": "PositionNotFound()",
    "0x4b48f8b7": "InvalidAmount()",
    "0x1817ecd7": "Unknown error - possibly from FHE operation"
  };
  
  console.log("Likely error:", commonErrors[errorSignature as keyof typeof commonErrors] || "Unknown error");
  
  // Extract the contract address from the end (last 20 bytes)
  const contractAddress = "0x" + fullErrorData.slice(-40);
  console.log("Contract address from error:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
