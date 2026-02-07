'use client'

import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useEpochRevenues } from '@/hooks/useEpochRevenues'
import { EPOCH_MANAGER_ADDRESS } from '@/lib/contracts'

interface Epoch {
  epoch: number
  usdc: number
}

export default function Home() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [epochs, setEpochs] = useState<Epoch[]>([])
  const [loading, setLoading] = useState(false)
  const wrongNetwork = isConnected && chainId !== 1

  const { data: epochRevenues, isLoading: loadingRevs } = useEpochRevenues(EPOCH_MANAGER_ADDRESS, 10)

  useEffect(() => {
    if (!isConnected || wrongNetwork) {
      setEpochs([])
      return
    }

    if (loadingRevs) {
      setLoading(true)
      return
    }

    if (!epochRevenues) {
      setEpochs([])
      setLoading(false)
      return
    }

    const temp: Epoch[] = epochRevenues.map((usdc, idx) => ({ epoch: idx + 1, usdc }))
    setEpochs(temp)
    setLoading(false)
  }, [isConnected, wrongNetwork, epochRevenues, loadingRevs])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 text-center">
        <h1 className="text-5xl font-bold text-blue-900 mb-4">Welcome to Cinexit</h1>
        <p className="text-xl text-gray-600 mb-8">Your gateway to decentralized yield farming</p>

        {!isConnected ? (
          <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to access all features and start earning.</p>
            <div className="text-center">
              <p className="text-yellow-600 font-semibold mb-2">👆 Use the Connect Wallet button in the top-right corner</p>
            </div>
          </div>
        ) : wrongNetwork ? (
          <div className="p-6 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto border-2 border-red-300">
            ⚠️ Please switch to the Mainnet (Chain ID: 1)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Calculator Card */}
            <Link href="/calculator">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer">
                <h3 className="text-2xl font-bold mb-2">📊 Calculator</h3>
                <p className="text-sm">Estimate your returns and investment performance</p>
              </div>
            </Link>

            {/* Investment Card */}
            <Link href="/investment">
              <div className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer">
                <h3 className="text-2xl font-bold mb-2">💰 Investment</h3>
                <p className="text-sm">View your investment status and current rewards</p>
              </div>
            </Link>

            {/* Referral Card */}
            <Link href="/referral">
              <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer">
                <h3 className="text-2xl font-bold mb-2">🤝 Referral</h3>
                <p className="text-sm">Earn rewards by referring friends and partners</p>
              </div>
            </Link>
          </div>
        )}
      </section>

      {/* Epoch Rewards Section */}
      {isConnected && !wrongNetwork && (
        <section className="py-12 px-6 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">📈 Recent Epoch Rewards</h2>

          {loading ? (
            <div className="text-center text-gray-600">Loading epoch data...</div>
          ) : epochs.length > 0 ? (
            <>
              {/* Chart */}
              <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={epochs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="epoch" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc' }} />
                    <Line type="monotone" dataKey="usdc" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#fbbf24' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Epoch</th>
                      <th className="px-6 py-3 text-right font-semibold">Rewards (USDC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {epochs.map((e) => (
                      <tr key={e.epoch} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">#{e.epoch}</td>
                        <td className="px-6 py-4 text-right text-yellow-600 font-bold">${e.usdc.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">No epoch data available yet.</div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-16 py-8 px-6 text-center text-gray-600 border-t">
        <p>&copy; 2026 Cinexit. All rights reserved.</p>
      </footer>
    </main>
  )
}
