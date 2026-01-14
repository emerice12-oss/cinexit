'use client'

import { useAccount } from 'wagmi'
import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export default function ReferralPage() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const link = address ? `https://cinexit.io/?ref=${address}` : ''

  const copy = async () => {
  await navigator.clipboard.writeText(link)
  setCopied(true)
  setTimeout(() => setCopied(false), 1500)
  }

  return (
    <RequireWalletAndNetwork>
      <main className="min-h-screen p-6 bg-dark-50 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <ConnectButton />
        </div>

        {!isConnected && (
          <div className="p-4 bg-gray-800 rounded">Connect wallet to access referrals.</div>
        )}

        {isConnected && (
          <div className="bg-white text-black p-6 rounded-xl shadow max-w-xl">
            <h2 className="text-xl font-semibold mb-2">Your Referral Link</h2>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 p-2 border rounded"
                value={link}
                readOnly
              />
              <button
                onClick={copy}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-1">How it works</h3>
            <ul className="text-sm list-disc pl-4">
              <li>Invite users with your link</li>
              <li>Earn 5% of their real protocol rewards</li>
              <li>Rewards are epoch-based & claimable</li>
              <li>No inflation, no admin control</li>
            </ul>
          </div>
        </div>
      )}
    </main>
    </RequireWalletAndNetwork>
  )
}