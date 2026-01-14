'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEpochHistory } from '@/hooks/useEpochHistory'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function EpochsPage() {
  const { isConnected } = useAccount()
  const { history = [], loading } = useEpochHistory()
  const epochs = history

  return (
    <main className="min-h-screen p-6 bg-dark-50 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Epoch History Explorer</h1>
        <ConnectButton />
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-4 bg-gray-800 rounded-lg">Loading epochs...</div>
      )}

      {/* Epoch Chart */}
      {!loading && epochs.length > 0 && (
        <div className="bg-white text-black p-4 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-2">Protocol Revenue per Epoch (USDC)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={epochs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Epoch Table */}
      {!loading && epochs.length > 0 && (
        <div className="bg-white text-black rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Epoch</th>
                <th className="p-3">Revenue (USDC)</th>
                <th className="p-3">Status</th>
                <th className="p-3">My Reward</th>
              </tr>
            </thead>
            <tbody>
              {epochs.map((e: any) => (
                <tr key={e.epoch} className="border-t">
                  <td className="p-3">{e.epoch}</td>
                  <td className="p-3">{e.revenue.toFixed(2)}</td>
                  <td className="p-3">
                    {e.finalized ? (
                      <span className="text-green-600 font-medium">Finalized</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Running</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isConnected ? (
                      <span className="font-semibold">{e.userReward?.toFixed(2) ?? '0.00'} USDC</span>
                    ) : (
                      <span className="text-gray-400">Connect wallet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && epochs.length === 0 && (
        <div className="p-4 bg-gray-800 rounded-lg">No epochs found.</div>
      )}
    </main>
  )
}
