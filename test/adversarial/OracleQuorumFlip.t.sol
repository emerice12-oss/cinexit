// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";

import {RevenueOracle} from "src/contracts/oracle/RevenueOracle.sol";
import {EpochManager} from "src/contracts/core/EpochManager.sol";

contract OracleQuorumFlipTest is Test {
    RevenueOracle oracle;
    EpochManager epochManager;

    address s1 = address(0x1);
    address s2 = address(0x2);
    address s3 = address(0x3);

    function setUp() public {
        epochManager = new EpochManager(address(this), address(0), address(0));

        address[] memory signers = new address[](3);
        signers[0] = s1;
        signers[1] = s2;
        signers[2] = s3;

        oracle = new RevenueOracle(
            address(epochManager),
            signers,
            2 // quorum
        );
    }

    function _fakeSig() internal pure returns (bytes memory) {
        return new bytes(65);
    }

    function test_CannotBypassQuorumByRemovingSigner() public {
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _fakeSig();
        sigs[1] = _fakeSig();

        // First attestation attempt (will revert: invalid signer)
        vm.expectRevert();
        oracle.attestRevenue(1, 1_000e6, sigs);

        // Remove a signer to try to reduce quorum pressure (call as an existing signer)
        vm.prank(s1);
        oracle.removeSigner(s3);

        // Still must fail — quorum enforcement remains
        vm.expectRevert();
        oracle.attestRevenue(1, 1_000e6, sigs);
    }

    function test_CannotReplayEpochAfterSignerFlip() public {
        bytes[] memory sigs = new bytes[](3);
        sigs[0] = _fakeSig();
        sigs[1] = _fakeSig();
        sigs[2] = _fakeSig();

        // First attempt fails (invalid signer)
        vm.expectRevert();
        oracle.attestRevenue(1, 500e6, sigs);

        // Add signer churn (performed by an existing signer)
        vm.prank(s1);
        oracle.removeSigner(s2);
        vm.prank(s1);
        oracle.addSigner(address(0x4));

        // Replay attempt must still fail
        vm.expectRevert();
        oracle.attestRevenue(1, 500e6, sigs);
    }
}
