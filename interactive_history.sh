#!/bin/bash
# Load environment variables
source .env

# History files
H_RECIPIENTS=".history_recipients"
H_AMOUNTS=".history_amounts"
H_EPOCHS=".history_epochs"

RPC=$RPC_URL

echo "=== Cinexit Local Node Interactive CLI (History Enabled) ==="
echo

# Helper: choose from history
choose_history() {
    local file=$1
    local prompt=$2
    local input

    if [[ -f $file ]]; then
        mapfile -t options < $file
        if [[ ${#options[@]} -gt 0 ]]; then
            echo "$prompt (choose number or type new):"
            select opt in "${options[@]}" "New"; do
                if [[ $REPLY -gt 0 && $REPLY -le ${#options[@]} ]]; then
                    input=${options[$REPLY-1]}
                    break
                elif [[ $REPLY -eq $(( ${#options[@]} + 1 )) ]]; then
                    read -p "Enter new value: " input
                    break
                else
                    echo "Invalid option."
                fi
            done
        else
            read -p "$prompt: " input
        fi
    else
        read -p "$prompt: " input
    fi

    # Save new input if not in history
    if [[ ! " ${options[*]} " =~ " ${input} " ]]; then
        echo $input >> $file
    fi

    echo $input
}

PS3="Choose an action: "
options=(
  "MockUSDC - Mint"
  "MockUSDC - Transfer"
  "RewardDistributor - Claim"
  "RewardDistributor - BatchClaim"
  "RevenueOracle - Finalize Epoch"
  "CircuitBreaker - Pause"
  "CircuitBreaker - Unpause"
  "Exit"
)

select opt in "${options[@]}"; do
    case $REPLY in
        1)
            recipient=$(choose_history $H_RECIPIENTS "Recipient address")
            amount=$(choose_history $H_AMOUNTS "Amount (smallest unit)")

            cast send $MOCK_USDC "mint(address,uint256)" $recipient $amount --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        2)
            recipient=$(choose_history $H_RECIPIENTS "Recipient address")
            amount=$(choose_history $H_AMOUNTS "Amount (smallest unit)")

            cast send $MOCK_USDC "transfer(address,uint256)" $recipient $amount --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        3)
            epoch=$(choose_history $H_EPOCHS "Epoch ID")
            cast send $REWARD_DISTRIBUTOR "claim(uint256)" $epoch --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        4)
            read -p "Epoch IDs (comma-separated, e.g. 1,2,3): " epochs
            # convert CSV to array format
            array=$(echo $epochs | sed 's/,/ /g' | awk '{printf "["; for(i=1;i<=NF;i++){printf $i; if(i<NF){printf ","}}; printf "]"}')
            cast send $REWARD_DISTRIBUTOR "batchClaim(uint256[])" $array --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        5)
            epoch=$(choose_history $H_EPOCHS "Epoch ID")
            amount=$(choose_history $H_AMOUNTS "Revenue amount")
            cast send $REVENUE_ORACLE "finalizeEpoch(uint256,uint256)" $epoch $amount --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        6)
            cast send $CIRCUIT_BREAKER "pause()" --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        7)
            cast send $CIRCUIT_BREAKER "unpause()" --rpc-url $RPC --private-key $PRIVATE_KEY
            ;;
        8)
            echo "Exiting..."
            break
            ;;
        *)
            echo "Invalid option."
            ;;
    esac
    echo
done
    case $REPLY in
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