// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "src/contracts/core/EpochManager.sol";
import {ParticipationVault} from "src/contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "src/contracts/core/RewardDistributor.sol";
import {MockUSDC} from "src/contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "src/contracts/governance/CircuitBreaker.sol";
import {Treasury} from "src/contracts/core/Treasury.sol";

contract ZeroWeightSnapshotTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;

    address alice = address(0xA11CE);
    address attacker = address(0xBAD);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        CircuitBreaker breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        Treasury treasury = new Treasury(address(usdc));
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund treasury
        usdc.mint(address(treasury), 1_000e6);

        usdc.mint(alice, 1_000e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();
    }

    function test_ZeroWeightUserDoesNotAffectRewards() public {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = attacker; // attacker never deposits

        // ensure accrual time so alice has non-zero weight
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(1_000e6);

        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 attackerBefore = usdc.balanceOf(attacker);

        vm.prank(alice);
        distributor.claim(1);

        vm.prank(attacker);
        distributor.claim(1);

        uint256 aliceAfter = usdc.balanceOf(alice);
        uint256 attackerAfter = usdc.balanceOf(attacker);

        assertGt(aliceAfter, aliceBefore, "Alice not paid");
        assertEq(attackerAfter, attackerBefore, "Attacker gained rewards");
    }
}
