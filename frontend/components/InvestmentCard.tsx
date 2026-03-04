'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useInvestmentStatus } from '@/hooks/useInvestmentStatus'
import Link from 'next/link'

const DEPOSIT_CYCLE_DAYS = 5
const DEPOSIT_CYCLE_MS = DEPOSIT_CYCLE_DAYS * 24 * 60 * 60 * 1000

export default function InvestmentCard() {
  const { address } = useAccount()
  const { depositAmount, pendingReward, isActive } = useInvestmentStatus()
  const [lastDepositTime, setLastDepositTime] = useState<number>(0)
  const [nextDepositTime, setNextDepositTime] = useState<string>('')
  const [cycleProgress, setCycleProgress] = useState(0)
  const [connectedSince, setConnectedSince] = useState<number | null>(null)
  const [connectedProgress, setConnectedProgress] = useState(0)

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

  // Connected-investment cycle tracking (separate from deposit-based)
  useEffect(() => {
    if (!address) {
      setConnectedSince(null)
      setConnectedProgress(0)
      return
    }

    const key = `connectedInvestment_${address}`
    const check = () => {
      const stored = localStorage.getItem(key)
      if (stored) {
        const ts = parseInt(stored, 10)
        setConnectedSince(ts)
        const now = Date.now()
        const elapsed = now - ts
        const progress = (elapsed / DEPOSIT_CYCLE_MS) * 100
        setConnectedProgress(Math.min(Math.max(progress, 0), 100))
      } else {
        setConnectedSince(null)
        setConnectedProgress(0)
      }
    }

    check()
    const iv = setInterval(check, 1000)
    return () => clearInterval(iv)
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

  function toggleConnectedInvestment() {
    if (!address) return
    const key = `connectedInvestment_${address}`
    if (connectedSince) {
      // stop
      localStorage.removeItem(key)
      setConnectedSince(null)
      setConnectedProgress(0)
    } else {
      // start
      const now = Date.now()
      localStorage.setItem(key, now.toString())
      setConnectedSince(now)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg border-2 border-blue-300">
      {/* Primary: Connected Investment Controls */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg">
        <h3 className="text-2xl font-bold mb-2">💰 Start Investing Now</h3>
        <p className="text-sm mb-4">Simply connect your wallet and start earning 27% APY. Withdraw anytime.</p>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {connectedSince ? (
              <div>
                <p className="text-sm font-semibold">✅ Investment Active</p>
                <p className="text-xs mt-1">Running for {Math.floor(connectedProgress)}% of current cycle</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">Ready to invest</p>
                <p className="text-xs mt-1">Click below to start earning</p>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleConnectedInvestment}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              connectedSince 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-emerald-700'
            }`}
          >
            {connectedSince ? '⏹ Withdraw' : '▶ Invest'}
          </button>
        </div>

        <div className="mt-3">
          <Link href="/investment/running" className="text-xs text-white underline hover:text-gray-100">
            View all running investments →
          </Link>
        </div>
      </div>

      {/* Secondary: Deposit-based Investment (Optional) */}
      {depositAmount > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">📊 USDC Deposit (Optional)</h4>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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

          {/* 5-Day Cycle Progress */}
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">5-Day Cycle Progress</p>
              <p className="text-sm font-bold text-blue-600">{Math.floor(cycleProgress)}%</p>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${cycleProgress}%` }}
              />
            </div>

            <p className="text-xs text-gray-600">
              <strong>Next deposit available in:</strong> <span className="font-bold text-blue-700">{nextDepositTime}</span>
            </p>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="font-semibold mb-2">💡 How It Works:</p>
        <ul className="text-xs space-y-1 list-disc pl-5">
          <li><strong>Connected Investment:</strong> Just connect your wallet and click Invest. Withdraw anytime.</li>
          <li><strong>Deposit (Optional):</strong> Deposit USDC to earn additional rewards in 5-day cycles.</li>
          <li><strong>Both Run Together:</strong> Your connected investment and deposits work independently.</li>
        </ul>
      </div>
    </div>
  )
}
