import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { localChain } from "./chains";

export const wagmiConfig = createConfig({
  chains: [localChain],
  connectors: [
    injected(),
  ],
  transports: {
    [localChain.id]: http(),
  },
  ssr: true,
});
