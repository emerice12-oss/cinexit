'use client';

import { usePublicClient, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

export const REWARD_DISTRIBUTOR =
  '0xYourRewardDistributorAddress';

const CLAIMED_EVENT = {
  type: 'event',
  name: 'Claimed',
  inputs: [
    { indexed: true, name: 'user', type: 'address' },
    { indexed: false, name: 'epoch', type: 'uint256' },
    { indexed: false, name: 'amount', type: 'uint256' },
  ],
} as const;

export type ClaimRecord = {
  epoch: bigint;
  amount: bigint;
  txHash: `0x${string}`;
};

export function useEpochHistory() {
  const client = usePublicClient();
  const { address } = useAccount();

  const [history, setHistory] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !client) return;

    let cancelled = false;

    async function load() {
      if (!client) return;

      setLoading(true);

      const logs = await client.getLogs({
        address: REWARD_DISTRIBUTOR,
        event: CLAIMED_EVENT,
        args: { user: address },
        fromBlock: 0n,
        toBlock: 'latest',
      });

      if (cancelled) return;

      setHistory(
        logs.map((log) => ({
          epoch: log.args.epoch!,
          amount: log.args.amount!,
          txHash: log.transactionHash!,
        }))
      );

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [address, client]);

  return { history, loading };
}
