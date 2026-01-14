'use client'

import { WagmiProvider, createConfig, http, useChainId, useSwitchChain } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi'

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: 'Cinexit Mining',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (chainId !== mainnet.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-red-600">
          Wrong network detected
        </p>
        <p className="text-gray-600">
          Please switch to Ethereum Mainnet
        </p>
        <button
          onClick={() => switchChain({ chainId: mainnet.id })}
          className="px-4 py-2 rounded-lg bg-black text-white"
        >
          Switch Network
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NetworkGuard>{children}</NetworkGuard>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
