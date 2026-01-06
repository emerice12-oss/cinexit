// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";
import "../utils/EpochMath.sol";
import "../governance/CircuitBreaker.sol";
import "../core/EpochManager.sol";

contract ParticipationVault {
    IERC20 public immutable USDC;
    CircuitBreaker public breaker;

    address public epochManager;

    /* ========== DATA STRUCTURES ========== */

    struct UserInfo {
        uint256 balance;
        uint256 lastEpoch;
        uint256 lastUpdate;
        uint256 weightAccrued; // balance * time
    }

    // user => info
    mapping(address => UserInfo) public users;

    mapping(address => uint256) public lastAccrual;

    // epochId => total weight
    mapping(uint256 => uint256) private _epochTotalWeight;

    // epochId => user => weight
    mapping(uint256 => mapping(address => uint256)) private _epochUserWeight;

    uint256 public totalWeightAccrued;

    uint256 public totalDeposits;
    uint256 public lastGlobalUpdate;

    mapping(address => uint256) public lastUserUpdate;

    mapping(address => uint256) internal deposits;

    uint256 public epochStart;

    /* ========== EVENTS ========== */

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event UserSnapshotted(address indexed user, uint256 indexed epochId, uint256 weight);
    event EpochFinalized(uint256 indexed epochId, uint256 totalWeight);

    /* ========== MODIFIERS ========== */

    modifier onlyEpochManager() {
        require(msg.sender == epochManager, "Not epoch manager");
        _;
    }

    modifier whenNotPaused() {
        if (address(breaker) != address(0)) {
            require(!breaker.isPaused(), "Deposits Paused");
        }
        _;
    }

    /* ========== CONSTRUCTOR ========== */

    constructor(address _usdc) {
        USDC = IERC20(_usdc);
        epochStart = block.timestamp;
        lastGlobalUpdate = block.timestamp;
    }

    /* ========== ADMIN SETUP ========== */

    function setEpochManager(address _epochManager) external {
        require(epochManager == address(0), "Epoch manager already set");
        epochManager = _epochManager;
    }

    function setBreaker(address _breaker) external {
        breaker = CircuitBreaker(_breaker);
    }

    /* ========== CORE ACCRUAL LOGIC ========== */

    

    function _accrue(address user) internal {
        uint256 nowTs = block.timestamp;

        uint256 deltaGlobal = nowTs - lastGlobalUpdate;
        if (deltaGlobal > 0 && totalDeposits > 0) {
            totalWeightAccrued += totalDeposits * deltaGlobal;
            lastGlobalUpdate = nowTs;
        }

        uint256 deltaUser = nowTs - lastUserUpdate[user];
        if (deltaUser > 0) {
            users[user].weightAccrued += users[user].balance * deltaUser;
            lastUserUpdate[user] = nowTs;
        }
    }

    function getUserDeposit(address user) external view returns (uint256) {
        return users[user].balance;
    }

    /* ========== USER ACTIONS ========== */

    function deposit(uint256 amount) external whenNotPaused {
        require(amount > 0, "Zero deposit");

        _accrue(msg.sender);

        USDC.transferFrom(msg.sender, address(this), amount);

        users[msg.sender].balance += amount;
        totalDeposits += amount;

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(users[msg.sender].balance >= amount, "Insufficient balance");

        _accrue(msg.sender);

        users[msg.sender].balance -= amount;
        totalDeposits -= amount;

        USDC.transfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount);
    }

    /* ============== EPOCH SNAPSHOTS ============== */

    function snapshotUser(address user, uint256 epochId)
        external
        onlyEpochManager
    {
        _accrue(user);

        uint256 weight = users[user].weightAccrued;
        
        _epochUserWeight[epochId][user] = weight;
        users[user].weightAccrued = 0;
        _epochTotalWeight[epochId] += weight;

        emit UserSnapshotted(user, epochId, weight);
    }

    function snapshotUsers(address[] calldata userList, uint256 epochId)
        external
        onlyEpochManager
    {
        for (uint256 i = 0; i < userList.length; ) {
            address u = userList[i];
            _accrue(u);

            uint256 weight = users[u].weightAccrued;
            
            _epochUserWeight[epochId][u] = weight;
            users[u].weightAccrued = 0;
            _epochTotalWeight[epochId] += weight;

            emit UserSnapshotted(u, epochId, weight);

            unchecked {
                ++i;
            }
        }
    }

    /* ========== VIEWS (TESTS + DISTRIBUTOR) ========== */

    function getUserEpochWeight(address user, uint256 epochId)
        external
        view
        returns (uint256)
    {
        return _epochUserWeight[epochId][user];
    }

    /* ========== VIEWS ========== */

    function getEpochTotalWeight(uint256 epochId)
        external
        view
        returns (uint256)
    {
        return _epochTotalWeight[epochId];
    }

    /* ========== EPOCH FINALIZATION ========== */

    // track whether an epoch has been finalized in the vault
    mapping(uint256 => bool) public epochFinalized;

    function finalizeEpoch(uint256 epochId)
        external
        onlyEpochManager
    {
        require(!epochFinalized[epochId], "Epoch already finalized");

        // 1️⃣ accrue global time-weighted balance
        _accrue(address(0)); // flush global time
        uint256 delta = block.timestamp - epochStart;

        if (delta > 0 && totalDeposits > 0) {
            totalWeightAccrued += totalDeposits * delta;
        }

        // 2️⃣ snapshot epoch total
        // - If users were snapshotted already, prefer that recorded total
        // - Otherwise fall back to the accumulated global total
        if (_epochTotalWeight[epochId] == 0) {
            _epochTotalWeight[epochId] = totalWeightAccrued;
        }

        // 3️⃣ reset for next epoch
        epochStart = block.timestamp;
        lastGlobalUpdate = block.timestamp;
        totalWeightAccrued = 0;

        epochFinalized[epochId] = true;
        emit EpochFinalized(epochId, _epochTotalWeight[epochId]);
    }

    function getCurrentEpoch() public view returns (uint256) {
        return epochManager == address(0)
            ? 1
            : EpochManager(epochManager).currentEpoch();
    }
}
