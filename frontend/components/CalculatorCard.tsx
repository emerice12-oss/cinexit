'use client'

import { useState } from 'react'

export default function CalculatorCard() {
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState('30')

  const principal = Number(amount || 0)
  const duration = Number(days)

  // Example APR logic (replace with real oracle later)
  const dailyRate = 0.027
  const estimated = principal * dailyRate * duration

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Earnings Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">USDC Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Duration (days)</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Estimated earnings</p>
          <p className="text-2xl font-bold mt-1">
            {estimated.toFixed(2)} USDC
          </p>
        </div>

        <p className="text-xs text-gray-500">
          * Estimates only. Actual rewards depend on epoch revenue.
        </p>
      </div>
    </div>
  )
}