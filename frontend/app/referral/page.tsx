'use client'

import { useAccount } from 'wagmi'
import { useReferralStats } from '@/hooks/useReferralStats'
import { useState } from 'react'

export default function ReferralPage() {
  const { address, isConnected } = useAccount()
  const { referrer, volume } = useReferralStats()
  const [copied, setCopied] = useState(false)

  const refLink = address ? `${typeof window !== 'undefined' ? window.location.origin : ''}/home?ref=${address}` : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md border-2 border-blue-200 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the referral program.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">🤝 Referral Program</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Referral Link */}
          <div className="bg-white rounded-lg shadow-lg p-8 col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Referral Link</h2>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={refLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={copyLink}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-600">Share this link with friends to earn referral rewards!</p>
          </div>

          {/* Referral Volume */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Referral Volume</h3>
            <p className="text-4xl font-bold">${volume.toFixed(2)}</p>
            <p className="text-sm mt-2 opacity-90">Total USDC from your referrals</p>
          </div>

          {/* Your Referrer */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Your Referrer</h3>
            <p className="text-2xl font-bold font-mono break-words">
              {referrer ? `${String(referrer).slice(0, 8)}...` : 'None'}
            </p>
            <p className="text-sm mt-2 opacity-90">Who referred you to Cinexit</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600 text-sm">Copy your unique referral link and share it with friends and partners.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">They Join Cinexit</h3>
              <p className="text-gray-600 text-sm">Your friends sign up and deposit USDC through your referral link.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-gray-600 text-sm">You earn commissions on their deposits and ongoing investment activity.</p>
            </div>
          </div>
        </div>

        {/* Rewards Structure */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Rewards Structure</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border-l-4 border-blue-600 rounded">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-semibold text-gray-900">Commission on Deposits</h3>
                <p className="text-gray-600 text-sm">Earn 2% commission on every deposit from your referrals.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border-l-4 border-yellow-600 rounded">
              <div className="text-2xl">🎁</div>
              <div>
                <h3 className="font-semibold text-gray-900">Ongoing Incentives</h3>
                <p className="text-gray-600 text-sm">Receive rewards from your referrals' earnings for up to 12 months.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border-l-4 border-green-600 rounded">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="font-semibold text-gray-900">Tier Bonuses</h3>
                <p className="text-gray-600 text-sm">Unlock higher commissions as your referral volume increases.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
