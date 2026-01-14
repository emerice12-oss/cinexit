export const epochAbi = [
  {
    name: 'epochs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'epoch', type: 'uint256' }],
    outputs: [
      { name: 'rewards', type: 'uint256' },
      { name: 'finalized', type: 'bool' },
    ],
  },
] as const
