// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";
import {Treasury} from "contracts/core/Treasury.sol";

contract EpochFinalizationRaceTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;
    Treasury treasury;

    address alice = address(0xA1);
    address bob = address(0xB0);

    function setUp() public {
        usdc = new MockUSDC();
        treasury = new Treasury(address(usdc));
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();

        // create epoch manager and distributor
        epochManager = new EpochManager(address(breaker), address(vault), address(0));
        distributor = new RewardDistributor(
            address(vault),
            address(treasury),
            address(epochManager)
        );

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));
    }

    function test_EpochCannotBeFinalizedTwice() public {
        // snapshot some users
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        usdc.mint(alice, 100e6);
        usdc.mint(bob, 200e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6);
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(address(vault), 200e6);
        vault.deposit(200e6);
        vm.stopPrank();

        // Snapshot users for epoch 1
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        // First finalization works
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        // EpochManager finalizes epoch revenue
        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(300e6);

        // Attempt race: finalize next epoch — should succeed (no double-finalize)
        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(500e6);

        // Check epochs data
        (uint256 r1, bool f1) = epochManager.epochs(1);
        (uint256 r2, bool f2) = epochManager.epochs(2);
        assertEq(r1, 300e6);
        assertTrue(f1);
        assertEq(r2, 500e6);
        assertTrue(f2);
    }
}
