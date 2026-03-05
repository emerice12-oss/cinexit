'use client'

import { useState, useEffect } from 'react'
import { parseUnits, formatUnits, isAddress } from 'viem'
import { useWriteContract, useReadContract, useAccount, useChainId } from 'wagmi'
import { useTx } from '@/lib/hooks/useTx'
import { participationVaultAbi } from '@/lib/abis/vault'
import { PARTICIPATION_VAULT_ADDRESS, USDC_ADDRESS } from '@/lib/contracts'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useToast } from '@/lib/context/toast-context'

// some versions of viem's isAddress reject the checksummed address, so
// normalize to lowercase before validation. the contract itself is not
// case-sensitive.
const lowercaseUSDC = USDC_ADDRESS.toLowerCase()
console.debug('USDC_ADDRESS normalized to', lowercaseUSDC)
const validatedUSDCAddress = isAddress(lowercaseUSDC) ? lowercaseUSDC : undefined

if (!validatedUSDCAddress) {
  console.warn(`Invalid USDC_ADDRESS after normalization: ${USDC_ADDRESS}. Deposit may fail.`)
}

// minimal ERC20 ABI for approve/balanceOf/allowance
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const USDC_DECIMALS = 6
const DEPOSIT_CYCLE_DAYS = 5
const DEPOSIT_CYCLE_MS = DEPOSIT_CYCLE_DAYS * 24 * 60 * 60 * 1000

