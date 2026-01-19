// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "src/contracts/core/EpochManager.sol";
import {ParticipationVault} from "src/contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "src/contracts/core/RewardDistributor.sol";
import {MockUSDC} from "src/contracts/test/mocks/MockUSDC.sol";
import {CircuitBreaker} from "src/contracts/governance/CircuitBreaker.sol";
import {Treasury} from "src/contracts/core/Treasury.sol";

contract BatchClaimReplayTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;
    Treasury treasury;

    address alice = address(0xA11CE);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));

        // properly instantiate governance & treasury
        breaker = new CircuitBreaker();
        treasury = new Treasury(address(usdc));

        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        // wire contracts
        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund treasury
        usdc.mint(address(treasury), 1_000_000e6);

        usdc.mint(alice, 1_000e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6);
        vm.stopPrank();
    }

    function _finalizeEpoch(uint256 epochId, uint256 revenue) internal {
        address[] memory users = new address[](1);
        users[0] = alice;

        // advance time so weights accrue
        vm.warp(block.timestamp + 1 days);

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, epochId);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        vm.prank(address(epochManager));
        epochManager.finalizeEpoch(revenue);
    }

    function test_BatchClaimCannotBeReplayed() public {
        _finalizeEpoch(1, 1_000e6);
        _finalizeEpoch(2, 2_000e6);

        uint256[] memory epochs = new uint256[](2);
        epochs[0] = 1;
        epochs[1] = 2;

        // First batch claim works
        vm.prank(alice);
        distributor.claimBatch(epochs);

        uint256 balanceAfterFirstClaim = usdc.balanceOf(alice);

        // Replay same batch
        vm.prank(alice);
        distributor.claimBatch(epochs);

        uint256 balanceAfterReplay = usdc.balanceOf(alice);

        // Balance must not increase
        assertEq(balanceAfterReplay, balanceAfterFirstClaim, "Replay batch claim paid rewards twice");
    }
}
