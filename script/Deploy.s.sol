// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

// Core
import {Treasury} from "../Contracts/core/Treasury.sol";
import {EpochManager} from "../Contracts/core/EpochManager.sol";
import {RewardDistributor} from "../Contracts/core/RewardDistributor.sol";

// Governance
import {CircuitBreaker} from "../Contracts/governance/CircuitBreaker.sol";

// Vault
import {ParticipationVault} from "../Contracts/vault/ParticipationVault.sol";

// Oracle
import {RevenueOracle} from "../Contracts/oracle/RevenueOracle.sol";

contract Deploy is Script {
    // ============ CONFIG ============
    address public USDC; // network-specific
    address public PAUSER; // multisig
    uint256 public EPOCH_DURATION; // seconds (e.g. 1 days)
    uint256 public ORACLE_QUORUM; // e.g. 3

    function setUp() public {
        // ======== EDIT THESE BEFORE MAINNET ========
        USDC = vm.envAddress("USDC_ADDRESS");
        PAUSER = vm.envAddress("PAUSER_ADDRESS");
        address usdc = vm.envAddress("MOCK_USDC_ADDRESS");

        EPOCH_DURATION = vm.envUint("EPOCH_DURATION");
        ORACLE_QUORUM = vm.envUint("ORACLE_QUORUM");
    }

    function run() external {
        vm.startBroadcast();

        // 2️⃣ Circuit Breaker
        CircuitBreaker breaker = new CircuitBreaker();

        // 3️⃣ Treasury
        Treasury treasury = new Treasury(USDC);

        // 4️⃣ Participation Vault (deploy early so we can pass it to EpochManager)
        ParticipationVault vault = new ParticipationVault(USDC);

        // 5️⃣ Epoch Manager (distributor not yet deployed; pass zero and set later)
        EpochManager epochManager = new EpochManager(address(breaker), address(vault), address(0));

        // 6️⃣ Reward Distributor
        RewardDistributor distributor = new RewardDistributor(address(vault), address(treasury), address(epochManager));

        // 7️⃣ Wire up epoch manager -> distributor now that it's deployed
        epochManager.setDistributor(address(distributor));

        // 8️⃣ Wire up vault admin hooks
        vault.setEpochManager(address(epochManager));
        vault.setBreaker(address(breaker));

        // 9️⃣ Revenue Oracle: create initial signer list (use PAUSER as a default signer)
        address[] memory initialSigners = new address[](1);
        initialSigners[0] = PAUSER;
        uint256 quorum = ORACLE_QUORUM == 0 ? 1 : ORACLE_QUORUM;
        if (quorum > initialSigners.length) quorum = initialSigners.length;

        RevenueOracle oracle = new RevenueOracle(address(epochManager), initialSigners, quorum);

        // ============ PERMISSIONS ============
        // Treasury: set distributor
        treasury.setDistributor(address(distributor));

        // Distributor: nothing to set (vault passed in constructor)

        // EpochManager: finalized hooks are implicit; Oracle will call finalizeEpoch when attesting

        vm.stopBroadcast();

        // ============ LOG OUTPUT ============
        console2.log("CircuitBreaker:", address(breaker));
        console2.log("Treasury:", address(treasury));
        console2.log("EpochManager:", address(epochManager));
        console2.log("RewardDistributor:", address(distributor));
        console2.log("ParticipationVault:", address(vault));
        console2.log("RevenueOracle:", address(oracle));
    }
}
