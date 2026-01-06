'use client';

import { useReadContract, useWriteContract } from 'wagmi';

export const REWARD_DISTRIBUTOR =
  '0xYourRewardDistributorAddress';

const REWARD_ABI = [
  {
    name: 'previewClaim',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'epochId', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'epochId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'claimBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'epochIds', type: 'uint256[]' }],
    outputs: [],
  },
] as const;

// NOTE: previewClaim is available per-epoch; aggregating total claimable across many
// epochs requires fetching the epoch list and calling previewClaim for each epoch.
// For now, return a safe placeholder to avoid runtime errors. Implement aggregation
// in a follow-up change.
export function useClaimableRewards(user?: `0x${string}`) {
  return { data: 0n } as const;
}

export function useClaimRewards() {
  return useWriteContract();
}
