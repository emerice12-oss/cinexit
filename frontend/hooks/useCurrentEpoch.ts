'use client'

import { useReadContract } from 'wagmi'
import { EPOCH_MANAGER_ABI } from '@/lib/abis/analytics'
import { CONTRACTS } from '@/lib/contracts'

export function useCurrentEpoch() {
  const { data } = useReadContract({
    address: CONTRACTS.EPOCH_MANAGER_ADDRESS as `0x${string}`,
    abi: EPOCH_MANAGER_ABI,
    functionName: 'currentEpoch',
    query: {
      refetchInterval: 6_000,
    },
  })

  return { epoch: (data as bigint) ?? 0n }
} 
