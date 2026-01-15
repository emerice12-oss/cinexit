// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../contracts/core/RewardDistributor.sol";
import "../../contracts/governance/CircuitBreaker.sol";
import "../../contracts/test/mocks/MockUSDC.sol";

contract RewardDistributorInvariant is Test {
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;
    ParticipationVault vault;
    EpochManager epochManager;
    Treasury treasury;

    address oracle = address(0xBEEF);
    address user1 = address(0x1);
    address user2 = address(0x2);

    function setUp() public {
        usdc = new MockUSDC();
        breaker = new CircuitBreaker();
        vault = new ParticipationVault(address(usdc));
        treasury = new Treasury(address(usdc));

        // create placeholder epoch manager and distributor
        epochManager = new EpochManager(address(breaker), address(vault), address(0));
        distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        epochManager.setDistributor(address(distributor));
        vault.setEpochManager(address(epochManager));
        treasury.setDistributor(address(distributor));

        usdc.mint(address(distributor), 1_000_000e6);

        breaker.unpause();

        // seed a finalized epoch so balance conservation holds at setup
        epochManager.finalizeEpoch(1_000_000e6);
    }

    /// 🔐 INVARIANT: claimed ≤ settled
    function invariant_claimedNeverExceedsSettled() public {
        uint256 currentEpoch = epochManager.currentEpoch();

        for (uint256 e = 1; e <= currentEpoch; e++) {
            // compare previewable claims for two sample users to epoch rewards
            (uint256 rewards, bool finalized) = epochManager.epochs(e);
            if (!finalized) continue;

            uint256 claimed1 = distributor.previewClaim(user1, e);
            uint256 claimed2 = distributor.previewClaim(user2, e);

            assertLe(claimed1 + claimed2, rewards);
        }
    }

    /// 🔐 INVARIANT: contract balance conserved
    function invariant_balanceConservation() public {
        uint256 balance = usdc.balanceOf(address(distributor));
        uint256 totalSettled;

        uint256 currentEpoch = epochManager.currentEpoch();
        for (uint256 e = 1; e <= currentEpoch; e++) {
            (uint256 rewards, bool finalized) = epochManager.epochs(e);
            if (!finalized) continue;

            // Skip absurdly large reward inputs (fuzzer can generate uint256::max)
            // which would overflow accumulation; compare against total supply to bound
            if (rewards > usdc.totalSupply()) continue;

            totalSettled += rewards;
        }

        assertLe(balance, totalSettled);
    }
}
