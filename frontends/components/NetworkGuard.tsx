"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { localChain } from "@/lib/chains";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (chainId !== localChain.id) {
    return (
      <div>
        <p>Wrong network</p>
        <button onClick={() => switchChain({ chainId: localChain.id })}>
          Switch Network
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
