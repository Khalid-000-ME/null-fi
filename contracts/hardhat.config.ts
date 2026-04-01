import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    fhevm_sepolia: {
      url: RPC_URL,
      chainId: 11155111,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Prevent Hardhat from treating node_modules Solidity files as local sources
  mocha: {
    timeout: 40000,
  },
};

export default config;
