'use client';

import { useReadContract, useChainId } from 'wagmi';

export const CIRCUIT_BREAKER =
  '0xYourCircuitBreakerAddress';

const BREAKER_ABI = [
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Change this to your target chain
export const TARGET_CHAIN_ID = 1; // Ethereum mainnet

export function useProtocolGuard() {
  const chainId = useChainId();

  const { data: paused } = useReadContract({
    address: CIRCUIT_BREAKER,
    abi: BREAKER_ABI,
    functionName: 'paused',
  });

  return {
    paused: paused ?? false,
    wrongChain: chainId !== TARGET_CHAIN_ID,
    chainId,
  };
}
