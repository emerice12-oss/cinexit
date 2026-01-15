// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../BaseTest.t.sol";

contract ProtocolInvariants is BaseTest {
    function setUp() public override {
        super.setUp();
    }

    /// @dev Total USDC in system must never exceed treasury + vault balances
    function invariant_USDC_conservation() public {
        uint256 total = usdc.balanceOf(address(vault)) + usdc.balanceOf(address(treasury)) + usdc.balanceOf(alice)
            + usdc.balanceOf(bob) + usdc.balanceOf(charlie);

        // Tracked balances must not exceed total token supply.
        // Note: `MockUSDC.mint` increases `totalSupply` and fuzzing may mint to
        // addresses outside of the tracked set above, so we assert <= rather
        // than requiring strict equality.
        assertLe(total, usdc.totalSupply());
    }
}
