// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract WithdrawAfterSnapshotTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    Treasury treasury;
    CircuitBreaker breaker;

    address attacker = address(0xCAFE);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        treasury = new Treasury(address(usdc));

        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        usdc.mint(attacker, 1_000e6);
        vm.prank(attacker);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_WithdrawAfterSnapshotDoesNotOverReward() public {
        vm.startPrank(attacker);

        // Deposit
        vault.deposit(1_000e6);

        // Snapshot (pause attacker prank while snapshotting)
        vm.stopPrank();
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUser(attacker, 1);
        vm.startPrank(attacker);

        // Withdraw immediately
        vault.withdraw(1_000e6);

        // Finalize epoch
        vm.warp(block.timestamp + 1 days);
        epochManager.finalizeEpoch(0);

        // Claim
        uint256 beforeBal = usdc.balanceOf(attacker);
        distributor.claim(1);
        uint256 claimed = usdc.balanceOf(attacker) - beforeBal;

        // ✅ Either zero or expected small value (not full share)
        assertLe(claimed, 1, "Withdrew early but received rewards");

        vm.stopPrank();
    }
}
