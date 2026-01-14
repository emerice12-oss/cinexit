'use client'

import { useWriteContract } from 'wagmi'
import { useTx } from '@/lib/hooks/useTx'
import { distributorAbi } from '@/lib/abis/distributor'
import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'

const DISTRIBUTOR_ADDRESS = '0xRewardDistributor'

queryClient.invalidateQueries()

export default function ClaimCard() {
  const tx = useTx()
  const { writeContractAsync } = useWriteContract()

  async function claim(epoch: number) {
    await tx.run(() =>
      writeContractAsync({
        address: DISTRIBUTOR_ADDRESS,
        abi: distributorAbi,
        functionName: 'claim',
        args: [epoch],
      })
    )
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-3">
      <h3 className="font-semibold">Claim Rewards</h3>

      <button
        disabled={tx.isBusy}
        onClick={() => claim(1)}
        className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
      >
        {tx.state === 'signing' && 'Confirm in wallet'}
        {tx.state === 'pending' && 'Claiming...'}
        {tx.state === 'success' && 'Claimed ✓'}
        {tx.state === 'idle' && 'Claim Epoch 1'}
        {tx.state === 'error' && 'Retry'}
      </button>

      {tx.error && <p className="text-red-600 text-sm">{tx.error}</p>}

      <RequireWalletAndNetwork>
        <ClaimCard />
      </RequireWalletAndNetwork>
    </div>
  )
}
