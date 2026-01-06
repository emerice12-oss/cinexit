// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract EpochBoundaryAttackTest is BaseTest {
    function test_DepositAfterSnapshotNotCounted() public {
        address attacker = makeAddr("attacker");

        // Give attacker funds
        usdc.mint(attacker, 1_000e6);

        address[] memory users = new address[](1);
        users[0] = attacker;

        // Advance time
        vm.warp(block.timestamp + 1 days);

        // Snapshot BEFORE attacker deposits
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        // Attacker deposits AFTER snapshot
        vm.startPrank(attacker);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // Finalize epoch
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        // Attest revenue
        epochManager.finalizeEpoch(1_000e6);

        // Attacker should have ZERO weight
        uint256 weight = vault.getUserEpochWeight(attacker, 1);
        assertEq(weight, 0, "Deposit after snapshot incorrectly counted");
    }
}
