export const REWARD_ABI = [
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "epochId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimBatch",
    stateMutability: "nonpayable",
    inputs: [{ name: "epochIds", type: "uint256[]" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimed",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "epochId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];
