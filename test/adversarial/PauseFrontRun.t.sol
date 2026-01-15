// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {EpochManager} from "contracts/core/EpochManager.sol";
import {ParticipationVault} from "contracts/vault/ParticipationVault.sol";
import {RewardDistributor} from "contracts/core/RewardDistributor.sol";
import {CircuitBreaker} from "contracts/governance/CircuitBreaker.sol";
import {Treasury} from "contracts/core/Treasury.sol";
import {MockUSDC} from "contracts/test/mocks/MockUSDC.sol";

contract PauseFrontRunTest is Test {
    EpochManager epochManager;
    ParticipationVault vault;
    RewardDistributor distributor;
    CircuitBreaker breaker;
    Treasury treasury;
    MockUSDC usdc;

    address alice = address(0xA11CE);

    function setUp() public {
        usdc = new MockUSDC();

        breaker = new CircuitBreaker();

        // Vault
        vault = new ParticipationVault(address(usdc));

        // Treasury
        treasury = new Treasury(address(usdc));

        // Epoch manager (distributor set later to break circular dependency)
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        // Distributor
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        // Wire contracts
        epochManager.setDistributor(address(distributor));
        vault.setEpochManager(address(epochManager));
        vault.setBreaker(address(breaker));
        treasury.setDistributor(address(distributor));

        usdc.mint(alice, 1_000e6);
        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_PauseCannotStealRewards() public {
        vm.startPrank(alice);

        // Deposit
        vault.deposit(1_000e6);

        vm.stopPrank();

        // Advance time so Alice accrues weight, then snapshot
        vm.warp(block.timestamp + 1 days);
        vm.prank(address(epochManager));
        vault.snapshotUser(alice, 1);

        // Finalize epoch and fund treasury
        vm.warp(block.timestamp + 1 days);
        usdc.mint(address(treasury), 1_000_000e6);
        epochManager.finalizeEpoch(1_000e6);

        // Pause just before claim (pause should NOT prevent claiming)
        breaker.pause();

        uint256 before = usdc.balanceOf(alice);

        vm.prank(alice);
        distributor.claim(1);

        uint256 afterBal = usdc.balanceOf(alice);

        // ✅ Reward must still be received while paused
        assertGt(afterBal, before, "Pause blocked or altered rewards");

        // Unpause (sanity)
        breaker.unpause();
    }
}
