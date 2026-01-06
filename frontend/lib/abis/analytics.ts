export const VAULT_ABI = [
  {
    type: "function",
    name: "totalDeposits",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

export const EPOCH_MANAGER_ABI = [
  {
    type: "function",
    name: "currentEpoch",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

export const TREASURY_ABI = [
  {
    type: "function",
    name: "totalRevenue",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

export const CIRCUIT_BREAKER_ABI = [
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
];
