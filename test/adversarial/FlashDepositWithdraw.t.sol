// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";
import {Treasury} from "contracts/core/Treasury.sol";

contract FlashDepositWithdrawTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;
    Treasury treasury;

    address honest = address(0xA11CE);
    address attacker = address(0xBAD);

    function setUp() public {
        usdc = new MockUSDC();
        treasury = new Treasury(address(usdc));
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();

        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund treasury with enough to cover epoch rewards
        usdc.mint(address(treasury), 1_000e6);

        usdc.mint(honest, 1_000e6);
        usdc.mint(attacker, 1_000e6);

        vm.startPrank(honest);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();
    }

    function test_FlashDepositWithdrawDoesNotStealRewards() public {
        // Attacker deposits right before snapshot
        vm.startPrank(attacker);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();

        address[] memory users = new address[](2);
        users[0] = honest;
        users[1] = attacker;

        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        // Attacker immediately withdraws
        vm.prank(attacker);
        vault.withdraw(1_000e6);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(1_000e6);

        uint256 honestBefore = usdc.balanceOf(honest);
        uint256 attackerBefore = usdc.balanceOf(attacker);

        vm.prank(honest);
        distributor.claim(1);

        vm.prank(attacker);
        distributor.claim(1);

        uint256 honestAfter = usdc.balanceOf(honest);
        uint256 attackerAfter = usdc.balanceOf(attacker);

        assertGt(honestAfter, honestBefore, "Honest user not rewarded");

        // Attacker may get tiny rounding dust at most — but no profit
        assertLe(attackerAfter, attackerBefore, "Flash attacker profited");
    }
}
