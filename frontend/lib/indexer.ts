import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

// 🔧 CHANGE THESE
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!
const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'

// 🔧 ABI (ONLY the event you need)
const ABI = [
  {
    type: 'event',
    name: 'EpochFinalized',
    inputs: [
      { name: 'epoch', type: 'uint256', indexed: true },
      { name: 'usdcAmount', type: 'uint256', indexed: false },
    ],
  },
] as const

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
})

export async function getEpochHistory() {
  const logs = await client.getLogs({
    address: CONTRACT_ADDRESS,
    event: ABI[0],
    fromBlock: 0n,
    toBlock: 'latest',
  })

  return logs.map((log) => ({
    epoch: Number(log.args.epoch),
    usdc: Number(log.args.usdcAmount) / 1e6, // USDC decimals
  }))
}
