// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../contracts/core/RewardDistributor.sol";
import "../../contracts/test/mocks/MockUSDC.sol";
import "../../contracts/core/EpochManager.sol";
import "../../contracts/vault/ParticipationVault.sol";
import "../../contracts/governance/CircuitBreaker.sol";

contract OracleSettlementFuzz is Test {
    RewardDistributor distributor;
    MockUSDC usdc;
    ParticipationVault vault;
    EpochManager epochManager;

    address oracle = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new ParticipationVault(address(usdc));
        distributor = new RewardDistributor(address(vault), address(0), address(0));

        // create a breaker and epoch manager and wire it to the vault and distributor
        CircuitBreaker breaker = new CircuitBreaker();
        epochManager = new EpochManager(address(breaker), address(vault), address(distributor));
        vault.setEpochManager(address(epochManager));

        usdc.mint(address(vault), 1_000_000e6);
        usdc.mint(address(distributor), 1_000_000e6);
    }

    function testFuzz_settlementMonotonic(uint256 amount) public {
        vm.assume(amount < 100_000e6);

        vm.prank(oracle);
        epochManager.finalizeEpoch(amount);

        // once finalized, the epoch at index 1 should be marked finalized
        (uint256 rewards, bool finalized) = epochManager.epochs(1);
        assertTrue(finalized);
        assertEq(rewards, amount);
    }
}
