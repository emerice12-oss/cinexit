'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { getWagmiConfig } from '@/lib/wagmi'

// --- Wrapper Component ---
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wagmiConfig = getWagmiConfig()

  if (!wagmiConfig) {
    console.warn(
      'No WalletConnect projectId found — skipping Wagmi/RainbowKit providers.'
    )
    return <>{children}</>
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </WagmiProvider>
  )
}
