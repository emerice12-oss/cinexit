// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract OracleInvariantTest is BaseTest {
    function invariant_epochMonotonicity() public {
        uint256 last = oracle.lastFinalizedEpoch();
        uint256 current = epochManager.currentEpoch();

        assertLe(last, current);
    }
}
