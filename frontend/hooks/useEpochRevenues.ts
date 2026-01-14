'use client'

import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { epochAbi } from '@/lib/abis/epoch'

export function useEpochRevenues(
  epochManagerAddress: `0x${string}`,
  latestEpoch = 10
) {
  const publicClient = usePublicClient()
  const [data, setData] = useState<number[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!publicClient) return
    if (!epochManagerAddress || latestEpoch <= 0) return

    let mounted = true
    setIsLoading(true)
    setError(null)

    const iface = epochAbi as any

    const load = async () => {
      try {
        const calls = Array.from({ length: latestEpoch }, (_, i) => i + 1)
        const results = await Promise.all(
          calls.map((epoch) =>
            publicClient
              .readContract({ address: epochManagerAddress, abi: iface, functionName: 'epochs', args: [BigInt(epoch)] })
              .catch(() => null)
          )
        )

        if (!mounted) return

        const revenues = results.map((r) => {
          if (!r) return 0
          // r[0] is rewards (BigInt)
          const resAny = r as any
          try {
            return Number(resAny[0]) / 1e6
          } catch {
            return Number(BigInt(resAny[0])) / 1e6
          }
        })

        setData(revenues)
      } catch (err) {
        if (!mounted) return
        setError(err)
        setData([])
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [publicClient, epochManagerAddress, latestEpoch])

  return { data, isLoading, error }
}
