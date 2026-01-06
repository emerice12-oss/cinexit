import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";

export function useEpoch() {
  const { data: currentEpoch, isLoading } = useReadContract({
    ...CONTRACTS.epochManager,
    functionName: "currentEpoch",
  });

  return {
    currentEpoch: Number(currentEpoch ?? 0),
    isLoading,
  };
}
