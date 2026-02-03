import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia } from 'wagmi/chains'

export function getWagmiConfig() {
  const projectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    process.env.NEXT_PUBLIC_WALLETCONNECT_ID

  if (!projectId) return null

  return getDefaultConfig({
    appName: 'Cinexit',
    projectId,
    chains: [mainnet, sepolia],
    ssr: true,
  })
}
