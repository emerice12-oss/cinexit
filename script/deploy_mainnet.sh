#!/usr/bin/env bash
set -euo pipefail

# Helper script to deploy contracts to Ethereum mainnet using Foundry
# Requires: MAINNET_RPC_URL, DEPLOYER_PRIVATE_KEY (and optional ETHERSCAN_API_KEY)

if [ -z "${MAINNET_RPC_URL:-}" ]; then
  echo "MAINNET_RPC_URL is not set. Set it in your shell or use a .env file."
  exit 1
fi

if [ -z "${DEPLOYER_PRIVATE_KEY:-}" ]; then
  echo "DEPLOYER_PRIVATE_KEY is not set. Aborting to avoid accidental broadcast."
  exit 1
fi

echo "Deploying to Ethereum mainnet using RPC: ${MAINNET_RPC_URL}"

# Run forge script. Replace `Deploy` with the fully-qualified contract/script name if needed.
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$MAINNET_RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast

if [ -n "${ETHERSCAN_API_KEY:-}" ]; then
  echo "Running verification (requires ETHERSCAN_API_KEY)."
  forge verify-contract --chain-id 1 \
    $(forge inspect script/Deploy.s.sol:Deploy address) \
    Deploy "$ETHERSCAN_API_KEY"
fi

echo "Deployment script finished. Check output above for deployed addresses." 
