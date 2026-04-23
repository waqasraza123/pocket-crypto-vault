pragma solidity ^0.8.30;

import {GoalVault} from "./GoalVault.sol";

contract GoalVaultFactory {
    address public immutable usdc;

    mapping(address owner => address[] vaults) private vaultsByOwner;
    mapping(address vault => bool) public isGoalVault;

    error GoalVaultFactoryInvalidUnlockAt();

    event VaultCreated(
        address indexed owner,
        address indexed vault,
        address indexed asset,
        uint256 targetAmount,
        uint64 unlockAt,
        uint256 createdAt
    );

    constructor(address usdc_) {
        usdc = usdc_;
    }

    function createVault(uint256 targetAmount, uint64 unlockAt) external returns (address vault) {
        if (unlockAt <= block.timestamp) revert GoalVaultFactoryInvalidUnlockAt();

        GoalVault goalVault = new GoalVault(msg.sender, usdc, targetAmount, unlockAt);
        vault = address(goalVault);

        vaultsByOwner[msg.sender].push(vault);
        isGoalVault[vault] = true;

        emit VaultCreated(msg.sender, vault, usdc, targetAmount, unlockAt, block.timestamp);
    }

    function getVaultsByOwner(address owner) external view returns (address[] memory) {
        return vaultsByOwner[owner];
    }
}
