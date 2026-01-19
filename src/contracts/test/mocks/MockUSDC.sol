// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUSDC {
    string public name = "Mock USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // totalSupply tracks the total number of tokens minted in this mock.
    // Tests and fuzzers may mint to arbitrary addresses; callers should not
    // assume all minted tokens are held by the small set of tracked accounts.
    uint256 public totalSupply;

    // Cap total supply to avoid pathological fuzz inputs that can overflow
    // test-side accumulators. This cap is intentionally very large and
    // will not affect realistic test scenarios.
    uint256 public constant MAX_TOTAL_SUPPLY = 10 ** 30;

    /// @notice Mint tokens for testing. Increases `totalSupply` and can mint to arbitrary addresses (used by fuzzing).
    function mint(address to, uint256 amount) external {
        // Prevent overflow on minting huge amounts during fuzzing
        require(balanceOf[to] + amount >= balanceOf[to], "Mint overflow");
        require(totalSupply + amount >= totalSupply, "TotalSupply overflow");
        // Prevent unbounded total supply from fuzzer values
        require(totalSupply + amount <= MAX_TOTAL_SUPPLY, "TotalSupply cap");
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        // Prevent overflow when crediting recipient
        require(balanceOf[to] + amount >= balanceOf[to], "Transfer overflow");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance too low");
        // Prevent overflow when crediting recipient
        require(balanceOf[to] + amount >= balanceOf[to], "Transfer overflow");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
