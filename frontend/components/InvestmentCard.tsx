'use client'

import { useAccount } from 'wagmi'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'

export default function InvestmentCard() {
  const { isConnected } = useAccount()
  const { depositAmount, pendingReward, isActive } = useInvestmentStatus()


  const dailyIncome = depositAmount * 0.27 / 365
  const monthlyIncome = dailyIncome * 30

  if (!isActive && depositAmount === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg border-2 border-gray-300">
        <div className="text-center">
          <div className="text-5xl mb-4">💤</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Investment</h3>
          <p className="text-gray-600">Start by depositing USDC to begin earning 27% APY</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg border-2 border-blue-300">
      {/* Investment Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg">
        <h3 className="text-2xl font-bold mb-2">💰 Active Investment</h3>
        <p className="text-sm">Your capital is earning 27% APY. Withdraw anytime.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 rounded p-3 border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Deposited</p>
          <p className="text-xl font-bold text-blue-600">${depositAmount.toFixed(2)}</p>
        </div>

        <div className="bg-pink-50 rounded p-3 border border-pink-100">
          <p className="text-xs text-gray-600 mb-1">Pending Reward</p>
          <p className="text-xl font-bold text-pink-600">${pendingReward.toFixed(2)}</p>
        </div>

        <div className="bg-green-50 rounded p-3 border border-green-100">
          <p className="text-xs text-gray-600 mb-1">Daily Income</p>
          <p className="text-xl font-bold text-green-600">${dailyIncome.toFixed(2)}</p>
        </div>

        <div className="bg-blue-50 rounded p-3 border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Monthly Income</p>
          <p className="text-xl font-bold text-blue-600">${monthlyIncome.toFixed(2)}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="font-semibold mb-2">💡 How It Works:</p>
        <ul className="text-xs space-y-1 list-disc pl-5">
          <li><strong>Deposit USDC:</strong> Send USDC to the ParticipationVault contract.</li>
          <li><strong>Earn Rewards:</strong> Your capital earns 27% APY from vault revenues.</li>
          <li><strong>Withdraw Anytime:</strong> Exit your position whenever you need your capital.</li>
        </ul>
      </div>
    </div>
  )
}
