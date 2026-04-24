pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GoalVault {
    uint8 internal constant RULE_TIME_LOCK = 0;
    uint8 internal constant RULE_COOLDOWN_UNLOCK = 1;
    uint8 internal constant RULE_GUARDIAN_APPROVAL = 2;

    uint8 internal constant GUARDIAN_NONE = 0;
    uint8 internal constant GUARDIAN_PENDING = 1;
    uint8 internal constant GUARDIAN_APPROVED = 2;
    uint8 internal constant GUARDIAN_REJECTED = 3;

    address public immutable owner;
    address public immutable asset;
    uint256 public immutable targetAmount;
    uint64 public immutable unlockAt;
    uint8 public immutable ruleType;
    uint64 public immutable cooldownDuration;
    address public immutable guardian;

    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint64 public unlockRequestedAt;
    uint8 public guardianDecision;
    uint64 public guardianDecisionAt;

    error GoalVaultUnauthorized();
    error GoalVaultInvalidAmount();
    error GoalVaultLocked();
    error GoalVaultUnsupportedRuleAction();
    error GoalVaultInvalidGuardian();
    error GoalVaultUnlockAlreadyRequested();
    error GoalVaultUnlockNotRequested();
    error GoalVaultGuardianDecisionUnavailable();
    error GoalVaultGuardianDecisionAlreadyMade();

    event Deposited(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);
    event UnlockRequested(address indexed requestedBy, uint8 indexed ruleType, uint256 availableAt, uint256 timestamp);
    event UnlockCanceled(address indexed canceledBy, uint8 indexed ruleType, uint256 timestamp);
    event GuardianApproved(address indexed guardian, uint256 timestamp);
    event GuardianRejected(address indexed guardian, uint256 timestamp);

    constructor(
        address owner_,
        address asset_,
        uint256 targetAmount_,
        uint8 ruleType_,
        uint64 unlockAt_,
        uint64 cooldownDuration_,
        address guardian_
    ) {
        if (ruleType_ > RULE_GUARDIAN_APPROVAL) revert GoalVaultUnsupportedRuleAction();
        if (ruleType_ == RULE_GUARDIAN_APPROVAL && (guardian_ == address(0) || guardian_ == owner_)) revert GoalVaultInvalidGuardian();

        owner = owner_;
        asset = asset_;
        targetAmount = targetAmount_;
        ruleType = ruleType_;
        unlockAt = unlockAt_;
        cooldownDuration = cooldownDuration_;
        guardian = guardian_;
        guardianDecision = GUARDIAN_NONE;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) revert GoalVaultInvalidAmount();

        totalDeposited += amount;
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function requestUnlock() external {
        if (msg.sender != owner) revert GoalVaultUnauthorized();
        if (IERC20(asset).balanceOf(address(this)) == 0) revert GoalVaultInvalidAmount();

        if (ruleType == RULE_TIME_LOCK) {
          revert GoalVaultUnsupportedRuleAction();
        }

        if (ruleType == RULE_COOLDOWN_UNLOCK) {
            if (unlockRequestedAt != 0) revert GoalVaultUnlockAlreadyRequested();

            unlockRequestedAt = uint64(block.timestamp);
            emit UnlockRequested(msg.sender, ruleType, block.timestamp + cooldownDuration, block.timestamp);
            return;
        }

        if (guardian == address(0)) revert GoalVaultInvalidGuardian();
        if (guardianDecision == GUARDIAN_PENDING) revert GoalVaultUnlockAlreadyRequested();
        if (guardianDecision == GUARDIAN_APPROVED) revert GoalVaultGuardianDecisionAlreadyMade();

        unlockRequestedAt = uint64(block.timestamp);
        guardianDecision = GUARDIAN_PENDING;
        guardianDecisionAt = 0;

        emit UnlockRequested(msg.sender, ruleType, 0, block.timestamp);
    }

    function cancelUnlockRequest() external {
        if (msg.sender != owner) revert GoalVaultUnauthorized();
        if (unlockRequestedAt == 0) revert GoalVaultUnlockNotRequested();
        if (ruleType == RULE_TIME_LOCK) revert GoalVaultUnsupportedRuleAction();

        unlockRequestedAt = 0;

        if (ruleType == RULE_GUARDIAN_APPROVAL) {
            guardianDecision = GUARDIAN_NONE;
            guardianDecisionAt = 0;
        }

        emit UnlockCanceled(msg.sender, ruleType, block.timestamp);
    }

    function approveUnlock() external {
        if (ruleType != RULE_GUARDIAN_APPROVAL) revert GoalVaultUnsupportedRuleAction();
        if (msg.sender != guardian) revert GoalVaultUnauthorized();
        if (unlockRequestedAt == 0 || guardianDecision != GUARDIAN_PENDING) revert GoalVaultGuardianDecisionUnavailable();

        guardianDecision = GUARDIAN_APPROVED;
        guardianDecisionAt = uint64(block.timestamp);

        emit GuardianApproved(msg.sender, block.timestamp);
    }

    function rejectUnlock() external {
        if (ruleType != RULE_GUARDIAN_APPROVAL) revert GoalVaultUnsupportedRuleAction();
        if (msg.sender != guardian) revert GoalVaultUnauthorized();
        if (unlockRequestedAt == 0 || guardianDecision != GUARDIAN_PENDING) revert GoalVaultGuardianDecisionUnavailable();

        guardianDecision = GUARDIAN_REJECTED;
        guardianDecisionAt = uint64(block.timestamp);

        emit GuardianRejected(msg.sender, block.timestamp);
    }

    function withdraw(uint256 amount, address to) external {
        if (msg.sender != owner) revert GoalVaultUnauthorized();
        if (!_isWithdrawalUnlocked()) revert GoalVaultLocked();
        if (amount == 0) revert GoalVaultInvalidAmount();

        totalWithdrawn += amount;
        IERC20(asset).transfer(to, amount);

        emit Withdrawn(to, amount, block.timestamp);
    }

    function getSummary()
        external
        view
        returns (
            address vaultOwner,
            address vaultAsset,
            uint256 vaultTargetAmount,
            uint64 vaultUnlockAt,
            uint256 vaultTotalDeposited,
            uint256 vaultTotalWithdrawn,
            uint256 vaultBalance,
            bool vaultIsUnlocked
        )
    {
        vaultOwner = owner;
        vaultAsset = asset;
        vaultTargetAmount = targetAmount;
        vaultUnlockAt = _getLegacyUnlockAt();
        vaultTotalDeposited = totalDeposited;
        vaultTotalWithdrawn = totalWithdrawn;
        vaultBalance = IERC20(asset).balanceOf(address(this));
        vaultIsUnlocked = _isWithdrawalUnlocked();
    }

    function getRuleState()
        external
        view
        returns (
            uint8 vaultRuleType,
            uint64 vaultUnlockAt,
            uint64 vaultCooldownDuration,
            address vaultGuardian,
            uint64 vaultUnlockRequestedAt,
            uint8 vaultGuardianDecision,
            uint64 vaultGuardianDecisionAt,
            uint64 vaultUnlockEligibleAt,
            bool vaultWithdrawalEligible
        )
    {
        vaultRuleType = ruleType;
        vaultUnlockAt = unlockAt;
        vaultCooldownDuration = cooldownDuration;
        vaultGuardian = guardian;
        vaultUnlockRequestedAt = unlockRequestedAt;
        vaultGuardianDecision = guardianDecision;
        vaultGuardianDecisionAt = guardianDecisionAt;
        vaultUnlockEligibleAt = _getUnlockEligibleAt();
        vaultWithdrawalEligible = _isWithdrawalUnlocked();
    }

    function _getLegacyUnlockAt() internal view returns (uint64) {
        if (ruleType == RULE_TIME_LOCK) {
            return unlockAt;
        }

        if (ruleType == RULE_COOLDOWN_UNLOCK) {
            return _getUnlockEligibleAt();
        }

        return 0;
    }

    function _getUnlockEligibleAt() internal view returns (uint64) {
        if (ruleType == RULE_TIME_LOCK) {
            return unlockAt;
        }

        if (ruleType == RULE_COOLDOWN_UNLOCK) {
            if (unlockRequestedAt == 0) {
                return 0;
            }

            return unlockRequestedAt + cooldownDuration;
        }

        return 0;
    }

    function _isWithdrawalUnlocked() internal view returns (bool) {
        if (ruleType == RULE_TIME_LOCK) {
            return block.timestamp >= unlockAt;
        }

        if (ruleType == RULE_COOLDOWN_UNLOCK) {
            return unlockRequestedAt != 0 && block.timestamp >= unlockRequestedAt + cooldownDuration;
        }

        return unlockRequestedAt != 0 && guardianDecision == GUARDIAN_APPROVED;
    }
}
