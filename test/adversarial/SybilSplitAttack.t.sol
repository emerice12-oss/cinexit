// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {EpochManager} from "contracts/core/EpochManager.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract SybilSplitAttackTest is Test {
    ParticipationVault vault;
    EpochManager epochManager;
    RewardDistributor distributor;
    MockUSDC usdc;

    address whale = address(0xAAA);
    address[] sybils;

    uint256 constant TOTAL = 1_000_000e6;

    function setUp() public {
        usdc = new MockUSDC();

        vault = new ParticipationVault(address(usdc));
        epochManager = new EpochManager(address(this), address(vault), address(0));
        // setup circuit breaker + treasury + distributor
        CircuitBreaker breaker = new CircuitBreaker();
        Treasury treasury = new Treasury(address(usdc));
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        vault.setBreaker(address(breaker));
        epochManager.setBreaker(address(breaker));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund the treasury and whale
        usdc.mint(address(treasury), TOTAL);
        usdc.mint(whale, TOTAL);

        // create 10 sybil wallets
        for (uint256 i = 0; i < 10; i++) {
            address a = address(uint160(0xB000 + i));
            sybils.push(a);
            usdc.mint(a, TOTAL / 10);
        }
    }

    function test_SybilSplitDoesNotIncreaseReward() public {
        // Whale deposits once
        vm.startPrank(whale);
        usdc.approve(address(vault), TOTAL);
        vault.deposit(TOTAL);
        vm.stopPrank();

        // Sybils deposit split amounts
        for (uint256 i = 0; i < sybils.length; i++) {
            vm.startPrank(sybils[i]);
            usdc.approve(address(vault), TOTAL / 10);
            vault.deposit(TOTAL / 10);
            vm.stopPrank();
        }

        address[] memory users = new address[](sybils.length + 1);
        users[0] = whale;
        for (uint256 i = 0; i < sybils.length; i++) {
            users[i + 1] = sybils[i];
        }

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        epochManager.finalizeEpoch(1_000e6);

        // Claims
        vm.prank(whale);
        distributor.claim(1);
        uint256 whaleReward = usdc.balanceOf(whale);

        uint256 sybilTotal;
        for (uint256 i = 0; i < sybils.length; i++) {
            vm.prank(sybils[i]);
            distributor.claim(1);
            sybilTotal += usdc.balanceOf(sybils[i]);
        }

        // Sybil total must NOT exceed whale reward
        assertLe(sybilTotal, whaleReward);
    }
}
