"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { REWARD_ABI } from "@/lib/abis/rewardDistributor";
import { EPOCH_MANAGER_ABI } from "@/lib/abis/epochManager";

export function useRewards() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const finalizedEpoch = useReadContract({
    address: CONTRACTS.epochManager,
    abi: EPOCH_MANAGER_ABI,
    functionName: "finalizedEpoch",
  });

  async function claim(epochId: number) {
    return writeContractAsync({
      address: CONTRACTS.rewardDistributor,
      abi: REWARD_ABI,
      functionName: "claim",
      args: [epochId],
    });
  }

  async function claimBatch(epochIds: number[]) {
    return writeContractAsync({
      address: CONTRACTS.rewardDistributor,
      abi: REWARD_ABI,
      functionName: "claimBatch",
      args: [epochIds],
    });
  }

  async function isClaimed(epochId: number) {
    return useReadContract({
      address: CONTRACTS.rewardDistributor,
      abi: REWARD_ABI,
      functionName: "claimed",
      args: [address!, epochId],
    });
  }

  return {
    finalizedEpoch,
    claim,
    claimBatch,
  };
}
