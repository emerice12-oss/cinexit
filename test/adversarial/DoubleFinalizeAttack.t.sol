// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract DoubleFinalizeAttackTest is BaseTest {
    function test_ConsecutiveFinalizesWork() public {
        uint256 epoch = 1;

        // First finalize should succeed
        epochManager.finalizeEpoch(1_000e6);

        // Second finalize should also succeed (advances epoch)
        epochManager.finalizeEpoch(1_000e6);

        // Check epochs data
        (uint256 r1, bool f1) = epochManager.epochs(1);
        (uint256 r2, bool f2) = epochManager.epochs(2);
        assertEq(r1, 1_000e6);
        assertTrue(f1);
        assertEq(r2, 1_000e6);
        assertTrue(f2);
    }

    function test_VaultCannotFinalizeEpochTwice() public {
        uint256 epoch = 1;

        // First finalize via vault
        vm.prank(address(epochManager));
        vault.finalizeEpoch(epoch);

        // Second finalize must revert
        vm.prank(address(epochManager));
        vm.expectRevert();
        vault.finalizeEpoch(epoch);
    }
}
