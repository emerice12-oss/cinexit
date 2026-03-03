'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const DEPOSIT_CYCLE_DAYS = 5
const DEPOSIT_CYCLE_MS = DEPOSIT_CYCLE_DAYS * 24 * 60 * 60 * 1000

interface DepositCycleStatus {
  lastDepositTime: number | null
  isEligibleForDeposit: boolean
  timeUntilNextDeposit: string
  cycleProgress: number // 0-100%
  daysRemaining: number
  hoursRemaining: number
  minutesRemaining: number
  secondsRemaining: number
  recordDeposit: () => void
  reset: () => void
}

export function useDepositCycle(): DepositCycleStatus {
  const { address } = useAccount()
  const [lastDepositTime, setLastDepositTime] = useState<number | null>(null)
  const [isEligible, setIsEligible] = useState(true)
  const [timeDisplay, setTimeDisplay] = useState('')
  const [cycleProgress, setCycleProgress] = useState(0)
  const [timeUnits, setTimeUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const recordDeposit = () => {
    if (address) {
      const now = Date.now()
      localStorage.setItem(`lastDeposit_${address}`, now.toString())
      setLastDepositTime(now)
    }
  }

  const reset = () => {
    if (address) {
      localStorage.removeItem(`lastDeposit_${address}`)
      setLastDepositTime(null)
    }
  }

  useEffect(() => {
    const checkCycleStatus = () => {
      if (!address) return

      const stored = localStorage.getItem(`lastDeposit_${address}`)
      if (stored) {
        const lastTime = parseInt(stored, 10)
        setLastDepositTime(lastTime)

        const now = Date.now()
        const elapsed = now - lastTime
        const remaining = Math.max(0, DEPOSIT_CYCLE_MS - elapsed)

        const progress = (elapsed / DEPOSIT_CYCLE_MS) * 100
        setCycleProgress(Math.min(progress, 100))

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000)

        setTimeUnits({ days, hours, minutes, seconds })

        if (remaining > 0) {
          setTimeDisplay(`${days}d ${hours}h ${minutes}m ${seconds}s`)
          setIsEligible(false)
        } else {
          setTimeDisplay('Ready to reinvest!')
          setIsEligible(true)
          setCycleProgress(100)
        }
      } else {
        setLastDepositTime(null)
        setIsEligible(true)
        setTimeDisplay('No active cycle')
        setCycleProgress(0)
        setTimeUnits({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    checkCycleStatus()
    const interval = setInterval(checkCycleStatus, 1000)

    return () => clearInterval(interval)
  }, [address])

  return {
    lastDepositTime,
    isEligibleForDeposit: isEligible,
    timeUntilNextDeposit: timeDisplay,
    cycleProgress,
    daysRemaining: timeUnits.days,
    hoursRemaining: timeUnits.hours,
    minutesRemaining: timeUnits.minutes,
    secondsRemaining: timeUnits.seconds,
    recordDeposit,
    reset,
  }
}
