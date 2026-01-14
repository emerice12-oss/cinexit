'use client'

import { useState } from 'react'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useConfig } from 'wagmi'

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

      const hash = await writeFn()

      setState('pending')
      await waitForTransactionReceipt(config, { hash })

      setState('success')

      // auto-reset after success
      setTimeout(() => setState('idle'), 2000)
    } catch (err: any) {
      console.error(err)
      setError(err?.shortMessage || err?.message || 'Transaction failed')
      setState('error')
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
