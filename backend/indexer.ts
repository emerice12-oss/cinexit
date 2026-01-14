import 'dotenv/config';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { db } from './db';

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL!),
});

const DISTRIBUTOR =
  '0xYourRewardDistributorAddress';

const Settled = parseAbiItem(
  'event Settled(uint256 epoch, uint256 amount)'
);

const Claimed = parseAbiItem(
  'event Claimed(address indexed user, uint256 epoch, uint256 amount)'
);

async function index() {
  const latest = await client.getBlockNumber();

  const settledLogs = await client.getLogs({
    address: DISTRIBUTOR,
    event: Settled,
    fromBlock: 0n,
    toBlock: latest,
  });

  for (const log of settledLogs) {
    db.prepare(
      `INSERT OR IGNORE INTO epochs VALUES (?, ?, ?, ?)`
    ).run(
      Number(log.args.epoch),
      log.args.amount?.toString() ?? '0',
      log.transactionHash,
      Number(log.blockNumber)
    );
  }

  const claimedLogs = await client.getLogs({
    address: DISTRIBUTOR,
    event: Claimed,
    fromBlock: 0n,
    toBlock: latest,
  });

  for (const log of claimedLogs) {
    db.prepare(
      `INSERT OR IGNORE INTO claims VALUES (?, ?, ?, ?)`
    ).run(
      log.args.user,
      Number(log.args.epoch),
      (log.args.amount ?? 0n).toString(),
      log.transactionHash
    );
  }

  console.log('Indexed up to block', latest);
}

index();
