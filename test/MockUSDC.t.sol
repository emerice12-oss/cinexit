// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/test/mocks/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC usdc;
    address testAddr = address(0x123);

    function setUp() public {
        usdc = new MockUSDC();
    }

    function test_MintIncreasesTotalSupplyAndBalance() public {
        uint256 beforeSupply = usdc.totalSupply();
        uint256 beforeBal = usdc.balanceOf(testAddr);

        uint256 amt = 1_000e6;
        usdc.mint(testAddr, amt);

        assertEq(usdc.totalSupply(), beforeSupply + amt);
        assertEq(usdc.balanceOf(testAddr), beforeBal + amt);
    }
}
