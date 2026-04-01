// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @notice Price oracle adapter for NullFi.
 */
contract NullOracle is ZamaEthereumConfig {

    AggregatorV3Interface public priceFeed;
    uint256 public constant PRICE_DECIMALS = 1e8;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getPrice() external view returns (uint256 price) {
        (, int256 answer,,,) = priceFeed.latestRoundData();
        require(answer > 0, "NullOracle: invalid price");
        return uint256(answer);
    }

    function encryptedUSDValue(
        euint64 encAmount,
        uint256 priceUSD
    ) external returns (euint64) {
        return FHE.div(
            FHE.mul(encAmount, FHE.asEuint64(uint64(priceUSD))),
            uint64(PRICE_DECIMALS)
        );
    }
}
