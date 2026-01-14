#!/bin/bash
# Load environment variables
source .env

# File to store last inputs
LAST_INPUTS=".last_inputs"

# Load last inputs if file exists
if [[ -f $LAST_INPUTS ]]; then
    source $LAST_INPUTS
else
    LAST_RECIPIENT=""
    LAST_AMOUNT=""
    LAST_EPOCH=""
    LAST_EPOCHS=""
fi

echo "=== Cinexit Local Node Interactive CLI ==="
echo "Using RPC: $RPC_URL"
echo

PS3="Choose an action: "
options=(
  "MockUSDC - Check name"
  "MockUSDC - Check symbol"
  "MockUSDC - Check decimals"
  "MockUSDC - Mint"
  "MockUSDC - Transfer"
  "CircuitBreaker - Pause"
  "CircuitBreaker - Unpause"
  "RewardDistributor - Claim"
  "RewardDistributor - BatchClaim"
  "RevenueOracle - Finalize Epoch"
  "Exit"
)

select opt in "${options[@]}"; do
    case $REPLY in
        1)
            cast call $MOCK_USDC "name()(string)" --rpc-url $RPC_URL
            ;;
        2)
            cast call $MOCK_USDC "symbol()(string)" --rpc-url $RPC_URL
            ;;
        3)
            cast call $MOCK_USDC "decimals()(uint8)" --rpc-url $RPC_URL
            ;;
        4)
            read -p "Recipient address [${LAST_RECIPIENT}]: " to
            to=${to:-$LAST_RECIPIENT}
            read -p "Amount (smallest unit) [${LAST_AMOUNT}]: " amount
            amount=${amount:-$LAST_AMOUNT}

            cast send $MOCK_USDC "mint(address,uint256)" $to $amount --rpc-url $RPC_URL --private-key $PRIVATE_KEY

            # Save inputs
            echo "LAST_RECIPIENT=$to" > $LAST_INPUTS
            echo "LAST_AMOUNT=$amount" >> $LAST_INPUTS
            ;;
        5)
            read -p "Recipient address [${LAST_RECIPIENT}]: " to
            to=${to:-$LAST_RECIPIENT}
            read -p "Amount (smallest unit) [${LAST_AMOUNT}]: " amount
            amount=${amount:-$LAST_AMOUNT}

            cast send $MOCK_USDC "transfer(address,uint256)" $to $amount --rpc-url $RPC_URL --private-key $PRIVATE_KEY

            # Save inputs
            echo "LAST_RECIPIENT=$to" > $LAST_INPUTS
            echo "LAST_AMOUNT=$amount" >> $LAST_INPUTS
            ;;
        6)
            cast send $CIRCUIT_BREAKER "pause()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            ;;
        7)
            cast send $CIRCUIT_BREAKER "unpause()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY
            ;;
        8)
            read -p "Epoch ID [${LAST_EPOCH}]: " epoch
            epoch=${epoch:-$LAST_EPOCH}

            cast send $REWARD_DISTRIBUTOR "claim(uint256)" $epoch --rpc-url $RPC_URL --private-key $PRIVATE_KEY

            # Save last epoch
            echo "LAST_EPOCH=$epoch" >> $LAST_INPUTS
            ;;
        9)
            read -p "Epoch IDs to batch claim (comma-separated) [${LAST_EPOCHS}]: " epochs
            epochs=${epochs:-$LAST_EPOCHS}

            # Convert CSV to array format for cast
            array=$(echo $epochs | sed 's/,/ /g' | awk '{printf "["; for(i=1;i<=NF;i++){printf $i; if(i<NF){printf ","}}; printf "]"}')

            cast send $REWARD_DISTRIBUTOR "batchClaim(uint256[])" $array --rpc-url $RPC_URL --private-key $PRIVATE_KEY

            # Save last batch
            echo "LAST_EPOCHS=$epochs" >> $LAST_INPUTS
            ;;
        10)
            read -p "Epoch ID [${LAST_EPOCH}]: " epoch
            epoch=${epoch:-$LAST_EPOCH}
            read -p "Revenue amount (smallest unit) [${LAST_AMOUNT}]: " amount
            amount=${amount:-$LAST_AMOUNT}

            cast send $REVENUE_ORACLE "finalizeEpoch(uint256,uint256)" $epoch $amount --rpc-url $RPC_URL --private-key $PRIVATE_KEY

            # Save last inputs
            echo "LAST_EPOCH=$epoch" > $LAST_INPUTS
            echo "LAST_AMOUNT=$amount" >> $LAST_INPUTS
            ;;
        11)
            echo "Exiting..."
            break
            ;;
        *)
            echo "Invalid option."
            ;;
    esac
    echo
done
