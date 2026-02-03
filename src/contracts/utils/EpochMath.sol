// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library EpochMath {
    function weightedBalance(uint256 balance) internal pure returns (uint256) {
        uint256 weight = 0;

        // Tier 1: 0 - 1,000
        uint256 tier = _min(balance, 1_000e6);
        weight += tier;
        balance -= tier;

        if (balance == 0) return weight;

        // Tier 2: 1,000 - 10,000 (0.7x)
        tier = _min(balance, 9_000e6);
        weight += (tier * 70) / 100;
        balance -= tier;

        if (balance == 0) return weight;

        // Tier 3: 10,000 - 100,000 (0.4x)
        tier = _min(balance, 90_000e6);
        weight += (tier * 40) / 100;
        balance -= tier;

        if (balance == 0) return weight;

        // Tier 4: 100,000+ (0.2x)
        weight += (balance * 20) / 100;

        return weight;
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
