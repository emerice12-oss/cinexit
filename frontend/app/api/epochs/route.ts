import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// --- Config ---
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY'
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0xYourVaultContract'

// Minimal ABI for ParticipationVault: get epoch rewards
const VAULT_ABI = [
  'function getEpochRewards(address user) view returns (uint256[])',
  'function currentEpoch() view returns (uint256)',
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user = searchParams.get('user') || undefined

    if (!user) {
      return NextResponse.json({ error: 'Missing user address' }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider)

    const currentEpoch: bigint = await vault.currentEpoch()
    const rewards: bigint[] = await vault.getEpochRewards(user)

    // Map rewards to epoch array
    const epochs = rewards.map((r, i) => ({
      epoch: i + 1,
      usdc: Number(ethers.formatUnits(r, 6)), // USDC has 6 decimals
    }))

    return NextResponse.json(epochs)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
