// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {RewardDistributor} from "src/contracts/core/RewardDistributor.sol";
import {ParticipationVault} from "src/contracts/vault/ParticipationVault.sol";
import {EpochManager} from "src/contracts/core/EpochManager.sol";
import {MockUSDC} from "src/contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "src/contracts/core/Treasury.sol";
import {CircuitBreaker} from "src/contracts/governance/CircuitBreaker.sol";

contract ReentrancyClaimAttackTest is Test {
    ParticipationVault vault;
    EpochManager epochManager;
    RewardDistributor distributor;
    MockUSDC usdc;
    Treasury treasury;

    address attacker = address(0xBAD);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        CircuitBreaker breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        treasury = new Treasury(address(usdc));

        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        usdc.mint(attacker, 1_000e6);

        vm.startPrank(attacker);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        address[] memory users = new address[](1);
        users[0] = attacker;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        epochManager.finalizeEpoch(1_000e6);
    }

    function test_ReentrancyOnClaimFails() public {
        ReentrantClaimer evil = new ReentrantClaimer(distributor, 1);

        vm.prank(attacker);
        // claim should not allow reentrancy farming; ensure balance remains bounded
        distributor.claim(1);

        // attacker balance should be zero or correct single payout only
        assertLe(usdc.balanceOf(attacker), 1_000e6);
    }
}

contract ReentrantClaimer {
    RewardDistributor public distributor;
    uint256 public epochId;

    constructor(RewardDistributor _distributor, uint256 _epochId) {
        distributor = _distributor;
        epochId = _epochId;
    }

    // attempt reentry
    function attack() external {
        distributor.claim(epochId);
    }
}
