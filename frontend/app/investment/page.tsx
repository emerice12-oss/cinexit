'use client'

import { useAccount, useChainId } from 'wagmi'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'
import { useCurrentEpoch } from '@/hooks/useCurrentEpoch'

export default function InvestmentPage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { isActive, isPaused, depositAmount, pendingReward } = useInvestmentStatus()
  const { epoch = 0n } = useCurrentEpoch()
  const wrongNetwork = isConnected && chainId !== 1

  const dailyIncome = depositAmount * 0.027 / 365

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md border-2 border-blue-200 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your investment status.</p>
        </div>
      </main>
    )
  }

  if (wrongNetwork) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="p-8 bg-red-100 rounded-lg shadow-lg max-w-md border-2 border-red-300 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Wrong Network</h2>
          <p className="text-red-700">Please switch to Mainnet (Chain ID: 1).</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">📊 Investment Status</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
          <div className={`p-6 rounded-lg shadow-lg text-white ${isPaused ? 'bg-red-600' : isActive ? 'bg-green-600' : 'bg-yellow-600'}`}>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-3xl font-bold">{isPaused ? '⛔ Paused' : isActive ? '✅ Running' : '⏸️ Inactive'}</p>
            <p className="text-sm mt-2 opacity-90">{isPaused ? 'System is paused' : isActive ? 'Investment is running' : 'No active investment'}</p>
          </div>

          {/* Current Epoch Card */}
          <div className="p-6 rounded-lg shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <h3 className="text-lg font-semibold mb-2">Current Epoch</h3>
            <p className="text-3xl font-bold">#{epoch.toString()}</p>
            <p className="text-sm mt-2 opacity-90">Rewards being distributed</p>
          </div>

          {/* Daily Income Card */}
          <div className="p-6 rounded-lg shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
            <h3 className="text-lg font-semibold mb-2">Daily Income</h3>
            <p className="text-3xl font-bold">${dailyIncome.toFixed(2)}</p>
            <p className="text-sm mt-2 opacity-90">At 27% APY</p>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Investment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposited Capital */}
            <div className="p-6 border-l-4 border-blue-600 rounded">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Deposited Capital</h3>
              <p className="text-3xl font-bold text-blue-600">${depositAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Current USDC balance in vault</p>
            </div>

            {/* Pending Rewards */}
            <div className="p-6 border-l-4 border-yellow-600 rounded">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Rewards</h3>
              <p className="text-3xl font-bold text-yellow-600">${pendingReward.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Claimable rewards from completed epochs</p>
            </div>

            {/* Monthly Expected */}
            <div className="p-6 border-l-4 border-green-600 rounded">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Expected</h3>
              <p className="text-3xl font-bold text-green-600">${(dailyIncome * 30).toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Estimated earnings per month</p>
            </div>

            {/* Annual Expected */}
            <div className="p-6 border-l-4 border-purple-600 rounded">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Annual Expected</h3>
              <p className="text-3xl font-bold text-purple-600">${(depositAmount * 0.27).toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Estimated earnings per year at 27% APY</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 Secure</h3>
            <p className="text-gray-600">Your funds are protected by smart contracts and multi-sig controls.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">⚡ Fast</h3>
            <p className="text-gray-600">Rewards are calculated and distributed every epoch automatically.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">💎 Transparent</h3>
            <p className="text-gray-600">All transactions and rewards are verifiable on-chain.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

