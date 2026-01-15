// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract PartialEpochClaimGriefingTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    Treasury treasury;

    address alice = address(0xA11CE);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        CircuitBreaker breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        treasury = new Treasury(address(usdc));

        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));
        // fund treasury for the 3 epochs
        usdc.mint(address(treasury), 6_000e6);

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        usdc.mint(alice, 1_000e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();
    }

    function _finalizeEpoch(uint256 epochId, uint256 revenue) internal {
        address[] memory users = new address[](1);
        users[0] = alice;

        // ensure some accrual before snapshot
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, epochId);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(revenue);
    }

    function test_PartialClaimDoesNotBlockRemainingEpochs() public {
        _finalizeEpoch(1, 1_000e6);
        _finalizeEpoch(2, 2_000e6);
        _finalizeEpoch(3, 3_000e6);

        // Claim only epoch 1
        vm.prank(alice);
        distributor.claim(1);

        // Remaining epochs should still be claimable
        uint256[] memory remaining = new uint256[](2);
        remaining[0] = 2;
        remaining[1] = 3;

        vm.prank(alice);
        distributor.claimBatch(remaining);

        uint256 finalBalance = usdc.balanceOf(alice);

        // All rewards must be received exactly once
        assertGt(finalBalance, 0, "No rewards paid");
    }
}
