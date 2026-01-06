'use client';

import { useWriteContract } from 'wagmi';

export const REWARD_DISTRIBUTOR =
  '0xYourRewardDistributorAddress';

const BATCH_ABI = [
  {
    name: 'claimBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'epochs', type: 'uint256[]' }
    ],
    outputs: [],
  },
] as const;

export function useBatchClaim() {
  return useWriteContract();
}
