'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletConnect() {
  const { isConnected, address } = useAccount()

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg border-2 border-blue-300 text-center max-w-md mx-auto">
      {!isConnected ? (
        <>
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-blue-900 mb-3">Connect Your Wallet</h2>
          <p className="text-gray-700 mb-6">
            Connect your Web3 wallet to access Cinexit and start earning 27% APY on your Ethereum USDC deposits.
          </p>

          <div className="flex justify-center mb-6">
            <ConnectButton />
          </div>

          <div className="bg-white rounded-lg p-4 text-left space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-gray-800">Easy Setup</p>
                <p className="text-gray-600">Connect with MetaMask, Rainbow, or other supported wallets</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">💰</span>
              <div>
                <p className="font-semibold text-gray-800">Deposit USDC</p>
                <p className="text-gray-600">Invest Ethereum USDC and earn consistent rewards</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-semibold text-gray-800">5-Day Cycles</p>
                <p className="text-gray-600">Each investment cycle lasts 5 days, then you can reinvest</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="font-semibold text-gray-800">Secure & Transparent</p>
                <p className="text-gray-600">All transactions are on-chain and fully verifiable</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-900 mb-3">Wallet Connected!</h2>
          
          {address && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-gray-600 text-sm mb-2">Connected Address</p>
              <p className="text-blue-600 font-mono text-sm break-all">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}

          <p className="text-gray-700 mb-6">
            You're ready to deposit USDC and start earning 27% APY. Visit the Investment section to get started.
          </p>

          <div className="space-y-3">
            <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded text-left">
              <p className="text-green-900 font-semibold text-sm">🟢 Ready to Invest</p>
              <p className="text-green-800 text-xs mt-1">You can now deposit USDC</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
        </>
      )}
    </div>
  )
}
