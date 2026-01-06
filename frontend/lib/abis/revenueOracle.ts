export const REVENUE_ORACLE_ABI = [
  {
    type: "function",
    name: "quorum",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isSigner",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "lastFinalizedEpoch",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "attestRevenue",
    stateMutability: "nonpayable",
    inputs: [
      { name: "epochId", type: "uint256" },
      { name: "revenueUSDC", type: "uint256" },
      { name: "signatures", type: "bytes[]" },
    ],
    outputs: [],
  },
];
