'use client';

import { useWriteContract, useReadContract } from 'wagmi';

export const USDC_ADDRESS =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export const CINEXIT_MINING_ADDRESS =
  '0xYourMiningContractAddressHere';

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const MINING_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useUsdcAllowance(owner?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, CINEXIT_MINING_ADDRESS] : undefined,
  });
}

export function useApproveUsdc() {
  return useWriteContract();
}

export function useDepositUsdc() {
  return useWriteContract();
}

export function useDepositedBalance(user?: `0x${string}`) {
  return useReadContract({
    address: CINEXIT_MINING_ADDRESS,
    abi: MINING_ABI,
    functionName: 'balanceOf',
    args: user ? [user] : undefined,
  });
}
