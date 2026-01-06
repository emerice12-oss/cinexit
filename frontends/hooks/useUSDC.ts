import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "ethers";
import { CONTRACTS } from "@/lib/contracts";

export function useUSDC() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract({
    ...CONTRACTS.usdc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  async function approve(amount: string) {
    const value = parseUnits(amount, CONTRACTS.usdc.decimals);

    await writeContractAsync({
      ...CONTRACTS.usdc,
      functionName: "approve",
      args: [CONTRACTS.vault.address, value],
    });
  }

  return {
    balance: balance ?? 0n,
    approve,
  };
}
