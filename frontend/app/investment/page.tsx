'use client'

import { useAccount, useChainId } from 'wagmi'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'
import { useCurrentEpoch } from '@/hooks/useCurrentEpoch'
import DepositCard from '@/components/DepositCard'
import InvestmentCard from '@/components/InvestmentCard'
import WalletConnect from '@/components/WalletConnect'

export default function InvestmentPage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { isActive, isPaused, depositAmount, pendingReward } = useInvestmentStatus()
  const { epoch = 0n } = useCurrentEpoch()
  const wrongNetwork = isConnected && chainId !== 1

  const dailyIncome = depositAmount * 0.027 / 365
  const monthlyIncome = dailyIncome * 30
  const annualIncome = depositAmount * 0.27

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <WalletConnect />
      </main>
    )
  }

  if (wrongNetwork) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="p-8 bg-red-100 rounded-lg shadow-lg max-w-md border-2 border-red-300 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Wrong Network</h2>
          <p className="text-red-700">Please switch to Ethereum Mainnet (Chain ID: 1).</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">💎 Investment Center</h1>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
          <div className={`p-6 rounded-lg shadow-lg text-white ${isPaused ? 'bg-red-600' : isActive ? 'bg-green-600' : 'bg-yellow-600'}`}>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-3xl font-bold">{isPaused ? '⛔ Paused' : isActive ? '✅ Active' : '⏸️ Inactive'}</p>
            <p className="text-sm mt-2 opacity-90">{isPaused ? 'System is paused' : isActive ? 'Your investment is active' : 'No active investment'}</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Deposit Card */}
          <div>
            <DepositCard />
          </div>

          {/* Investment Status Card */}
          <div>
            <InvestmentCard />
          </div>
        </div>

        {/* Detailed Investment Information */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📊 Detailed Investment Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Deposited Capital */}
            <div className="p-6 border-l-4 border-blue-600 rounded bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Deposited Capital</h3>
              <p className="text-3xl font-bold text-blue-600">${depositAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">USDC in vault</p>
            </div>

            {/* Pending Rewards */}
            <div className="p-6 border-l-4 border-yellow-600 rounded bg-yellow-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Rewards</h3>
              <p className="text-3xl font-bold text-yellow-600">${pendingReward.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">Claimable rewards</p>
            </div>

            {/* Monthly Expected */}
            <div className="p-6 border-l-4 border-green-600 rounded bg-green-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Expected</h3>
              <p className="text-3xl font-bold text-green-600">${monthlyIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">At current rate</p>
            </div>

            {/* Annual Expected */}
            <div className="p-6 border-l-4 border-purple-600 rounded bg-purple-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Annual Expected</h3>
              <p className="text-3xl font-bold text-purple-600">${annualIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-2">27% APY</p>
            </div>
          </div>
        </div>

        {/* Features & How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How It Works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🚀 How It Works</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</span>
                <span>Connect your Ethereum wallet</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</span>
                <span>Approve and deposit Ethereum USDC</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</span>
                <span>Earn 27% APY over 5-day cycles</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</span>
                <span>After each cycle, reconnect & reinvest</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">5</span>
                <span>Claim rewards anytime</span>
              </li>
            </ol>
          </div>

          {/* 5-Day Cycle Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-purple-900 mb-4">⏰ The 5-Day Cycle</h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-white rounded p-3 border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">📅 Day 1-5</p>
                <p className="text-sm">Your USDC earns 27% APY continuously throughout the cycle</p>
              </div>
              <div className="bg-white rounded p-3 border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">🔄 End of Cycle</p>
                <p className="text-sm">You must reconnect and deposit again to start a new 5-day cycle</p>
              </div>
              <div className="bg-white rounded p-3 border border-purple-200">
                <p className="font-semibold text-purple-900 mb-1">💡 Why Cycles?</p>
                <p className="text-sm">This structure optimizes returns and ensures protocol stability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Transparency */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 Secure</h3>
            <p className="text-gray-600">Your funds are protected by smart contracts and multi-sig controls.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">⚡ Fast</h3>
            <p className="text-gray-600">Rewards are calculated and distributed automatically every epoch.</p>
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

