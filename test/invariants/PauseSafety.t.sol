// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/contracts/core/RewardDistributor.sol";
import "../../src/contracts/governance/CircuitBreaker.sol";
import "../../src/contracts/test/mocks/MockUSDC.sol";

contract PauseSafety is Test {
    RewardDistributor distributor;
    MockUSDC usdc;
    CircuitBreaker breaker;

    function setUp() public {
        usdc = new MockUSDC();
        breaker = new CircuitBreaker();
        distributor = new RewardDistributor(address(usdc), address(0xBEEF), address(breaker));

        usdc.mint(address(distributor), 1_000_000e6);

        vm.prank(address(this));
        breaker.unpause();
    }

    function test_pauseBlocksClaims() public {
        breaker.pause();

        vm.expectRevert();
        distributor.claim(1);
    }
}
