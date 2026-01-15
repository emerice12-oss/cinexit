// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract VaultInvariantTest is BaseTest {
    address[] internal users;

    function setUp() public override {
        super.setUp();

        users.push(alice);
        users.push(bob);
        users.push(charlie);

        // fund users
        for (uint256 i = 0; i < users.length; i++) {
            usdc.mint(users[i], 100_000e6);
        }
    }

    /// @dev Total deposits must equal sum of user deposits
    function invariant_totalDepositsMatchesUsers() public {
        uint256 sum;

        for (uint256 i = 0; i < users.length; i++) {
            sum += vault.getUserDeposit(users[i]);
        }

        assertEq(sum, vault.totalDeposits());
    }

    function invariant_epochWeightConsistency() public {
        uint256 epoch = vault.getCurrentEpoch();
        uint256 totalWeight = vault.getEpochTotalWeight(epoch);

        uint256 sum;
        for (uint256 i = 0; i < users.length; i++) {
            sum += vault.getUserEpochWeight(users[i], epoch);
        }

        assertLe(sum, totalWeight);
    }
}
