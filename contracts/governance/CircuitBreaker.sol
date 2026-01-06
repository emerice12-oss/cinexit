// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

contract CircuitBreaker {
    bool public paused;

    event Paused();
    event Unpaused();

    function pause() external {
        paused = true;
        emit Paused();
    }

    function unpause() external {
        paused = false;
        emit Unpaused();
    }

    function isPaused() external view returns (bool) {
        return paused;
    }
}
