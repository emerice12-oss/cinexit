'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { distributorAbi } from '@/lib/abis/distributor'
import { CONTRACTS } from '@/lib/contracts'

export function usePendingReward() {
  const { address } = useAccount()

  const { data, isLoading } = useReadContract({
    address: CONTRACTS.DISTRIBUTOR,
    abi: distributorAbi,
    functionName: 'pendingReward',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 4_000,
    },
  })

  return {
    pending: (data as bigint) ?? 0n,
    isLoading,
  }
} 
