// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {RevenueOracle} from "src/contracts/oracle/RevenueOracle.sol";
import {EpochManager} from "src/contracts/core/EpochManager.sol";
import {MockUSDC} from "src/contracts/test/mocks/MockUSDC.sol";

contract OracleSignatureAttackTest is Test {
    RevenueOracle oracle;
    EpochManager epochManager;
    MockUSDC usdc;

    address signer1 = vm.addr(1);
    address signer2 = vm.addr(2);
    address signer3 = vm.addr(3);

    function setUp() public {
        usdc = new MockUSDC();
        epochManager = new EpochManager(address(this), address(0), address(0));

        address[] memory signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        oracle = new RevenueOracle(
            address(epochManager),
            signers,
            2 // quorum
        );
    }

    /* ========== 1️⃣ SIGNATURE FLOOD ========== */
    function test_SignatureFloodRejected() public {
        bytes[] memory sigs = new bytes[](3);

        for (uint256 i = 0; i < sigs.length; i++) {
            sigs[i] = new bytes(65); // garbage but correct length
        }

        vm.expectRevert("Invalid signer");
        oracle.attestRevenue(1, 1_000e6, sigs);
    }

    /* ========== 2️⃣ DUPLICATE SIGNER ========== */
    function test_DuplicateSignerRejected() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = new bytes(65);
        sigs[1] = sigs[0]; // duplicated signature

        // Contract verifies recovered signer first, so garbage/duplicate sigs trigger Invalid signer
        vm.expectRevert("Invalid signer");
        oracle.attestRevenue(1, 1_000e6, sigs);
    }

    /* ========== 3️⃣ CROSS-EPOCH REPLAY ========== */
    function test_CrossEpochReplayRejected() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = new bytes(65);
        sigs[1] = new bytes(65);

        // First attempt
        vm.expectRevert("Invalid signer");
        oracle.attestRevenue(1, 1_000e6, sigs);

        // Replay same sigs for different epoch: contract enforces sequential epoch ids first
        vm.expectRevert("Epoch not sequential");
        oracle.attestRevenue(2, 1_000e6, sigs);
    }
}
