// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../governance/CircuitBreaker.sol";
import "../vault/ParticipationVault.sol";
import "./RewardDistributor.sol";

contract EpochManager {
    CircuitBreaker public breaker;
    RewardDistributor public distributor;
    ParticipationVault public vault;

    uint256 public currentEpoch;
    uint256 public constant EPOCH_DURATION = 1 days;

    struct Epoch {
        uint256 rewards;
        bool finalized;
    }

    mapping(uint256 => Epoch) public epochs;

    // Ownership and timelock utilities
    address public owner;
    uint256 public constant TIMELOCK = 2 days;
    mapping(bytes32 => uint256) public queuedAt;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier timelocked(bytes32 action) {
        uint256 t = queuedAt[action];
        require(t != 0 && block.timestamp >= t + TIMELOCK, "TIMELOCK");
        _;
        delete queuedAt[action];
    }

    function queueAction(bytes32 action) external onlyOwner {
        queuedAt[action] = block.timestamp;
    }

    event EpochFinalized(uint256 indexed epoch, uint256 rewards);

    constructor(address _breaker, address _vault, address _distributor) {
        owner = msg.sender;
        breaker = CircuitBreaker(_breaker);
        vault = ParticipationVault(_vault);
        distributor = RewardDistributor(_distributor);
        currentEpoch = 1;
    }

    function setBreaker(address _breaker) external onlyOwner {
        breaker = CircuitBreaker(_breaker);
    }

    function setDistributor(address _distributor) external onlyOwner {
        distributor = RewardDistributor(_distributor);
    }

    // Convenience overload: finalize current epoch with a default reward
    function finalizeEpoch() external {
        this.finalizeEpoch(1_000e6);
    }

    function finalizeEpoch(uint256 rewards) external {
        require(!breaker.isPaused(), "Paused");
        require(!epochs[currentEpoch].finalized, "Epoch already finalized");

        epochs[currentEpoch] = Epoch({
            rewards: rewards,
            finalized: true
        });

        distributor.notifyEpochFinalized(currentEpoch, rewards);

        emit EpochFinalized(currentEpoch, rewards);

        currentEpoch += 1;
    }
}
