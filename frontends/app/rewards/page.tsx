"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useRewards } from "@/hooks/useRewards";
import { CONTRACTS } from "@/lib/contracts";
import { REWARD_ABI } from "@/lib/abis/rewardDistributor";

export default function RewardsPage() {
  const { address } = useAccount();
  const { finalizedEpoch, claim, claimBatch } = useRewards();
  const [epochs, setEpochs] = useState<number[]>([]);
  const [claimable, setClaimable] = useState<number[]>([]);

  useEffect(() => {
    if (!finalizedEpoch.data || !address) return;

    const last = Number(finalizedEpoch.data);
    const all = Array.from({ length: last }, (_, i) => i + 1);
    setEpochs(all);
  }, [finalizedEpoch.data, address]);

  useEffect(() => {
    async function loadClaimable() {
      const eligible: number[] = [];

      for (const epoch of epochs) {
        const { data } = await useReadContract({
          address: CONTRACTS.rewardDistributor,
          abi: REWARD_ABI,
          functionName: "claimed",
          args: [address!, epoch],
        });

        if (data === false) eligible.push(epoch);
      }

      setClaimable(eligible);
    }

    if (epochs.length > 0) loadClaimable();
  }, [epochs, address]);

  return (
    <NetworkGuard>
      <main>
        <h1>Rewards</h1>
        <ConnectWallet />

        <p>Finalized Epochs: {finalizedEpoch.data?.toString() ?? "—"}</p>

        <button
          disabled={claimable.length === 0}
          onClick={() => claimBatch(claimable)}
        >
          Claim All ({claimable.length})
        </button>

        <ul>
          {epochs.map((epoch) => (
            <li key={epoch}>
              Epoch {epoch}{" "}
              {claimable.includes(epoch) ? (
                <button onClick={() => claim(epoch)}>Claim</button>
              ) : (
                "✓ Claimed"
              )}
            </li>
          ))}
        </ul>
      </main>
    </NetworkGuard>
  );
}
