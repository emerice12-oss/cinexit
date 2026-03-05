'use client'

import { useState } from 'react'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useConfig } from 'wagmi'
import { toastManager } from '@/lib/utils/toast'

export type TxState =
  | 'idle'
  | 'signing'
  | 'pending'
  | 'success'
  | 'error'

export function useTx() {
  const config = useConfig()
  const [state, setState] = useState<TxState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function run(writeFn: () => Promise<`0x${string}`>) {
    try {
      setError(null)
      setState('signing')
      toastManager.info('Awaiting Confirmation', 'Please confirm the transaction in your wallet')

      const hash = await writeFn()

      setState('pending')
      toastManager.info('Transaction Pending', 'Your transaction is being processed on the blockchain')

      await waitForTransactionReceipt(config, { hash })

      setState('success')
      toastManager.success('Transaction Confirmed', 'Your transaction has been successfully confirmed')

      // auto-reset after success
      setTimeout(() => setState('idle'), 2000)
    } catch (err: any) {
      console.error(err)
      const errorMsg = err?.shortMessage || err?.message || 'Transaction failed'
      setError(errorMsg)
      setState('error')
      toastManager.error('Transaction Failed', errorMsg)
    }
  }

  return {
    state,
    error,
    isIdle: state === 'idle',
    isBusy: state === 'signing' || state === 'pending',
    isSuccess: state === 'success',
    isError: state === 'error',
    run,
  }
}
