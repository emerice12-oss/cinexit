// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/contracts/test/mocks/MockUSDC.sol";
import "../src/contracts/governance/CircuitBreaker.sol";
import "../src/contracts/vault/ParticipationVault.sol";
import "../src/contracts/core/EpochManager.sol";

contract ParticipationVaultFinalizeEventTest is Test {
    MockUSDC usdc;
    CircuitBreaker breaker;
    ParticipationVault vault;
    EpochManager epochManager;
    address alice = address(0xA1);

    // Mirror the vault event (we only check the indexed epochId topic)
    event EpochFinalized(uint256 indexed epochId, uint256 totalWeight);

    function setUp() public {
        usdc = new MockUSDC();
        breaker = new CircuitBreaker();
        vault = new ParticipationVault(address(usdc));
        epochManager = new EpochManager(address(breaker), address(vault), address(0));
        vault.setEpochManager(address(epochManager));

        // fund alice
        usdc.mint(alice, 100e6);
    }

    function test_VaultEmitsEpochFinalized() public {
        // deposit and let time pass to accrue weight
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days);

        // expect the EpochFinalized event for epoch 1 (ignore totalWeight data check)
        vm.expectEmit(true, true, false, false);
        emit EpochFinalized(1, 0);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(1);

        uint256 totalWeight = vault.getEpochTotalWeight(1);
        assertGt(totalWeight, 0);
    }
}
