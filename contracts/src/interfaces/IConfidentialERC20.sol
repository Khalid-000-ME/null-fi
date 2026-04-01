// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";

interface IConfidentialERC20 {
    function transferFrom(address from, address to, euint64 amount) external returns (bool);
    function transfer(address to, euint64 amount) external returns (bool);
    function balanceOf(address account) external view returns (euint64);
    function approve(address spender, externalEuint64 encryptedAmount, bytes calldata proof) external returns (bool);
}
