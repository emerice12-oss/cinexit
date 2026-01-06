// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract FlashDepositAttackTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;

    address attacker = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        distributor = new RewardDistributor(
            address(vault),
            address(usdc),
            address(epochManager)
        );

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));

        usdc.mint(attacker, 1_000e6);
        vm.prank(attacker);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_FlashDepositGetsNoRewards() public {
        vm.startPrank(attacker);

        // 1️⃣ Deposit right before snapshot
        vault.deposit(1_000e6);
        vm.stopPrank();

        // 2️⃣ Advance time then snapshot
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUser(attacker, 1);

        // 3️⃣ Attacker withdraws
        vm.startPrank(attacker);
        vault.withdraw(1_000e6);
        vm.stopPrank();

        // 4️⃣ Finalize epoch
        epochManager.finalizeEpoch(0);

        // 5️⃣ Claim should revert or return zero; if it returns, balance must be unchanged
        uint256 before = usdc.balanceOf(attacker);
        distributor.claim(1);
        uint256 balanceAfter = usdc.balanceOf(attacker);
        assertEq(before, balanceAfter, "Attacker should not gain rewards");
    }
}
