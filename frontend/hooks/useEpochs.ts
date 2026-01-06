'use client';

import { useReadContract } from 'wagmi';

export const EPOCH_MANAGER =
  '0xYourEpochManagerAddress';

const EPOCH_ABI = [
  {
    name: 'currentEpoch',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'epochs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'epoch', type: 'uint256' }],
    outputs: [
      { name: 'rewards', type: 'uint256' },
      { name: 'finalized', type: 'bool' },
    ],
  },
  {
    name: 'epochRevenue',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'epoch', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useCurrentEpoch() {
  return useReadContract({
    address: EPOCH_MANAGER,
    abi: EPOCH_ABI,
    functionName: 'currentEpoch',
  });
}

export function useEpochFinalized(epoch?: bigint) {
  const r = useReadContract({
    address: EPOCH_MANAGER,
    abi: EPOCH_ABI,
    functionName: 'epochs',
    args: epoch !== undefined ? [epoch] : undefined,
  });

  return {
    data: r.data ? (r.data as any)[1] : undefined,
    error: r.error,
    isLoading: r.isLoading,
  } as const;
}

export function useEpochRevenue(epoch?: bigint) {
  return useReadContract({
    address: EPOCH_MANAGER,
    abi: EPOCH_ABI,
    functionName: 'epochRevenue',
    args: epoch !== undefined ? [epoch] : undefined,
  });
}
