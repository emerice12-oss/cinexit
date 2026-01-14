'use client'

import { useAccount, useChainId } from 'wagmi'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { usePendingReward } from '@/hooks/usePendingReward'
import { useCurrentEpoch } from '@/hooks/useCurrentEpoch'
import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'

export default function Dashboard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const balance = useUsdcBalance()
  const { pending } = usePendingReward()
  const { epoch } = useCurrentEpoch()

  if (!isConnected) {
    return <div className="p-6">Connect your wallet.</div>
  }

  if (chainId !== 31337) {
    return <div className="p-6 text-red-600">Wrong network</div>
  }

  return (
    <RequireWalletAndNetwork>
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="p-4 bg-white rounded shadow">
          <p>USDC Balance: <strong>{balance.toFixed(2)}</strong></p>
          <p>Pending Rewards: {pending.toFixed(2)}</p>
          <p>Current Epoch: {epoch}</p>
          <p>Estimated daily income: ${(balance * 0.027).toFixed(2)}</p>
        </div>

       
        <div className="p-4 bg-white rounded shadow">
          {/* Real balance, rewards, charts */}
        </div>
      </main>
    </RequireWalletAndNetwork>
  )
}
