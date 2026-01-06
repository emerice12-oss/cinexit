// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "contracts/core/EpochManager.sol";
import "contracts/core/Treasury.sol";
import "contracts/vault/ParticipationVault.sol";
import "contracts/core/RewardDistributor.sol";
import "contracts/test/mocks/MockUSDC.sol";

contract ZeroDepositGriefingTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    Treasury treasury;
    CircuitBreaker breaker;

    address attacker = address(0xBEEF);
    address honestUser = address(0xA11CE);

    function setUp() public {
        usdc = new MockUSDC();
        treasury = new Treasury(address(usdc));
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();

        // create epoch manager and distributor without circular dependency
        epochManager = new EpochManager(address(breaker), address(vault), address(0));
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));
        // wire epoch manager into the vault so it can call snapshots/finalize
        vault.setEpochManager(address(epochManager));

        // honest user deposits
        usdc.mint(honestUser, 1_000e6);
        vm.startPrank(honestUser);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();

        // advance time and snapshot/finalize epoch 1
        vm.warp(block.timestamp + 1 days);
        address[] memory participants = new address[](1);
        participants[0] = honestUser;

        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, 1);
        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        // finalize in manager (announce rewards for epoch 1)
        epochManager.finalizeEpoch(1_000e6);
    }

    function test_AttackerCannotClaimWithoutDeposit() public {
        uint256 before = usdc.balanceOf(attacker);
        vm.prank(attacker);
        distributor.claim(1);
        uint256 balanceAfter = usdc.balanceOf(attacker);
        assertEq(before, balanceAfter, "Attacker should not gain rewards");
    }
}
