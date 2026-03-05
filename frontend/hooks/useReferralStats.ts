'use client'

import { useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { participationVaultAbi } from '@/lib/abis/vault'
import { CONTRACTS } from '@/lib/contracts'

export function useReferralStats() {
  const { address } = useAccount()

  const { data: referrer } = useReadContract({
    address: CONTRACTS.PARTICIPATION_VAULT_ADDRESS,
    abi: participationVaultAbi,
    functionName: 'referrer',
    args: address ? [address] : undefined,
  })

  const { data: volume } = useReadContract({
    address: CONTRACTS.PARTICIPATION_VAULT_ADDRESS,
    abi: participationVaultAbi,
    functionName: 'referralVolume',
    args: address ? [address] : undefined,
  })

  return {
    referrer,
    volume: volume ? Number(formatUnits(volume as bigint, 6)) : 0,
  }
}
