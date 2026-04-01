import { ethers } from "hardhat";

async function main() {
  const txHash = "0x83a2ac84bf473fa5c440924f7eae2a00871547ba3987839263b969c0901bedfd";
  
  console.log("Checking transaction:", txHash);
  
  try {
    const tx = await ethers.provider.getTransaction(txHash);
    if (!tx) {
      console.log("Transaction not found");
      return;
    }
    
    console.log("Transaction details:", {
      from: tx.from,
      to: tx.to,
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice?.toString(),
      data: tx.data?.slice(0, 50) + "..."
    });
    
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log("Receipt not found");
      return;
    }
    
    console.log("Receipt status:", receipt.status);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Try to get the revert reason
    if (receipt.status === 0) {
      console.log("Transaction reverted");
      
      // Try to simulate the transaction to get the revert reason
      try {
        await ethers.provider.call(tx);
      } catch (err: any) {
        console.log("Revert reason:", err.data || err.message);
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
