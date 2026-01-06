// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./BaseTest.t.sol";
import "../contracts/utils/EpochMath.sol";

contract ParticipationVaultTest is BaseTest {
    uint256 internal epochId;

    function setUp() public override {
        super.setUp();
        epochId = 1;
    }

    function test_DepositAndTimeWeightedAccrual() public {
        // Mint for Alice
        usdc.mint(alice, 1_000e6);

        vm.startPrank(alice);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days);

        address[] memory participants = new address[](1);
        participants[0] = alice;

        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, epochId);

        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        uint256 weight = vault.getUserEpochWeight(alice, epochId);
        uint256 effectiveBalance = EpochMath.weightedBalance(1_000e6);

        assertEq(weight, effectiveBalance * 1 days);
    }

    function test_AntiWhaleWeightTiers() public {
        // Mint enough for Bob
        usdc.mint(bob, 200_000e6);

        vm.startPrank(bob);
        usdc.approve(address(vault), 200_000e6);
        vault.deposit(200_000e6);
        vm.stopPrank();

        uint256 weighted = EpochMath.weightedBalance(200_000e6);

        // Tiered calculation: 1k*1 + 9k*0.7 + 90k*0.4 + 100k*0.2
        uint256 expected = 1_000e6
            + (9_000e6 * 70) / 100
            + (90_000e6 * 40) / 100
            + (100_000e6 * 20) / 100;

        assertEq(weighted, expected);
    }
}
