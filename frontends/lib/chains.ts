import { defineChain } from "viem";

export const localChain = defineChain({
  id: 31337,
  name: "Local Anvil",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});
