// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "contracts/test/mocks/MockUSDC.sol";
import "contracts/vault/ParticipationVault.sol";
import "contracts/core/EpochManager.sol";
import "contracts/core/RewardDistributor.sol";
import "contracts/core/Treasury.sol";
import "contracts/governance/CircuitBreaker.sol";

contract EpochSkipAttackTest is Test {
    MockUSDC usdc;
    ParticipationVault vault;
    EpochManager epochManager;
    RewardDistributor distributor;
    CircuitBreaker breaker;

    address attacker = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        breaker = new CircuitBreaker();

        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        Treasury treasury = new Treasury(address(usdc));
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // fund protocol
        usdc.mint(address(treasury), 1_000e6);
        usdc.mint(attacker, 100e6);
    }

    function test_CannotClaimPastEpochRewards() public {
        // finalize epoch 1 with rewards
        epochManager.finalizeEpoch(1_000e6);

        // attacker deposits AFTER epoch finalized
        vm.startPrank(attacker);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(100e6);
        vm.stopPrank();

        // attacker tries to claim epoch 1
        vm.startPrank(attacker);
        uint256 balanceBefore = usdc.balanceOf(attacker);
        // claim should not give rewards
        distributor.claim(1);
        vm.stopPrank();
        uint256 balanceAfter = usdc.balanceOf(attacker);
        assertEq(balanceBefore, balanceAfter, "Attacker should not gain rewards");
    }
}
