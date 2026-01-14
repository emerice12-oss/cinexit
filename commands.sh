#!/bin/bash
# Load environment variables
source .env

echo "=== Cinexit Local Node Command Helper ==="
echo "Using RPC: $RPC_URL"
echo

# ----------------------
# MockUSDC Commands
# ----------------------
echo "1️⃣ MockUSDC"
echo "Check name:"
cast call $MOCK_USDC "name()(string)" --rpc-url $RPC_URL

echo "Check symbol:"
cast call $MOCK_USDC "symbol()(string)" --rpc-url $RPC_URL

echo "Check decimals:"
cast call $MOCK_USDC "decimals()(uint8)" --rpc-url $RPC_URL

# Example: Mint 1000 USDC to a given address
# cast send $MOCK_USDC "mint(address,uint256)" <recipient_address> 1000000000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# ----------------------
# Circuit Breaker
# ----------------------
echo
echo "2️⃣ Circuit Breaker"
# cast send $CIRCUIT_BREAKER "pause()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY
# cast send $CIRCUIT_BREAKER "unpause()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# ----------------------
# Reward Distributor
# ----------------------
echo
echo "3️⃣ Reward Distributor"
# cast send $REWARD_DISTRIBUTOR "claim(uint256)" 1 --rpc-url $RPC_URL --private-key $PRIVATE_KEY
# cast send $REWARD_DISTRIBUTOR "batchClaim(uint256[])" "[1]" --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# ----------------------
# Revenue Oracle
# ----------------------
echo
echo "4️⃣ Revenue Oracle"
# cast send $REVENUE_ORACLE "finalizeEpoch(uint256,uint256)" 1 1000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo
echo "=== Done ==="
