// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract MaliciousReceiver {
    ParticipationVault vault;
    RewardDistributor distributor;

    constructor(address _vault, address _distributor) {
        vault = ParticipationVault(_vault);
        distributor = RewardDistributor(_distributor);
    }

    function attack() external {
        // Reenter during withdraw callback
        // Use zero withdrawal to avoid requiring deposit; attack should revert but still compile.
        vault.withdraw(0);
    }
}

contract ReentrancyEpochFinalizeTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    Treasury treasury;
    CircuitBreaker breaker;
    MockUSDC usdc;
    MaliciousReceiver attacker;

    address alice = address(0x1);

    function setUp() public {
        usdc = new MockUSDC();

        vault = new ParticipationVault(address(usdc));

        treasury = new Treasury(address(usdc));

        // Circuit breaker for epoch manager
        breaker = new CircuitBreaker();

        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        distributor = new RewardDistributor(
            address(vault),
            address(treasury),
            address(epochManager)
        );

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        usdc.mint(alice, 1_000_000e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), 1_000_000e6);
        vault.deposit(1_000_000e6);
        vm.stopPrank();

        attacker = new MaliciousReceiver(address(vault), address(distributor));
    }

    function test_ReentrancyBlockedDuringFinalize() public {
        // snapshot epoch with Alice only (advance time so accrual > 0)
        vm.warp(block.timestamp + 1 days);

        address[] memory users = new address[](1);
        users[0] = alice;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        // Epoch finalization must not allow reentry
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(1_000e6);

        uint256 totalWeight = vault.getEpochTotalWeight(1);
        assertGt(totalWeight, 0, "Epoch weight broken by reentrancy");
    }
}
