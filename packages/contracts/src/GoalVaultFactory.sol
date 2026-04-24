pragma solidity ^0.8.30;

import {GoalVault} from "./GoalVault.sol";

contract GoalVaultFactory {
    uint8 internal constant RULE_TIME_LOCK = 0;
    uint8 internal constant RULE_COOLDOWN_UNLOCK = 1;
    uint8 internal constant RULE_GUARDIAN_APPROVAL = 2;

    address public immutable usdc;

    mapping(address owner => address[] vaults) private vaultsByOwner;
    mapping(address vault => bool) public isGoalVault;

    error GoalVaultFactoryInvalidUnlockAt();
    error GoalVaultFactoryInvalidRuleType();
    error GoalVaultFactoryInvalidCooldownDuration();
    error GoalVaultFactoryInvalidGuardian();

    event VaultCreated(
        address indexed owner,
        address indexed vault,
        address indexed asset,
        uint256 targetAmount,
        uint64 unlockAt,
        uint256 createdAt
    );

    event VaultCreatedV2(
        address indexed owner,
        address indexed vault,
        address indexed asset,
        uint256 targetAmount,
        uint8 ruleType,
        uint64 unlockAt,
        uint64 cooldownDuration,
        address guardian,
        uint256 createdAt
    );

    constructor(address usdc_) {
        usdc = usdc_;
    }

    function createVault(uint256 targetAmount, uint64 unlockAt) external returns (address vault) {
        vault = _createVault(targetAmount, RULE_TIME_LOCK, unlockAt, 0, address(0));
    }

    function createVault(
        uint256 targetAmount,
        uint8 ruleType,
        uint64 unlockAt,
        uint64 cooldownDuration,
        address guardian
    ) external returns (address vault) {
        vault = _createVault(targetAmount, ruleType, unlockAt, cooldownDuration, guardian);
    }

    function getVaultsByOwner(address owner) external view returns (address[] memory) {
        return vaultsByOwner[owner];
    }

    function _createVault(
        uint256 targetAmount,
        uint8 ruleType,
        uint64 unlockAt,
        uint64 cooldownDuration,
        address guardian
    ) internal returns (address vault) {
        if (ruleType > RULE_GUARDIAN_APPROVAL) revert GoalVaultFactoryInvalidRuleType();

        if (ruleType == RULE_TIME_LOCK) {
            if (unlockAt <= block.timestamp) revert GoalVaultFactoryInvalidUnlockAt();
            if (cooldownDuration != 0) revert GoalVaultFactoryInvalidCooldownDuration();
            if (guardian != address(0)) revert GoalVaultFactoryInvalidGuardian();
        }

        if (ruleType == RULE_COOLDOWN_UNLOCK) {
            if (cooldownDuration == 0) revert GoalVaultFactoryInvalidCooldownDuration();
            if (guardian != address(0)) revert GoalVaultFactoryInvalidGuardian();
        }

        if (ruleType == RULE_GUARDIAN_APPROVAL) {
            if (guardian == address(0) || guardian == msg.sender) revert GoalVaultFactoryInvalidGuardian();
            if (cooldownDuration != 0) revert GoalVaultFactoryInvalidCooldownDuration();
        }

        GoalVault goalVault = new GoalVault(msg.sender, usdc, targetAmount, ruleType, unlockAt, cooldownDuration, guardian);
        vault = address(goalVault);

        vaultsByOwner[msg.sender].push(vault);
        isGoalVault[vault] = true;

        if (ruleType == RULE_TIME_LOCK) {
            emit VaultCreated(msg.sender, vault, usdc, targetAmount, unlockAt, block.timestamp);
        }

        emit VaultCreatedV2(msg.sender, vault, usdc, targetAmount, ruleType, unlockAt, cooldownDuration, guardian, block.timestamp);
    }
}
