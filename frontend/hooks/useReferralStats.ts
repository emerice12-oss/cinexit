'use client'

import { useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { vaultAbi } from '@/lib/abis/vaultAbi'
import { CONTRACTS } from '@/lib/contracts'

export function useReferralStats() {
  const { address } = useAccount()

  const { data: referrer } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: vaultAbi,
    functionName: 'referrerOf',
    args: address ? [address] : undefined,
  })

  const { data: volume } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: vaultAbi,
    functionName: 'referralVolume',
    args: address ? [address] : undefined,
  })

  return {
    referrer,
    volume: volume ? Number(formatUnits(volume, 6)) : 0,
  }
}
