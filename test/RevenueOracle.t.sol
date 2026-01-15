// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./BaseTest.t.sol";

contract RevenueOracleTest is BaseTest {
    function test_RevertIfNotEnoughSignatures() public {
        // prepare a non-empty but insufficient signatures array
        bytes[] memory sigs = new bytes[](0); // or any shorter-than-required length

        vm.expectRevert("Not enough signatures");
        oracle.attestRevenue(1, 1_000e6, sigs);
    }

    function test_RevertOnEpochReplay() public {
        uint256 epochId = 1;
        uint256 revenue = 1_000e6;

        uint256 q = oracle.quorum();

        bytes32 ethSigned = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(address(oracle), epochId, revenue, block.chainid))
            )
        );

        // Sign with signer keys from BaseTest (signerKey1, signerKey2)
        bytes[] memory sigs1 = new bytes[](q);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(signerKey1, ethSigned);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(signerKey2, ethSigned);

        // enforce ascending-recovered-order required by oracle
        if (vm.addr(signerKey1) < vm.addr(signerKey2)) {
            sigs1[0] = abi.encodePacked(r1, s1, v1);
            sigs1[1] = abi.encodePacked(r2, s2, v2);
        } else {
            sigs1[0] = abi.encodePacked(r2, s2, v2);
            sigs1[1] = abi.encodePacked(r1, s1, v1);
        }

        oracle.attestRevenue(epochId, revenue, sigs1);

        // Second attestation (replay) with the same epoch and signatures
        vm.expectRevert("Epoch already attested");
        oracle.attestRevenue(epochId, revenue, sigs1);
    }
}
