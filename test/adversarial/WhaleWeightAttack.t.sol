// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {EpochManager} from "contracts/core/EpochManager.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";

contract WhaleWeightAttackTest is Test {
    ParticipationVault vault;
    EpochManager epochManager;
    RewardDistributor distributor;
    MockUSDC usdc;
    Treasury treasury;

    address whale = address(0xBEEF);
    address honestUser = address(0xCAFE);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        epochManager = new EpochManager(address(this), address(vault), address(0));

        treasury = new Treasury(address(usdc));

        // setup breaker, fund treasury, and distributor
        CircuitBreaker breaker = new CircuitBreaker();
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        vault.setEpochManager(address(epochManager));
        vault.setBreaker(address(breaker));
        epochManager.setBreaker(address(breaker));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund the treasury for epoch payouts
        usdc.mint(address(treasury), 1_000_000e6);

        usdc.mint(whale, 1_000_000e6);
        usdc.mint(honestUser, 1_000e6);

        vm.prank(whale);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(honestUser);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_WhaleCannotFlashDepositStealEpoch() public {
        // Honest user deposits early
        vm.prank(honestUser);
        vault.deposit(1_000e6);

        // Whale deposits huge amount right before epoch end
        vm.warp(block.timestamp + 23 hours);

        vm.prank(whale);
        vault.deposit(1_000_000e6);

        // Whale immediately withdraws
        vm.prank(whale);
        vault.withdraw(1_000_000e6);

        // Epoch ends
        vm.warp(block.timestamp + 2 hours);
        // take per-user snapshots then finalize vault epoch (records accrued weights), then notify manager
        address[] memory users = new address[](2);
        users[0] = honestUser;
        users[1] = whale;
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        epochManager.finalizeEpoch(1_000e6);

        // Honest user claims
        vm.prank(honestUser);
        uint256 beforeHonest = usdc.balanceOf(honestUser);
        vm.prank(honestUser);
        distributor.claim(1);
        uint256 honestClaim = usdc.balanceOf(honestUser) - beforeHonest;

        // Whale claims
        vm.prank(whale);
        uint256 beforeWhale = usdc.balanceOf(whale);
        vm.prank(whale);
        distributor.claim(1);
        uint256 whaleClaim = usdc.balanceOf(whale) - beforeWhale;

        // Whale should not dominate rewards
        assertLt(whaleClaim, honestClaim, "Whale improperly captured epoch rewards");
    }
}
