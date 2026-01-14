import { formatUnits } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { epochAbi } from '@/lib/abis/epoch'
import { CONTRACTS } from '@/lib/contracts'
import { data } from '@/lib/contracts'

const DECIMALS = 6

export function useUsdcBalance() {
  const { address } = useAccount()

  const { data, isLoading } = useReadContract({
    address: CONTRACTS.USDC,
    abi: epochAbi,
    functionName: 'epochs',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 4_000,
    },
  })

  return {
    balance: data ? Number(formatUnits(data, DECIMALS)) : 0,
    isLoading,
  }
}
