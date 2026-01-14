// ==============================
// CONTRACT: ReferralRegistry.sol
// Path: Contracts/referrals/ReferralRegistry.sol
// ==============================
pragma solidity ^0.8.20;

contract ReferralRegistry {
    mapping(address => address) public referrerOf;

    event ReferrerRegistered(address indexed user, address indexed referrer);

    function registerReferrer(address referrer) external {
        require(referrer != msg.sender, "NO_SELF_REFERRAL");
        require(referrerOf[msg.sender] == address(0), "ALREADY_REGISTERED");
        referrerOf[msg.sender] = referrer;
        emit ReferrerRegistered(msg.sender, referrer);
    }
}
