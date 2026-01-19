'use client'

import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'
import { useCurrentEpoch } from '@/hooks/useCurrentEpoch'
import { estimateDailyIncome } from '@/lib/calc'
import { VAULT_ABI } from '@/lib/abis/analytics'
import { distributorAbi } from '@/lib/abis/distributor'
import { useAccount, useReadContract } from 'wagmi'

export default function InvestmentPage() {
  const { address } = useAccount()

  const { data: deposited } = useReadContract({
    address: process.env.NEXT_PUBLIC_PARTICIPATION_VAULT_ADDRESS as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'totalDeposit',
    args: address ? [address] : undefined,
  })

  const { data: pending } = useReadContract({
    address: process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS as `0x${string}`,
    abi: distributorAbi,
    functionName: 'pendingReward',
    args: address ? [address] : undefined,
  })

  const {
    isActive,
    isPaused,
    depositAmount,
    pendingReward,
  } = useInvestmentStatus()

  const { epoch = 0n } = useCurrentEpoch()
  const dailyIncome = estimateDailyIncome(depositAmount)

  return (
    <RequireWalletAndNetwork>
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Investment Status</h1>

        {/* Status */}
        <div className="p-4 rounded bg-white shadow">
          <p>
            Status:{' '}
            <span className={isActive ? 'text-green-600' : 'text-yellow-600'}>
              {isPaused ? 'System Paused' : isActive ? 'Running' : 'Inactive'}
            </span>
          </p>
          <p>Current Epoch: {epoch.toString()}</p>
        </div>

        {/* Capital */}
        <div className="p-4 rounded bg-white shadow">
          <p>Deposited Capital: {depositAmount.toFixed(2)} USDC</p>
          <p>Estimated Daily Income: ${dailyIncome.toFixed(2)}</p>
        </div>

        {/* Rewards */}
        <div className="p-4 rounded bg-white shadow">
          <p>Pending Rewards: {pendingReward.toFixed(2)} USDC</p>
          <p className="text-sm text-gray-500">
            Rewards accrue daily and are settled per epoch.
          </p>
        </div>

        {/* Safety */}
        <div className="p-4 rounded bg-gray-50 border">
          <h3 className="font-semibold">System Safety</h3>
          <ul className="text-sm mt-2 space-y-1">
            <li>✔ Funds stay in your wallet or vault</li>
            <li>✔ Smart contract–controlled rewards</li>
            <li>✔ Circuit breaker protection</li>
            <li>✔ No manual withdrawals by team</li>
          </ul>
        </div>
      </main>
    </RequireWalletAndNetwork>
  )
}
