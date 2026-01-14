'use client'

import { useReadContract } from 'wagmi'
import { EPOCH_MANAGER_ABI } from '@/lib/abis/analytics'
import { CONTRACTS } from '@/lib/contracts'

export function useCurrentEpoch() {
  const { data } = useReadContract({
    address: CONTRACTS.EPOCH_MANAGER,
    abi: EPOCH_MANAGER_ABI,
    functionName: 'currentEpoch',
    query: {
      refetchInterval: 6_000,
    },
  })

  return Number(data ?? 0)
}
