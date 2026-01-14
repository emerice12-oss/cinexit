'use client'

import RequireWalletAndNetwork from '@/components/RequireWalletAndNetwork'
import CalculatorCard from '@/components/CalculatorCard'

export default function Calculatorpage() {

  return (
    <RequireWalletAndNetwork>
      <main className="min-h-screen flex items-center justify-center p-6">
        <CalculatorCard />
      </main>
    </RequireWalletAndNetwork>
  )
}
