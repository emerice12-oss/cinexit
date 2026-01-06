'use client';

import { useReadContract } from 'wagmi';

export const ORACLE =
  '0xYourOracleAddress';

const ORACLE_ABI = [
  {
    name: 'quorum',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'signerCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'lastSettlementEpoch',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export function useOracleStatus() {
  const { data: quorum } = useReadContract({
    address: ORACLE,
    abi: ORACLE_ABI,
    functionName: 'quorum',
  });

  const { data: signerCount } = useReadContract({
    address: ORACLE,
    abi: ORACLE_ABI,
    functionName: 'signerCount',
  });

  const { data: lastEpoch } = useReadContract({
    address: ORACLE,
    abi: ORACLE_ABI,
    functionName: 'lastSettlementEpoch',
  });

  return {
    quorum: quorum ? Number(quorum) : 0,
    signerCount: signerCount
      ? Number(signerCount)
      : 0,
    lastEpoch: lastEpoch
      ? Number(lastEpoch)
      : 0,
  };
}
