// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";
import {Treasury} from "contracts/core/Treasury.sol";

contract SnapshotSpamAttackTest is Test {
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

        distributor = new RewardDistributor(address(vault), address(usdc), address(epochManager));

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));

        usdc.mint(attacker, 1_000_000e6);
    }

    function test_SnapshotSpamDoesNotBrickEpoch() public {
        uint256 spamCount = 300;

        address[] memory spamUsers = new address[](spamCount);

        for (uint256 i = 0; i < spamCount; i++) {
            address user = address(uint160(uint256(keccak256(abi.encode(i)))));
            spamUsers[i] = user;

            usdc.mint(user, 1e6);
            vm.startPrank(user);
            usdc.approve(address(vault), 1e6);
            vault.deposit(1e6);
            vm.stopPrank();
        }

        // Snapshot must succeed (caller chooses size)
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUsers(spamUsers, 1);

        // Epoch finalization must still work
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(1_000e6);

        uint256 totalWeight = vault.getEpochTotalWeight(1);
        assertGt(totalWeight, 0, "Epoch bricked by spam");
    }
}
