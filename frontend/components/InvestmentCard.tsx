'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'

const DEPOSIT_CYCLE_DAYS = 5
const DEPOSIT_CYCLE_MS = DEPOSIT_CYCLE_DAYS * 24 * 60 * 60 * 1000

export default function InvestmentCard() {
  const { address } = useAccount()
  const { depositAmount, pendingReward, isActive } = useInvestmentStatus()
  const [lastDepositTime, setLastDepositTime] = useState<number>(0)
  const [nextDepositTime, setNextDepositTime] = useState<string>('')
  const [cycleProgress, setCycleProgress] = useState(0)

  useEffect(() => {
    const checkCycleStatus = () => {
      const stored = localStorage.getItem(`lastDeposit_${address}`)
      if (stored) {
        const lastTime = parseInt(stored, 10)
        setLastDepositTime(lastTime)
        const now = Date.now()
        const elapsed = now - lastTime
        const remaining = Math.max(0, DEPOSIT_CYCLE_MS - elapsed)

        // Calculate progress percentage
        const progress = ((elapsed / DEPOSIT_CYCLE_MS) * 100)
        setCycleProgress(Math.min(progress, 100))

        if (remaining > 0) {
          const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
          const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
          const seconds = Math.floor((remaining % (60 * 1000)) / 1000)
          setNextDepositTime(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        } else {
          setNextDepositTime('Ready to reinvest!')
          setCycleProgress(100)
        }
      } else {
        setNextDepositTime('No active investment')
        setCycleProgress(0)
      }
    }

    checkCycleStatus()
    const interval = setInterval(checkCycleStatus, 1000) // Update every second

    return () => clearInterval(interval)
  }, [address])

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
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-purple-900">📊 Investment Status</h3>
        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
          cycleProgress === 100 ? 'bg-green-200 text-green-900' : 'bg-purple-200 text-purple-900'
        }`}>
          {cycleProgress === 100 ? '✅ Ready' : `${Math.floor(cycleProgress)}%`}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Deposited</p>
          <p className="text-2xl font-bold text-purple-600">${depositAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">USDC</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Pending Reward</p>
          <p className="text-2xl font-bold text-pink-600">${pendingReward.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Claimable</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Daily Income</p>
          <p className="text-2xl font-bold text-green-600">${dailyIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">At 27% APY</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-blue-600">${monthlyIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Estimated</p>
        </div>
      </div>

      {/* 5-Day Cycle Progress */}
      <div className="bg-white rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Investment Cycle Progress</p>
          <p className="text-sm font-bold text-purple-600">{Math.floor(cycleProgress)}%</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${cycleProgress}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          <strong>Next deposit available in:</strong> <span className="font-bold text-purple-700">{nextDepositTime}</span>
        </p>

        {cycleProgress === 100 && (
          <div className="mt-3 p-2 bg-green-100 border-l-4 border-green-500 rounded">
            <p className="text-green-900 font-semibold text-sm">🎉 Ready to Reinvest!</p>
            <p className="text-green-800 text-xs mt-1">You can deposit again to continue earning rewards.</p>
          </div>
        )}
      </div>

      {/* 5-Day Cycle Explanation */}
      <div className="mt-4 bg-purple-100 rounded-lg p-4 border border-purple-300">
        <p className="text-sm text-purple-900">
          <strong>💡 How Your Investment Works:</strong> After each 5-day investment cycle completes, you must reconnect and deposit again to continue earning. This ensures optimal returns and protocol stability.
        </p>
      </div>
    </div>
  )
}
