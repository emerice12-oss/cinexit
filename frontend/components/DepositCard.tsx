'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTx } from '@/lib/hooks/useTx'
import { distributorAbi } from '@/lib/abis/distributor'
import RequireWalletAndNetwork from './RequireWalletAndNetwork'
import { DISTRIBUTOR_ADDRESS, USDC_ADDRESS } from '@/lib/contracts'
import { epochAbi } from '@/lib/abis/epoch'

const USDC_DECIMALS = 6
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default function DepositCard() {
  const [amount, setAmount] = useState('')
  const tx = useTx()
  const { writeContractAsync } = useWriteContract()

  async function deposit(amount: string) {
    const value = parseUnits(amount, USDC_DECIMALS)

    await tx.run(async () => {
      // approve
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: epochAbi,
        functionName: 'approve',
        args: [DISTRIBUTOR_ADDRESS, value],
      })

      // deposit
      return writeContractAsync({
        address: DISTRIBUTOR_ADDRESS,
        abi: distributorAbi,
        functionName: 'deposit',
        args: [value],
      })
    })
  }

  return (
    <RequireWalletAndNetwork>
        <DepositCard />
          <div className="p-4 bg-white rounded shadow space-y-3">
            <h3 className="font-semibold">Deposit USDC</h3>

            <button
               disabled={tx.isBusy}
               onClick={() => deposit('100')}
               className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
               {tx.state === 'signing' && 'Confirm in wallet'}
               {tx.state === 'pending' && 'Depositing...'}
               {tx.state === 'success' && 'Deposited ✓'}
               {tx.state === 'idle' && 'Deposit 100 USDC'}
               {tx.state === 'error' && 'Retry'}
            </button>

            {tx.error && <p className="text-red-600 text-sm">{tx.error}</p>}
    
          </div>
    </RequireWalletAndNetwork>
  )
}
