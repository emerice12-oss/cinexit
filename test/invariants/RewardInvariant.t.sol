// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract RewardInvariantTest is BaseTest {
    function invariant_noDoubleClaim() public {
        uint256 epoch = epochManager.currentEpoch();

        bool claimedOnce = distributor.claimed(epoch, alice);

        if (claimedOnce) {
            vm.expectRevert();
            vm.prank(alice);
            distributor.claim(epoch);
        }
    }
}
