// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/EpochManager.sol";
import "../vault/ParticipationVault.sol";
import "../core/Treasury.sol";

contract RewardDistributor {
    EpochManager public epochManager;
    ParticipationVault public vault;
    Treasury public treasury;

    // epochId => user => claimed
    mapping(uint256 => mapping(address => bool)) public claimed;

    event RewardClaimed(address indexed user, uint256 indexed epochId, uint256 amount);
    event BatchClaimed(address indexed user, uint256 totalAmount);

    // FIXED constructor order
    constructor(
        address _vault, 
        address _treasury, 
        address _epochManager
    ) {
        vault = ParticipationVault(_vault);
        treasury = Treasury(_treasury);
        epochManager = EpochManager(_epochManager);
    }

    /* ========== SINGLE CLAIM ========== */
    function claim(uint256 epochId) external {
        uint256 reward = _claimEpoch(epochId);
        // Do not revert on zero reward for a single claim; match behavior of claimBatch
        if (reward == 0) return;

        emit RewardClaimed(msg.sender, epochId, reward);
    }

    /* ========== BATCH CLAIM ========== */
    function claimBatch(uint256[] calldata epochIds) external {
        uint256 length = epochIds.length;
        require(length > 0, "Empty batch");

        uint256 totalReward = 0;

        for (uint256 i = 0; i < length; ) {
            uint256 ep = epochIds[i];
            uint256 r = _claimEpoch(epochIds[i]);
            // Do not revert on zero reward for an epoch; just skip it
            if (r > 0)
               totalReward += r;
            unchecked { ++i; }
        }

        if (totalReward == 0) return;

        emit BatchClaimed(msg.sender, totalReward);
    }

    /* ========== INTERNAL CLAIM LOGIC ========== */
    function _claimEpoch(uint256 epochId)
        internal
        returns (uint256)
    {
        // If already claimed, skip
        if (claimed[epochId][msg.sender]) return 0;

        (uint256 revenue, bool finalized) =
            epochManager.epochs(epochId);

        // if epoch not finalized or revenue is zero, nothing to claim
        if (!finalized || revenue == 0) return 0;

        uint256 totalWeight =
            vault.getEpochTotalWeight(epochId);
        if (totalWeight == 0) return 0;

        uint256 userWeight =
            vault.getUserEpochWeight(msg.sender, epochId);
        if (userWeight == 0) return 0;

        // If the user has withdrawn before claiming, disallow flash-reward claims
        // (prevents flash deposit -> snapshot -> withdraw -> claim attacks)
        uint256 userDeposit = vault.getUserDeposit(msg.sender);
        if (userDeposit == 0) return 0;

        uint256 reward = (revenue * userWeight) / totalWeight;

        if (reward == 0) {
            // Nothing to claim, don't mark as claimed
            return 0;
        }

        claimed[epochId][msg.sender] = true;

        treasury.pay(msg.sender, reward);

        return reward;
    }

    function previewClaim(address user, uint256 epochId) external view returns (uint256) {
        (uint256 revenue, bool finalized) = epochManager.epochs(epochId);
        if (!finalized || revenue == 0) return 0;

        uint256 totalWeight = vault.getEpochTotalWeight(epochId);
        if (totalWeight == 0) return 0;

        uint256 userWeight = vault.getUserEpochWeight(user, epochId);
        if (userWeight == 0) return 0;

        uint256 userDeposit = vault.getUserDeposit(user);
        if (userDeposit == 0) return 0;

        return (revenue * userWeight) / totalWeight;
    }

    function notifyEpochFinalized(uint256, uint256) external {
        // optional hook
    }
}
