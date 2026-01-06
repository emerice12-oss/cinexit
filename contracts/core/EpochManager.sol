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

    event EpochFinalized(uint256 indexed epoch, uint256 rewards);

    constructor(address _breaker, address _vault, address _distributor) {
        breaker = CircuitBreaker(_breaker);
        vault = ParticipationVault(_vault);
        distributor = RewardDistributor(_distributor);
        currentEpoch = 1;
    }

    function setBreaker(address _breaker) external {
        breaker = CircuitBreaker(_breaker);
    }

    function setDistributor(address _distributor) external {
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
