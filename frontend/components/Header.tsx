'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="w-full flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-white shadow-sm">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600">
        💎 Cinexit
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {isConnected && (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Dashboard
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Calculator
            </Link>
            <Link href="/investment" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Investment
            </Link>
            <Link href="/referral" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Referral
            </Link>
          </>
        )}
      </nav>

      {/* Wallet Button (Top Right) */}
      <div className="flex items-center gap-4">
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <div className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold">
            ✓ Connected
          </div>
        )}
      </div>
    </header>
  )
}
