'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function CalculatorPage() {
  const { isConnected } = useAccount()
  const [depositAmount, setDepositAmount] = useState<number>(1000)
  const [apy, setApy] = useState<number>(27)
  const [months, setMonths] = useState<number>(12)

  const dailyRate = apy / 365 / 100
  const dailyIncome = depositAmount * dailyRate
  const totalReturn = depositAmount * (1 + (apy / 100) * (months / 12)) - depositAmount
  const finalAmount = depositAmount + totalReturn

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="p-8 bg-white rounded-lg shadow-lg max-w-md border-2 border-blue-200 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the calculator.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">💰 Investment Calculator</h1>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Deposit Amount */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Deposit Amount (USDC)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <p className="text-sm text-gray-600 mt-2">${depositAmount.toLocaleString()}</p>
            </div>

            {/* APY */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Annual APY (%)</label>
              <input
                type="number"
                value={apy}
                onChange={(e) => setApy(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <p className="text-sm text-gray-600 mt-2">{apy}% APY</p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Duration (Months)</label>
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(parseFloat(e.target.value) || 0)}
                min="1"
                max="120"
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <p className="text-sm text-gray-600 mt-2">{months} months</p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Income */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Daily Income</h2>
            <p className="text-4xl font-bold">${dailyIncome.toFixed(2)}</p>
            <p className="text-blue-100 text-sm mt-2">Per day at {apy}% APY</p>
          </div>

          {/* Total Return */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Total Return ({months}m)</h2>
            <p className="text-4xl font-bold">${totalReturn.toFixed(2)}</p>
            <p className="text-yellow-100 text-sm mt-2">Net profit over {months} months</p>
          </div>

          {/* Monthly Average */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Monthly Average</h2>
            <p className="text-4xl font-bold">${(dailyIncome * 30).toFixed(2)}</p>
            <p className="text-purple-100 text-sm mt-2">Approximate monthly earnings</p>
          </div>

          {/* Final Amount */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Final Amount</h2>
            <p className="text-4xl font-bold">${finalAmount.toFixed(2)}</p>
            <p className="text-green-100 text-sm mt-2">After {months} months of compounding</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Summary</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Initial Deposit:</strong> ${depositAmount.toLocaleString()}
            </p>
            <p>
              <strong>Annual APY:</strong> {apy}%
            </p>
            <p>
              <strong>Investment Period:</strong> {months} month{months !== 1 ? 's' : ''}
            </p>
            <p>
              <strong>Daily Earnings:</strong> ${dailyIncome.toFixed(2)}
            </p>
            <hr className="my-4" />
            <p className="text-lg">
              <strong>Total Profit:</strong> ${totalReturn.toFixed(2)}
            </p>
            <p className="text-lg">
              <strong>Total Amount After {months}m:</strong> ${finalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
