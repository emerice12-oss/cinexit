'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CORRECT_CHAIN_ID } from '@/lib/network'

export default function RequireWalletAndNetwork({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">
            Connect Wallet
          </h2>
          <ConnectButton />
        </div>
      </div>
    )
  }

  if (chainId !== CORRECT_CHAIN_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow text-center space-y-4">
          <h2 className="text-xl font-semibold">
            Wrong Network
          </h2>
          <p className="text-sm text-gray-600">
            Please switch to the correct network to continue.
          </p>
          <button
            onClick={() => switchChain({ chainId: CORRECT_CHAIN_ID })}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Switch Network
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
