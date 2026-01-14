'use client'

import { useEffect, useState } from 'react'

export function useReferral() {
  const [referrer, setReferrer] = useState<`0x${string}` | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')

    if (ref && ref.startsWith('0x') && ref.length === 42) {
      setReferrer(ref as `0x${string}`)
      localStorage.setItem('cinexit_referrer', ref)
    } else {
      const saved = localStorage.getItem('cinexit_referrer')
      if (saved) setReferrer(saved as `0x${string}`)
    }
  }, [])

  return referrer
}
