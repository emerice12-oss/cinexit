// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./BaseTest.t.sol";

contract RewardDistributorTest is BaseTest {
    RewardDistributor rewardDistributor; // ✅ VARIABLE
    uint256 internal epochId;

    function setUp() public override {
        super.setUp();
        vault = new ParticipationVault(address(usdc));

        epochId = 1;

        rewardDistributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager)); // ✅ now valid

        // Mint USDC to Alice and Bob
        usdc.mint(alice, 5_000e6);
        usdc.mint(bob, 10_000e6);

        // Alice deposits 5k USDC
        vm.startPrank(alice);
        usdc.approve(address(vault), 5_000e6);
        vault.deposit(5_000e6);
        vm.stopPrank();

        // Bob deposits 10k USDC
        vm.startPrank(bob);
        usdc.approve(address(vault), 10_000e6);
        vault.deposit(10_000e6);
        vm.stopPrank();

        // Time passes
        vm.warp(block.timestamp + 1 days);

        // Snapshot + finalize epoch 1
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, epochId);

        // Finalize epoch in vault
        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        epochManager.finalizeEpoch(1_000e6);
    }

    function test_SingleClaim() public {
        // ✅ sanity checks
        assertGt(vault.getUserEpochWeight(alice, epochId), 0, "Alice weight not recorded");
        assertGt(vault.getEpochTotalWeight(epochId), 0, "Total weight not recorded");

        // claim
        vm.startPrank(alice);
        rewardDistributor.claim(epochId);
        assertGt(usdc.balanceOf(alice), 0);
        vm.stopPrank();
    }

    function test_BatchClaim() public {
        // Prepare epoch 2
        epochId = 2;

        vm.warp(block.timestamp + 1 days);

        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, epochId);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        // Finalize epoch 2 in manager
        epochManager.finalizeEpoch(2_000e6);

        uint256[] memory epochs = new uint256[](2);
        epochs[0] = 1;
        epochs[1] = 2;

        vm.startPrank(alice);
        rewardDistributor.claimBatch(epochs);
        uint256 balance = usdc.balanceOf(alice);
        assertGt(usdc.balanceOf(alice), 0);
        vm.stopPrank();
    }
}