export default function DepositCard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const [lastDepositTime, setLastDepositTime] = useState<number>(0)
  const [canDeposit, setCanDeposit] = useState(true)
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')
  const tx = useTx()
  const { writeContractAsync } = useWriteContract()
  const { error: toastError } = useToast()
  const wrongNetwork = isConnected && chainId !== 1

  // Read USDC balance - with error handling for invalid addresses
  const { data: usdcBalance, error: balanceError } = useReadContract({
    address: validatedUSDCAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address && validatedUSDCAddress ? [address] : undefined,
  })

  // Check deposit eligibility based on 5-day cycle
  useEffect(() => {
    const checkDepositEligibility = () => {
      const stored = localStorage.getItem(`lastDeposit_${address}`)
      if (stored) {
        const lastTime = parseInt(stored, 10)
        setLastDepositTime(lastTime)
        const now = Date.now()
        const elapsed = now - lastTime
        const isEligible = elapsed >= DEPOSIT_CYCLE_MS

        if (!isEligible) {
          setCanDeposit(false)
          const remaining = DEPOSIT_CYCLE_MS - elapsed
          const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
          const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
          setTimeUntilNext(`${days}d ${hours}h ${minutes}m`)
        } else {
          setCanDeposit(true)
          setTimeUntilNext('')
        }
      } else {
        setCanDeposit(true)
        setTimeUntilNext('')
      }
    }

    checkDepositEligibility()
    const interval = setInterval(checkDepositEligibility, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [address])

  const formattedBalance = usdcBalance
    ? parseFloat(formatUnits(usdcBalance as bigint, USDC_DECIMALS)).toFixed(2)
    : '0.00'

  const presetAmounts = [100, 500, 1000, 5000]

  async function handleDeposit(depositAmount: string) {
    // Validate input amount
    if (!depositAmount || depositAmount.trim() === '') {
      toastError('Invalid Amount', 'Please enter an amount to deposit')
      return
    }

    const parsedAmount = parseFloat(depositAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toastError('Invalid Amount', 'Please enter a valid positive amount')
      return
    }

    if (!canDeposit) {
      toastError('Deposit Cooldown Active', `Next deposit available in ${timeUntilNext}`)
      return
    }

    if (!address) {
      toastError('Wallet Not Connected', 'Please connect your wallet to deposit')
      return
    }

    if (wrongNetwork) {
      toastError('Wrong Network', 'Please switch to Ethereum Mainnet')
      return
    }

    const value = parseUnits(depositAmount, USDC_DECIMALS)

    await tx.run(async () => {
      if (!validatedUSDCAddress) {
        throw new Error('Invalid USDC contract address. Cannot proceed with deposit.')
      }
      
      // Approve USDC
      await writeContractAsync({
        address: validatedUSDCAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PARTICIPATION_VAULT_ADDRESS, value],
      })

      // Deposit USDC
      return writeContractAsync({
        address: PARTICIPATION_VAULT_ADDRESS,
        abi: participationVaultAbi,
        functionName: 'deposit',
        args: [value],
      })
    })

    // Record deposit time on success
    if (tx.state === 'success') {
      localStorage.setItem(`lastDeposit_${address}`, Date.now().toString())
      setCanDeposit(false)
      setAmount('')
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg border-2 border-yellow-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-yellow-900">💰 Deposit USDC</h3>
        <span className="text-sm px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full font-semibold">
          Ethereum USDC
        </span>
      </div>

      {/* Wallet Connection Required */}
      {!isConnected ? (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-900 font-semibold mb-3">🔐 Connect Wallet to Deposit</p>
          <p className="text-blue-800 text-sm mb-4">
            Please connect your Ethereum wallet to deposit USDC and start earning 27% APY.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      ) : wrongNetwork ? (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-900 font-semibold">⚠️ Wrong Network</p>
          <p className="text-red-800 text-sm mt-1">
            Please switch to Ethereum Mainnet (Chain ID: 1) to deposit.
          </p>
        </div>
      ) : (
        <>
          {/* USDC Balance */}
          <div className="bg-white rounded p-4 border border-yellow-200">
            <p className="text-sm text-gray-600">Your USDC Balance</p>
            <p className="text-3xl font-bold text-yellow-600">${formattedBalance}</p>
          </div>

          {/* Cycle Status */}
          {!canDeposit && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
              <p className="text-orange-900 font-semibold">⏳ 5-Day Investment Cycle</p>
              <p className="text-orange-800 text-sm mt-1">
                Next deposit available in: <span className="font-bold">{timeUntilNext}</span>
              </p>
              <p className="text-orange-700 text-xs mt-2">
                Your last investment is locked for 5 days to maximize returns.
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Deposit Amount (USDC)
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!canDeposit || tx.isBusy}
              className="w-full px-4 py-2 border-2 border-yellow-300 text-gray-400 rounded-lg focus:outline-none focus:border-yellow-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                disabled={!canDeposit || tx.isBusy}
                className="px-3 py-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Deposit Button */}
          <button
            disabled={!canDeposit || tx.isBusy || !amount}
            onClick={() => handleDeposit(amount)}
            className={`w-full py-3 font-bold text-white rounded-lg transition ${
              !canDeposit || tx.isBusy || !amount
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 active:scale-95'
            }`}
          >
            {tx.state === 'signing' && '✍️ Confirm in your wallet'}
            {tx.state === 'pending' && '⏳ Depositing USDC...'}
            {tx.state === 'success' && '✅ Deposit Successful!'}
            {tx.state === 'idle' && !canDeposit && '🔒 Locked (5-Day Cycle)'}
            {tx.state === 'idle' && canDeposit && `Deposit ${amount || '0'} USDC`}
            {tx.state === 'error' && '❌ Try Again'}
          </button>

          {/* Error Message */}
          {tx.error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">
              {tx.error}
            </div>
          )}

          {balanceError && (
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">
              ⚠️ Unable to fetch balance. Please ensure you're on Ethereum Mainnet.
            </div>
          )}

          {/* Info Box */}
          <div className="bg-white rounded p-4 border border-yellow-100">
            <p className="text-xs text-gray-600">
              <strong>How it works:</strong> Deposit Ethereum USDC into our vault. Your funds earn 27% APY. 
              After each 5-day investment cycle, you can choose to reinvest for another cycle or withdraw.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
