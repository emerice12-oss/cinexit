// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./BaseTest.t.sol";

contract BatchClaimTest is BaseTest {
    uint256 internal epochId;

    function setUp() public override {
        super.setUp();

        // Mint USDC to Alice and Bob
        usdc.mint(alice, 5_000e6);
        usdc.mint(bob, 10_000e6);

        // Alice deposits 5k
        vm.startPrank(alice);
        usdc.approve(address(vault), 5_000e6);
        vault.deposit(5_000e6);
        vm.stopPrank();

        // Bob deposits 10k
        vm.startPrank(bob);
        usdc.approve(address(vault), 10_000e6);
        vault.deposit(10_000e6);
        vm.stopPrank();
    }

    function test_MultipleEpochBatchClaim() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        // Epoch 1
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, 1);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);
        epochManager.finalizeEpoch(1_000e6);
        assertGt(vault.getUserEpochWeight(alice, 1), 0, "Alice weight missing");
        assertGt(vault.getEpochTotalWeight(1), 0, "Epoch 1 total weight missing");

        // Epoch 2
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, 2);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(2);
        epochManager.finalizeEpoch(2_000e6);
        assertGt(vault.getUserEpochWeight(alice, 2), 0, "Alice weight missing");
        assertGt(vault.getEpochTotalWeight(2), 0, "Epoch 2 total weight missing");

        // Epoch 3
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, 3);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(3);
        epochManager.finalizeEpoch(3_000e6);
        assertGt(vault.getUserEpochWeight(alice, 3), 0, "Alice weight missing");
        assertGt(vault.getEpochTotalWeight(3), 0, "Epoch 3 total weight missing");

        // Batch claim
        uint256[] memory epochs = new uint256[](3);
        epochs[0] = 1; epochs[1] = 2; epochs[2] = 3;

        vm.startPrank(alice);
        distributor.claimBatch(epochs);
        assertGt(usdc.balanceOf(alice), 0);
        vm.stopPrank();
    }
}
