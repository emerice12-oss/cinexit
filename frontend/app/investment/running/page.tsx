'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import WalletConnect from '@/components/WalletConnect'

const DEPOSIT_CYCLE_DAYS = 5
const DEPOSIT_CYCLE_MS = DEPOSIT_CYCLE_DAYS * 24 * 60 * 60 * 1000

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Ready to reinvest!'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

export default function RunningInvestmentsPage() {
  const { address, isConnected } = useAccount()
  const [lastDeposit, setLastDeposit] = useState<number | null>(null)
  const [depositRemaining, setDepositRemaining] = useState<string>('')
  const [connectedSince, setConnectedSince] = useState<number | null>(null)
  const [connectedProgress, setConnectedProgress] = useState<number>(0)

  useEffect(() => {
    const check = () => {
      if (!address) return

      const dep = localStorage.getItem(`lastDeposit_${address}`)
      if (dep) {
        const ts = parseInt(dep, 10)
        setLastDeposit(ts)
        const now = Date.now()
        const remaining = Math.max(0, DEPOSIT_CYCLE_MS - (now - ts))
        setDepositRemaining(formatRemaining(remaining))
      } else {
        setLastDeposit(null)
        setDepositRemaining('No active deposit cycle')
      }

      const con = localStorage.getItem(`connectedInvestment_${address}`)
      if (con) {
        const ts = parseInt(con, 10)
        setConnectedSince(ts)
        const now = Date.now()
        const elapsed = now - ts
        const progress = Math.min(100, Math.max(0, (elapsed / DEPOSIT_CYCLE_MS) * 100))
        setConnectedProgress(progress)
      } else {
        setConnectedSince(null)
        setConnectedProgress(0)
      }
    }

    check()
    const iv = setInterval(check, 1000)
    return () => clearInterval(iv)
  }, [address])

  function stopConnected() {
    if (!address) return
    localStorage.removeItem(`connectedInvestment_${address}`)
    setConnectedSince(null)
    setConnectedProgress(0)
  }

  function resetDepositCycle() {
    if (!address) return
    localStorage.removeItem(`lastDeposit_${address}`)
    setLastDeposit(null)
    setDepositRemaining('No active deposit cycle')
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2">Running Investments</h1>
      <p className="text-gray-600 mb-8">Manage your active connected and deposit-based investments.</p>

      {!isConnected && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-blue-900 font-semibold mb-3">Connect your wallet to see and manage your investments.</p>
          <WalletConnect />
        </div>
      )}

      {/* Primary: Connected-Only Investment */}
      <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300 shadow-md">
        <h2 className="text-2xl font-bold text-green-900 mb-1">💰 Connected Investment</h2>
        <p className="text-sm text-green-700 mb-4">Earn 27% APY simply by connecting your wallet. Withdraw anytime.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p className={`text-2xl font-bold ${connectedSince ? 'text-green-600' : 'text-gray-500'}`}>
              {connectedSince ? '🟢 Running' : '⭕ Stopped'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
            <p className="text-2xl font-bold text-emerald-600">
              {connectedSince ? `${Math.floor(connectedProgress)}%` : '—'}
            </p>
          </div>
        </div>

        {connectedSince && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Cycle Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                style={{ width: `${connectedProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">Current investment running — withdraw anytime to stop</p>
          </div>
        )}

        <button
          onClick={stopConnected}
          disabled={!connectedSince}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            connectedSince
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {connectedSince ? '⏹ Withdraw Now' : 'Start an investment first'}
        </button>
      </div>

      {/* Secondary: Deposit-Based Investment */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-md">
        <h2 className="text-2xl font-bold text-blue-900 mb-1">📊 USDC Deposit Investment (Optional)</h2>
        <p className="text-sm text-blue-700 mb-4">Optionally deposit USDC for additional rewards in 5-day cycles.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p className={`text-2xl font-bold ${lastDeposit ? 'text-blue-600' : 'text-gray-500'}`}>
              {lastDeposit ? '🔵 Active' : '⭕ Inactive'}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Next Available</p>
            <p className="text-lg font-semibold text-blue-700">{depositRemaining}</p>
          </div>
        </div>

        {lastDeposit && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Cycle Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, ((Date.now() - lastDeposit) / DEPOSIT_CYCLE_MS) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">Deposit cycle active — you can deposit again when ready</p>
          </div>
        )}

        <button
          onClick={resetDepositCycle}
          disabled={!lastDeposit}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            lastDeposit
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {lastDeposit ? '🔄 Reset Cycle' : 'No active deposit'}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">About Your Investments</h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li><strong>Connected Investment:</strong> Starts immediately when you click Invest, runs while tracking wallet connection, withdraw anytime.</li>
          <li><strong>Deposit Investment:</strong> Optional. Deposit USDC to earn additional rewards. Each deposit runs a 5-day cycle.</li>
          <li><strong>Run Together:</strong> Both investment types can run at the same time independently.</li>
          <li><strong>Local Storage:</strong> Your investment states are tracked locally in your browser's localStorage for this wallet.</li>
        </ul>
      </div>
    </div>
  )
}
