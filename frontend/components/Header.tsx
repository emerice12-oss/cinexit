'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-xl font-bold">
        Cinexit
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/calculator">Calculator</Link>
        <Link href="/investment">Investment</Link>
        <Link href="/referral">Referral</Link>

        {/* Wallet Button */}
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <button
            disabled
            className="px-4 py-2 rounded bg-gray-200 text-gray-500 cursor-not-allowed"
          >
            Wallet Connected
          </button>
        )}
      </nav>
    </header>
  )
}
