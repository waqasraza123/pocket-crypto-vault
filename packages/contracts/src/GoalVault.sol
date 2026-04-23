pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GoalVault {
    address public immutable owner;
    address public immutable asset;
    uint256 public immutable targetAmount;
    uint64 public immutable unlockAt;

    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    error GoalVaultUnauthorized();
    error GoalVaultInvalidAmount();
    error GoalVaultLocked();

    event Deposited(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);

    constructor(address owner_, address asset_, uint256 targetAmount_, uint64 unlockAt_) {
        owner = owner_;
        asset = asset_;
        targetAmount = targetAmount_;
        unlockAt = unlockAt_;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) revert GoalVaultInvalidAmount();

        totalDeposited += amount;
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint256 amount, address to) external {
        if (msg.sender != owner) revert GoalVaultUnauthorized();
        if (block.timestamp < unlockAt) revert GoalVaultLocked();
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
        vaultUnlockAt = unlockAt;
        vaultTotalDeposited = totalDeposited;
        vaultTotalWithdrawn = totalWithdrawn;
        vaultBalance = IERC20(asset).balanceOf(address(this));
        vaultIsUnlocked = block.timestamp >= unlockAt;
    }
}
