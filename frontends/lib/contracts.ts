import EpochManagerABI from "@/abi/EpochManager.json";
import ParticipationVaultABI from "@/abi/ParticipationVault.json";
import RewardDistributorABI from "@/abi/RewardDistributor.json";
import ERC20ABI from "@/abi/ERC20.json";

export const CONTRACTS = {
  participationVault: "0xYOUR_VAULT_ADDRESS",
  usdc: "0xYOUR_USDC_ADDRESS",

  epochManager: {
    address: process.env.NEXT_PUBLIC_EPOCH_MANAGER!,
    abi: EpochManagerABI,
  },
  vault: {
    address: process.env.NEXT_PUBLIC_VAULT!,
    abi: ParticipationVaultABI,
  },
  distributor: {
    address: process.env.NEXT_PUBLIC_DISTRIBUTOR!,
    abi: RewardDistributorABI,
  },
  usdc: {
    address: process.env.NEXT_PUBLIC_USDC!,
    abi: ERC20ABI,
    decimals: 6,
  },
};
