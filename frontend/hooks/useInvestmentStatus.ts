'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { CONTRACTS } from '@/lib/contracts'
import { VAULT_ABI } from '@/lib/abis/analytics'
import { distributorAbi } from '@/lib/abis/distributor'
import { CIRCUIT_BREAKER_ABI } from '@/lib/abis/analytics'

export function useInvestmentStatus() {
  const { address } = useAccount()

  const { data: deposited } = useReadContract({
    address: CONTRACTS.PARTICIPATION_VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
  })

  const { data: pending } = useReadContract({
    address: CONTRACTS.REWARD_DISTRIBUTOR_ADDRESS,
    abi: distributorAbi,
    functionName: 'pendingReward',
    args: address ? [address as `0x${string}`] : undefined,
  })

  const { data: paused } = useReadContract({
    address: CONTRACTS.CIRCUIT_BREAKER_ADDRESS,
    abi: CIRCUIT_BREAKER_ABI,
    functionName: 'paused',
  })

  const depositAmount = deposited ? Number(formatUnits(deposited as bigint, 6)) : 0
  const pendingReward = pending ? Number(formatUnits(pending as bigint, 6)) : 0

  return {
    isActive: depositAmount > 0 && !paused,
    isPaused: paused,
    depositAmount,
    pendingReward,
  }
}
