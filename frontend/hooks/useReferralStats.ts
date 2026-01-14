'use client'

import { useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { VAULT_ABI } from '@/lib/abis/analytics'
import { CONTRACTS } from '@/lib/contracts'

export function useReferralStats() {
  const { address } = useAccount()

  const { data: referrer } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'referrerOf',
    args: address ? [address] : undefined,
  })

  const { data: volume } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'referralVolume',
    args: address ? [address] : undefined,
  })

  return {
    referrer,
    volume: volume ? Number(formatUnits(volume as bigint, 6)) : 0,
  }
}
