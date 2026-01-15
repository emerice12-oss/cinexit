'use client'

import { useEffect, useState } from 'react'
import { useAccount, useChainId, useContractRead, useWriteContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { VAULT_ADDRESS } from '@/lib/contracts'

// --- Replace these with your deployed contract addresses ---
const MOCK_USDC_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const REWARD_DISTRIBUTOR_ADDRESS = '0xA8452Ec99ce0C64f20701dB7dD3abDb607c00496'

// --- Import ABIs ---
import { usdcAbi } from '../lib/abis/usdc'
import { epochAbi } from '../lib/abis/epoch'

import { useEpochRevenues } from '@/hooks/useEpochRevenues'
import { VAULT_ABI } from '@/lib/abis/analytics'

// --- Contract addresses (prefer env var) ---
const EPOCH_MANAGER_ADDRESS =
  (process.env.NEXT_PUBLIC_EPOCH_MANAGER_ADDRESS as `0x${string}`) ||
  '0xYourEpochManagerAddress' // replace with deployed EpochManager

// --- Types ---
interface Epoch {
  epoch: number
  usdc: number
}

// --- Dashboard Component ---
export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [epochs, setEpochs] = useState<Epoch[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // --- Network lock ---
  const correctChainId = 1 // Hardhat local network; replace with your chain
  const wrongNetwork = isConnected && chainId !== correctChainId

  // --- Fetch USDC Balance ---
  const { data: balanceData } = useContractRead({
    address: MOCK_USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
  })

  useEffect(() => {
    if (balanceData) {
      // USDC has 6 decimals
      setBalance(Number(balanceData) / 1e6)
    }
  }, [balanceData])

  // --- Fetch Epoch Rewards (hook-based) ---
  const { data: epochRevenues, isLoading: loadingRevs } = useEpochRevenues(
    EPOCH_MANAGER_ADDRESS,
    10
  )

  useEffect(() => {
    if (!isConnected || wrongNetwork || !address) return

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
  }, [isConnected, address, wrongNetwork, epochRevenues, loadingRevs])

  const { writeContract } = useWriteContract()

  // Read referral param on the client only to avoid SSR/prerender issues
  useEffect(() => {
    if (!isConnected) return
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        writeContract({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'registerReferrer',
          args: [ref],
        })
      }
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [isConnected, writeContract])

  return (
    <main className="min-h-screen flex flex-col items-center justify-start gap-8 p-6 bg-dark-50">
      <h1 className="text-3xl font-bold text-white">Cinexit Dashboard</h1>

      {!isConnected && (
        <div className="p-4 bg-white text-black rounded-md">
          Connect your wallet to view your dashboard.
        </div>
      )}

      {/* --- Connect Wallet Button --- */}
      {!isConnected && (
        <div className="mb-4">
          <ConnectButton />
        </div>
      )}

      {/* --- Network Warning --- */}
      {wrongNetwork && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          ⚠️ Please switch to the correct network to view your rewards.
        </div>
      )}

      {/* --- Wallet Info --- */}
      {isConnected && !wrongNetwork && (
        <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <p className="mt-2 text-gray-700 break-all">{address}</p>
          <p className="mt-2 font-semibold text-lg">USDC Balance: {balance.toFixed(2)} USDC</p>
          <p className="mt-1 text-sm text-gray-500">Estimated daily income: ${(balance * 0.027).toFixed(2)}</p>
        </div>
      )}

      {/* --- Loading Indicator --- */}
      {loading && <div className="p-4 bg-gray-100 text-gray-700 rounded-md">Fetching rewards...</div>}

      {/* --- Rewards Chart --- */}
      {epochs.length > 0 && (
        <div className="w-full max-w-3xl h-80 bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Epoch Rewards</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={epochs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usdc" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- Epoch List --- */}
      {epochs.length > 0 && (
        <div className="w-full max-w-3xl p-4 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Recent Epochs</h2>
          <ul className="divide-y divide-gray-200">
            {epochs.map((e) => (
              <li key={e.epoch} className="py-2 flex justify-between">
                <span>Epoch {e.epoch}</span>
                <span>{e.usdc.toFixed(2)} USDC</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
