// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";

contract Treasury {
    IERC20 public immutable USDC;
    address public distributor;

    constructor(address _usdc) {
        USDC = IERC20(_usdc);
    }

    function setDistributor(address _distributor) external {
        require(distributor == address(0), "Already set");
        distributor = _distributor;
    }

    function transferToDistributor(uint256 amount) external {
        require(msg.sender == distributor, "Not distributor");
        USDC.transfer(distributor, amount);
    }

    function pay(address to, uint256 amount) external {
        USDC.transfer(to, amount);
    }
}
