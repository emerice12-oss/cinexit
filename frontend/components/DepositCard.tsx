'use client'

import { parseUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTx } from '@/lib/hooks/useTx'
import { epochAbi } from '@/lib/abis/epoch'
import { distributorAbi } from '@/lib/abis/distributor'
import RequireWalletAndNetwork from './RequireWalletAndNetwork'
import { useReferral } from '@/hooks/useReferral'

const USDC_ADDRESS = '0xYourMockOrRealUSDC'
const DISTRIBUTOR_ADDRESS = '0xParticipationVault'
const USDC_DECIMALS = 6

const referrer = useReferral()

await writeContractAsync({
  address: VAULT,
  abi: vaultAbi,
  functionName: 'deposit',
  args: [value, referrer ?? ZERO_ADDRESS],
})


queryClient.invalidateQueries()


export default function DepositCard() {
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
    
      <RequireWalletAndNetwork>
        <DepositCard />
      </RequireWalletAndNetwork>
    </div>
  )
}
