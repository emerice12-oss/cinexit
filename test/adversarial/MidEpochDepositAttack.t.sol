// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract MidEpochDepositAttackTest is BaseTest {
    function test_MidEpochDepositGetsReducedWeight() public {
        // Alice deposits at epoch start
        vm.startPrank(alice);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // Move forward half the epoch
        vm.warp(block.timestamp + epochManager.EPOCH_DURATION() / 2);

        // Attacker deposits same amount
        vm.startPrank(attacker);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // snapshot users and finalize vault epoch
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = attacker;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        // Finalize epoch in manager
        vm.prank(admin);
        epochManager.finalizeEpoch();

        // Compare rewards
        uint256 aliceReward = distributor.previewClaim(alice, 1);
        uint256 attackerReward = distributor.previewClaim(attacker, 1);

        // Attacker must receive strictly less
        assertLt(attackerReward, aliceReward);
    }
}
