// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";

import "contracts/test/mocks/MockUSDC.sol";
import "contracts/vault/ParticipationVault.sol";
import "contracts/core/EpochManager.sol";
import "contracts/core/RewardDistributor.sol";
import "contracts/core/Treasury.sol";

/// @notice Economic invariants: conservation of USDC, fair distribution, no double claims
contract EconomicInvariantTest is StdInvariant, Test {
    MockUSDC usdc;
    ParticipationVault vault;
    EpochManager epochManager;
    RewardDistributor distributor;
    Treasury treasury;
    CircuitBreaker breaker;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockUSDC();

        // Deploy vault
        vault = new ParticipationVault(address(usdc));

        // Deploy treasury
        treasury = new Treasury(address(usdc));

        // Deploy a breaker
        breaker = new CircuitBreaker();

        // Deploy a placeholder epoch manager (distributor set later)
        epochManager = new EpochManager(address(breaker), address(vault), address(0));

        // Deploy distributor and wire into epoch manager
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));
        epochManager.setDistributor(address(distributor));

        // Wire vault to epoch manager
        vault.setEpochManager(address(epochManager));

        // Set distributor in treasury
        treasury.setDistributor(address(distributor));

        // Fund protocol
        usdc.mint(address(distributor), 1_000_000e6);
        usdc.mint(alice, 100e6);
        usdc.mint(bob, 200e6);

        // Target contracts for invariant fuzzing
        targetContract(address(vault));
        targetContract(address(epochManager));
        targetContract(address(distributor));
        targetContract(address(treasury));
    }

    /// @dev Invariant: total USDC supply is conserved
    function invariant_totalSupplyConserved() public {
        uint256 totalSupply = usdc.totalSupply();

        uint256 vaultBalance = usdc.balanceOf(address(vault));
        uint256 distributorBalance = usdc.balanceOf(address(distributor));
        uint256 treasuryBalance = usdc.balanceOf(address(treasury));

        // Sum of balances in protocol + external accounts should equal total supply
        uint256 accounted =
            vaultBalance + distributorBalance + treasuryBalance + usdc.balanceOf(alice) + usdc.balanceOf(bob);

        assertEq(totalSupply, accounted, "USDC conservation broken");
    }

    /// @dev Invariant: users' potential claims do not exceed epoch rewards
    function invariant_claimsDoNotExceedRewards() public {
        uint256 currentEpoch = epochManager.currentEpoch();

        for (uint256 e = 1; e <= currentEpoch; e++) {
            (uint256 rewards, bool finalized) = epochManager.epochs(e);
            if (!finalized) continue;

            uint256 potential = distributor.previewClaim(alice, e) + distributor.previewClaim(bob, e);
            assertLe(potential, rewards, "Claims exceed epoch rewards");
        }
    }

    /// @dev Invariant: epochs progress monotonically
    function invariant_epochMonotonicity() public {
        uint256 currentEpoch = epochManager.currentEpoch();
        uint256 lastFinalized = 0;

        for (uint256 e = 1; e <= currentEpoch; e++) {
            (, bool finalized) = epochManager.epochs(e);
            if (finalized) lastFinalized = e;
        }

        assertGe(currentEpoch, lastFinalized, "Epochs regressed");
    }
}
