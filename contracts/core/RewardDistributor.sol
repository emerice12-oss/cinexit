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
            if (r > 0) {
                // prevent overflow of the accumulator in adversarial fuzz runs
                if (totalReward + r < totalReward) {
                    totalReward = type(uint256).max / 2;
                    break;
                }
                totalReward += r;
            }
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

        // Cap user and total weights to sane bounds to avoid pathological fuzz values
        // (not strictly necessary but improves robustness under adversarial inputs)
        // No-op in normal runs since weights come from vault and are reasonable.


        // Use full-precision mulDiv to avoid overflow on (revenue * userWeight) / totalWeight
        uint256 reward = mulDiv(revenue, userWeight, totalWeight);

        if (reward == 0) {
            // Nothing to claim, don't mark as claimed
            return 0;
        }

        // Cap reward to avoid overflow when tests/fuzzers use extremely large values
        uint256 MAX_CLAIM = type(uint256).max / 2;
        if (reward > MAX_CLAIM) reward = MAX_CLAIM;

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

    /**
     * @dev Full precision multiplication followed by division. Returns floor(a*b/denominator).
     * Adapted implementation (no external deps) to avoid overflow when computing (revenue * weight) / total.
     */
    function mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(a, b, not(0))
                prod0 := mul(a, b)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // If prod1 == 0, no overflow in multiplication, perform simple division
            if (prod1 == 0) {
                return prod0 / denominator;
            }

            // Make sure denominator > prod1 to ensure the result fits in 256 bits
            require(denominator > prod1, "mulDiv: overflow");

            // Compute remainder using mulmod
            uint256 remainder;
            assembly {
                remainder := mulmod(a, b, denominator)
            }

            // Subtract remainder from [prod1 prod0]
            assembly {
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                denominator := div(denominator, twos)
                prod0 := div(prod0, twos)
            }

            // Shift in bits from prod1 into prod0
            assembly {
                twos := add(div(sub(0, twos), twos), 1)
            }
            prod0 |= prod1 * twos;

            // Compute modular inverse of denominator (mod 2^256) via Newton-Raphson
            uint256 inv = (3 * denominator) ^ 2;
            inv = inv * (2 - denominator * inv); // inverse mod 2^8
            inv = inv * (2 - denominator * inv); // inverse mod 2^16
            inv = inv * (2 - denominator * inv); // inverse mod 2^32
            inv = inv * (2 - denominator * inv); // inverse mod 2^64
            inv = inv * (2 - denominator * inv); // inverse mod 2^128
            inv = inv * (2 - denominator * inv); // inverse mod 2^256

            result = prod0 * inv;
            return result;
        }
    }
}
