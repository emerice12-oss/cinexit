"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { VAULT_ABI } from "@/lib/abis/vault";
import { USDC_ABI } from "@/lib/abis/usdc";

export function useVault() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const usdcBalance = useReadContract({
    address: CONTRACTS.usdc,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  async function approve(amount: string) {
    return writeContractAsync({
      address: CONTRACTS.usdc,
      abi: USDC_ABI,
      functionName: "approve",
      args: [
        CONTRACTS.participationVault,
        parseUnits(amount, 6),
      ],
    });
  }

  async function deposit(amount: string) {
    return writeContractAsync({
      address: CONTRACTS.participationVault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [parseUnits(amount, 6)],
    });
  }

  async function withdraw(amount: string) {
    return writeContractAsync({
      address: CONTRACTS.participationVault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [parseUnits(amount, 6)],
    });
  }

  return {
    usdcBalance,
    approve,
    deposit,
    withdraw,
  };
}
