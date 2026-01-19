import { useAccount, useReadContract } from 'wagmi'
import { usdcAbi } from '@/lib/abis/usdc'
import { CONTRACTS } from '@/lib/contracts'

export function useUsdcBalance() {
  const { address } = useAccount()

  const { data, isLoading } = useReadContract({
    address: CONTRACTS.USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 4_000,
    },
  })

  return {
    balance: (data as bigint) ?? 0n,
    isLoading,
  }
} 
