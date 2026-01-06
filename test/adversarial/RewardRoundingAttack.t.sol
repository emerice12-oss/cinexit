// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {EpochManager} from "contracts/core/EpochManager.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";
import {Treasury} from "contracts/core/Treasury.sol";

contract RewardRoundingAttackTest is Test {
    RewardDistributor distributor;
    ParticipationVault vault;
    EpochManager epochManager;
    MockUSDC usdc;

    address whale = address(0xAAA);
    address attacker = address(0xBAD);

    function setUp() public {
        usdc = new MockUSDC();

        vault = new ParticipationVault(address(usdc));
        CircuitBreaker breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));
        Treasury treasury = new Treasury(address(usdc));
        distributor = new RewardDistributor(
            address(vault),
            address(treasury),
            address(epochManager)
        );

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund treasury for tests
        usdc.mint(address(treasury), 2_000e6);

        usdc.mint(whale, 1_000_000e6);
        // attacker needs enough balance for splitting claims test
        usdc.mint(attacker, 2_000e6);
    }

    function test_AttackerCannotFarmRoundingDust() public {
        // Whale deposits huge amount
        vm.startPrank(whale);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000_000e6);
        vm.stopPrank();

        // Attacker deposits dust
        vm.startPrank(attacker);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1); // 1 wei USDC
        vm.stopPrank();

        address[] memory users = new address[](2);
        users[0] = whale;
        users[1] = attacker;

        vm.warp(block.timestamp + 1 days);

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        epochManager.finalizeEpoch(1_000e6); // 1k USDC reward

        // Attacker claims
        uint256 before = usdc.balanceOf(attacker);
        vm.prank(attacker);
        distributor.claim(1);
        uint256 balanceAfter = usdc.balanceOf(attacker);
        uint256 attackerReward = balanceAfter - before;

        // Should be zero or at most 1 wei due to rounding
        assertLe(attackerReward, 1);
    }

    function test_SplittingClaimsDoesNotIncreaseReward() public {
        vm.startPrank(attacker);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();

        address[] memory users = new address[](1);
        users[0] = attacker;

        // Epoch 1
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);
        epochManager.finalizeEpoch(500e6);

        // Epoch 2
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 2);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(2);
        epochManager.finalizeEpoch(500e6);

        // snapshot state so we can compare split vs batch in isolation
        uint256 snap = vm.snapshot();

        // split claims
        vm.prank(attacker);
        distributor.claim(1);
        vm.prank(attacker);
        distributor.claim(2);

        uint256 splitClaims = usdc.balanceOf(attacker);

        // revert to snapshot and do batch claim
        vm.revertTo(snap);
        vm.prank(attacker);
        distributor.claimBatch(_epochs());

        uint256 batchClaim = usdc.balanceOf(attacker);

        assertEq(splitClaims, batchClaim);
    }

    function _epochs() internal pure returns (uint256[] memory e) {
        e = new uint256[](2);
        e[0] = 1;
        e[1] = 2;
    }
}
