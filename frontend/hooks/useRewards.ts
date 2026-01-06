'use client';

import { useReadContract, useWriteContract } from 'wagmi';

export const REWARD_DISTRIBUTOR =
  '0xYourRewardDistributorAddress';

const REWARD_ABI = [
  {
    name: 'claimable',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

export function useClaimableRewards(user?: `0x${string}`) {
  return useReadContract({
    address: REWARD_DISTRIBUTOR,
    abi: REWARD_ABI,
    functionName: 'claimable',
    args: user ? [user] : undefined,
  });
}

export function useClaimRewards() {
  return useWriteContract();
}
