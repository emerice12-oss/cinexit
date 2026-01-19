'use client'

import { useAccount, useChainId } from 'wagmi'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { usePendingReward } from '@/hooks/usePendingReward'
import { useCurrentEpoch } from '@/hooks/useCurrentEpoch'
import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'

export default function Dashboard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { balance = 0n } = useUsdcBalance()
  const { pending = 0n } = usePendingReward()
  const { epoch = 0n } = useCurrentEpoch()

  if (!isConnected) {
    return <div className="p-6">Connect your wallet.</div>
  }

  if (chainId !== 1) {
    return <div className="p-6 text-red-600">Wrong network</div>
  }

  const balanceFormatted = (Number(balance) / 1e6).toFixed(2)
  const pendingFormatted = (Number(pending) / 1e6).toFixed(2)

  return (
    <RequireWalletAndNetwork>
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="p-4 bg-white rounded shadow">
          <p>USDC Balance: <strong>{balanceFormatted}</strong></p>
          <p>Pending Rewards: {pendingFormatted}</p>
          <p>Current Epoch: {epoch.toString()}</p>
          <p>Estimated daily income: ${(Number(balance) / 1e6 * 0.027).toFixed(2)}</p>
        </div>

       
        <div className="p-4 bg-white rounded shadow">
          {/* Real balance, rewards, charts */}
        </div>
      </main>
    </RequireWalletAndNetwork>
  )
}
