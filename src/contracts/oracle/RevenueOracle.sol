// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/EpochManager.sol";

contract RevenueOracle {
    EpochManager public immutable epochManager;

    mapping(address => bool) public isSigner;
    uint256 public signerCount;
    uint256 public quorum;

    uint256 public lastFinalizedEpoch; // initialize to 0 by default (sequential start at 1)

    mapping(uint256 => bool) public epochUsed;

    uint256 public constant TIMELOCK = 2 days;
    mapping(bytes32 => uint256) public queuedAt;

    // Owner for administrative actions
    address public owner;

    event EpochAttested(uint256 indexed epochId, uint256 revenueUSDC);
    event SignerAdded(address signer);
    event SignerRemoved(address signer);

    modifier onlySigner() {
        require(isSigner[msg.sender], "Not signer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier timelocked(bytes32 action) {
        uint256 t = queuedAt[action];
        require(t != 0 && block.timestamp >= t + TIMELOCK, "TIMELOCK");
        _;
        delete queuedAt[action];
    }

    function queueAction(bytes32 action) external onlyOwner {
        queuedAt[action] = block.timestamp;
    }

    constructor(
        address _epochManager,
        address[] memory _signers,
        uint256 _quorum
    ) {
        owner = msg.sender;
        require(_signers.length >= _quorum, "Invalid quorum");

        epochManager = EpochManager(_epochManager);
        quorum = _quorum;

        for (uint256 i = 0; i < _signers.length; i++) {
            address s = _signers[i];
            require(s != address(0), "Zero signer");
            require(!isSigner[s], "Duplicate signer");
            isSigner[s] = true;
            signerCount++;
        }
    }

    /* ========== CORE ORACLE LOGIC ========== */

    function attestRevenue(
        uint256 epochId,
        uint256 revenueUSDC,
        bytes[] calldata signatures
    ) external {
        // ✅ replay + ordering protection FIRST
        require(!epochUsed[epochId], "Epoch already attested");
        require(epochId == lastFinalizedEpoch + 1, "Epoch not sequential");

        // ✅ quorum check (correct variable)
        require(signatures.length >= quorum, "Not enough signatures");

        bytes32 messageHash = _messageHash(epochId, revenueUSDC);

        // ✅ verify signatures
        _verifySignatures(messageHash, signatures);

        // ✅ mark epoch used and advance
        epochUsed[epochId] = true;
        lastFinalizedEpoch = epochId;

        // ✅ finalize epoch in core protocol
        epochManager.finalizeEpoch(revenueUSDC);

        emit EpochAttested(epochId, revenueUSDC);
    }

    /* ========== SIGNATURE VERIFICATION ========== */

    function _verifySignatures(
        bytes32 messageHash,
        bytes[] calldata signatures
    ) internal view {
        address lastRecovered = address(0);
        uint256 validSignatures = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address recovered = _recoverSigner(messageHash, signatures[i]);
            require(isSigner[recovered], "Invalid signer");

            // Enforce deterministic order to prevent duplicates and replay of same signer
            require(recovered > lastRecovered, "Signatures not ordered");
            lastRecovered = recovered;

            validSignatures++;
        }

        require(validSignatures >= quorum, "Quorum not met");
    }

    function _recoverSigner(bytes32 hash, bytes calldata sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid v");

        // EIP-191 personal_sign prefix
        bytes32 ethSigned = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        return ecrecover(ethSigned, v, r, s);
    }

    function _messageHash(uint256 epochId, uint256 revenueUSDC
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), epochId, revenueUSDC, block.chainid));
    }

    /* ========== OPTIONAL: SIGNER MGMT (if needed) ========== */
    function addSigner(address s) external onlySigner {
        require(s != address(0), "Zero signer");
        require(!isSigner[s], "Duplicate signer");
        isSigner[s] = true;
        signerCount++;
        emit SignerAdded(s);
    }

    function removeSigner(address s) external onlySigner {
        require(isSigner[s], "Not signer");
        isSigner[s] = false;
        signerCount--;
        emit SignerRemoved(s);
    }

    // Admin function: timelocked owner action to add a signer
    function adminAddSigner(address signer)
        external
        onlyOwner
        timelocked(keccak256("ADD_SIGNER"))
    {
        require(signer != address(0), "Zero signer");
        require(!isSigner[signer], "Duplicate signer");
        isSigner[signer] = true;
        signerCount++;
        emit SignerAdded(signer);
    }
}
