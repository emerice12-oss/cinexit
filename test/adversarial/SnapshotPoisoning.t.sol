// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {ParticipationVault} from "src/contracts/vault/ParticipationVault.sol";
import {EpochManager} from "src/contracts/core/EpochManager.sol";
import {MockUSDC} from "src/contracts/test/mocks/MockUSDC.sol";

contract SnapshotPoisoningTest is Test {
    ParticipationVault vault;
    EpochManager epochManager;
    MockUSDC usdc;

    address attacker = address(0xBAD);
    address honest = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        epochManager = new EpochManager(address(this), address(vault), address(0));

        vault.setEpochManager(address(epochManager));

        usdc.mint(honest, 1_000e6);
    }

    function test_ZeroDepositCannotBeSnapshotted() public {
        address[] memory users = new address[](1);
        users[0] = attacker;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        assertEq(vault.getUserEpochWeight(attacker, 1), 0);
    }

    function test_SnapshotOrderDoesNotChangeWeight() public {
        vm.startPrank(honest);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6);
        vm.stopPrank();

        address[] memory users = new address[](2);
        users[0] = honest;
        users[1] = attacker;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        uint256 weight1 = vault.getUserEpochWeight(honest, 1);

        // Reverse order
        users[0] = attacker;
        users[1] = honest;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        uint256 weight2 = vault.getUserEpochWeight(honest, 1);

        assertEq(weight1, weight2);
    }

    function test_CannotSnapshotSameUserTwice() public {
        vm.startPrank(honest);
        usdc.approve(address(vault), 500e6);
        vault.deposit(500e6);
        vm.stopPrank();

        address[] memory users = new address[](1);
        users[0] = honest;

        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        uint256 first = vault.getUserEpochWeight(honest, 1);

        // Attempt second snapshot
        vm.prank(address(epochManager));
        vault.snapshotUsers(users, 1);

        uint256 second = vault.getUserEpochWeight(honest, 1);

        assertEq(first, second);
    }
}
