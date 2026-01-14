'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'
import { distributorAbi } from '@/lib/abis/distributor'
import { useState } from 'react'

export default function ClaimPage() {
  const { address } = useAccount()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { data: pending, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_DISTRIBUTOR as `0x${string}`,
    abi: distributorAbi,
    functionName: 'pendingReward',
    args: address ? [address] : undefined,
  })

  const { writeContract, isPending } = useWriteContract({
    mutation: {
      onSuccess(hash) {
        setTxHash(hash)
      },
    },
  })

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const claim = () => {
    writeContract({
      address: process.env.NEXT_PUBLIC_DISTRIBUTOR as `0x${string}`,
      abi: distributorAbi,
      functionName: 'claim',
    })
  }

  const amount = Number(pending || 0) / 1e6

  return (
    <RequireWalletAndNetwork>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full space-y-4">
          <h2 className="text-xl font-semibold">Claim Rewards</h2>

          <div>
            <p className="text-sm text-gray-500">Pending Rewards</p>
            <p className="text-2xl font-bold">{amount.toFixed(2)} USDC</p>
          </div>

          <button
            onClick={claim}
            disabled={amount === 0 || isPending || confirming}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
          >
            {isPending || confirming ? 'Claiming…' : 'Claim USDC'}
          </button>

          {isSuccess && (
            <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
              ✅ Rewards claimed successfully
            </div>
          )}
        </div>
      </main>
    </RequireWalletAndNetwork>
  )
}
