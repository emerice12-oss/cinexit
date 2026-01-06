// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract WithdrawRedeployAttackTest is BaseTest {
    function test_WithdrawRedeployDoesNotIncreaseWeight() public {
        // Alice: honest continuous depositor
        vm.startPrank(alice);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // Attacker deposits early
        vm.startPrank(attacker);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // Move time forward
        vm.warp(block.timestamp + epochManager.EPOCH_DURATION() / 2);

        // Attacker withdraws
        vm.startPrank(attacker);
        vault.withdraw(1_000e6);

        // Immediately re-deposits
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

        uint256 aliceReward = distributor.previewClaim(alice, 1);
        uint256 attackerReward = distributor.previewClaim(attacker, 1);

        // Attacker must not gain advantage
        assertLe(attackerReward, aliceReward);
    }
}
