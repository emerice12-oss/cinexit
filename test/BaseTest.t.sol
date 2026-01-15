// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Test.sol";

import "../contracts/test/mocks/MockUSDC.sol";
import "../contracts/governance/CircuitBreaker.sol";
import "../contracts/vault/ParticipationVault.sol";
import "../contracts/core/EpochManager.sol";
import "../contracts/core/RewardDistributor.sol";
import "../contracts/core/Treasury.sol";
import "../contracts/oracle/RevenueOracle.sol";

contract BaseTest is Test {
    address internal alice = address(0x1000000000000000000000000000000000000001);
    address internal bob = address(0x2000000000000000000000000000000000000002);
    address internal carol = address(0x3000000000000000000000000000000000000003);
    address internal charlie = address(0x4000000000000000000000000000000000000004);
    address internal admin = address(0x5000000000000000000000000000000000000005);
    address internal attacker = address(0x6000000000000000000000000000000000000006);

    MockUSDC internal usdc;
    CircuitBreaker internal breaker;
    ParticipationVault internal vault;
    RewardDistributor internal distributor;
    EpochManager internal epochManager;
    Treasury internal treasury;
    RevenueOracle internal oracle;

    uint256 internal signerKey1;
    uint256 internal signerKey2;
    address[] internal signers;

    function setUp() public virtual {
        // Core tokens & governance
        usdc = new MockUSDC();
        breaker = new CircuitBreaker();

        // Vault
        vault = new ParticipationVault(address(usdc));

        // Treasury
        treasury = new Treasury(address(usdc));

        // Epoch manager (created first with distributor = address(0) to break circular dependency)
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        // Distributor (proper constructor args: vault, treasury, epochManager)
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        // Wire epoch manager to distributor
        epochManager.setDistributor(address(distributor));

        // Oracle signers (use deterministic private keys for signing in tests)
        signerKey1 = 1;
        signerKey2 = 2;
        signers = new address[](2);
        signers[0] = vm.addr(signerKey1);
        signers[1] = vm.addr(signerKey2);

        oracle = new RevenueOracle(address(epochManager), signers, 2);

        // Wire contracts
        vault.setEpochManager(address(epochManager));
        epochManager.setDistributor(address(distributor));
        treasury.setDistributor(address(distributor));

        // Fund treasury
        usdc.mint(address(treasury), 1_000_000e6);

        // Fund users
        usdc.mint(alice, 10_000e6);
        usdc.mint(bob, 10_000e6);
        // common test actors
        usdc.mint(attacker, 10_000e6);
        usdc.mint(admin, 10_000e6);
    }

    function snapshotAndFinalize(uint256 epochId, address[] memory participants, uint256 rewards) internal {
        // accrue some time
        vm.warp(block.timestamp + 1 days);

        // snapshot users
        vm.prank(address(epochManager));
        vault.snapshotUsers(participants, epochId);

        // finalize in vault (freezes weights)
        vm.prank(address(epochManager));
        vault.finalizeEpoch(epochId);

        // finalize in manager (announces rewards)
        epochManager.finalizeEpoch(rewards);
    }
}
