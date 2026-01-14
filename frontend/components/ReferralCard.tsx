'use client'

import { useAccount } from 'wagmi'
import { useReferralStats } from '@/hooks/useReferralStats'

export function ReferralCard() {
  const { address } = useAccount()
  const { referrer, volume } = useReferralStats()

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const link = `${origin}/?ref=${address ?? ''}`

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Referral Program</h3>

      <p className="text-sm mt-2">
        Your referrer: {referrer ? String(referrer) : 'None'}
      </p>

      <p className="mt-1">
        Referral volume: {(volume ?? 0).toFixed(2)} USDC
      </p>

      <input
        readOnly
        value={link}
        className="mt-2 w-full text-sm p-2 border rounded"
        onClick={(e) => e.currentTarget.select()}
      />
    </div>
  )
} 
