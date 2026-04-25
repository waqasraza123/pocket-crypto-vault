pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {GoalVault} from "../src/GoalVault.sol";
import {GoalVaultFactory} from "../src/GoalVaultFactory.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract GoalVaultRuleSystemTest is Test {
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

    event Deposited(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);
    event UnlockRequested(address indexed requestedBy, uint8 indexed ruleType, uint256 availableAt, uint256 timestamp);
    event UnlockCanceled(address indexed canceledBy, uint8 indexed ruleType, uint256 timestamp);
    event GuardianApproved(address indexed guardian, uint256 timestamp);
    event GuardianRejected(address indexed guardian, uint256 timestamp);

    uint8 internal constant RULE_TIME_LOCK = 0;
    uint8 internal constant RULE_COOLDOWN_UNLOCK = 1;
    uint8 internal constant RULE_GUARDIAN_APPROVAL = 2;

    address internal owner = address(0xA11CE);
    address internal guardian = address(0xB0B);
    address internal outsider = address(0xC0DE);

    MockUSDC internal usdc;
    GoalVaultFactory internal factory;

    function setUp() external {
        usdc = new MockUSDC();
        factory = new GoalVaultFactory(address(usdc));

        usdc.mint(owner, 1_000_000e6);
    }

    function testTimeLockCreationEmitsLegacyAndV2Events() external {
        uint64 unlockAt = uint64(block.timestamp + 30 days);
        uint256 targetAmount = 2_500e6;

        vm.expectEmit(true, false, true, true, address(factory));
        emit VaultCreated(owner, address(0), address(usdc), targetAmount, unlockAt, block.timestamp);
        vm.expectEmit(true, false, true, true, address(factory));
        emit VaultCreatedV2(owner, address(0), address(usdc), targetAmount, RULE_TIME_LOCK, unlockAt, 0, address(0), block.timestamp);

        vm.prank(owner);
        address vaultAddress = factory.createVault(targetAmount, unlockAt);

        assertTrue(factory.isGoalVault(vaultAddress));

        address[] memory ownerVaults = factory.getVaultsByOwner(owner);
        assertEq(ownerVaults.length, 1);
        assertEq(ownerVaults[0], vaultAddress);

        GoalVault vault = GoalVault(vaultAddress);
        (
            uint8 ruleType,
            uint64 storedUnlockAt,
            uint64 cooldownDuration,
            address storedGuardian,
            uint64 unlockRequestedAt,
            uint8 guardianDecision,
            uint64 guardianDecisionAt,
            uint64 unlockEligibleAt,
            bool withdrawalEligible
        ) = vault.getRuleState();

        assertEq(ruleType, RULE_TIME_LOCK);
        assertEq(storedUnlockAt, unlockAt);
        assertEq(cooldownDuration, 0);
        assertEq(storedGuardian, address(0));
        assertEq(unlockRequestedAt, 0);
        assertEq(guardianDecision, 0);
        assertEq(guardianDecisionAt, 0);
        assertEq(unlockEligibleAt, unlockAt);
        assertFalse(withdrawalEligible);
    }

    function testCooldownCreationAndLifecycle() external {
        GoalVault vault = _createCooldownVault(7 days);

        _deposit(vault, 600e6);

        vm.expectEmit(true, true, true, true, address(vault));
        emit UnlockRequested(owner, RULE_COOLDOWN_UNLOCK, block.timestamp + 7 days, block.timestamp);
        vm.prank(owner);
        vault.requestUnlock();

        (
            uint8 ruleType,
            ,
            uint64 cooldownDuration,
            ,
            uint64 unlockRequestedAt,
            ,
            ,
            uint64 unlockEligibleAt,
            bool withdrawalEligible
        ) = vault.getRuleState();

        assertEq(ruleType, RULE_COOLDOWN_UNLOCK);
        assertEq(cooldownDuration, 7 days);
        assertEq(unlockRequestedAt, block.timestamp);
        assertEq(unlockEligibleAt, block.timestamp + 7 days);
        assertFalse(withdrawalEligible);

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultLocked.selector);
        vault.withdraw(100e6, owner);

        vm.warp(block.timestamp + 7 days + 1);
        vm.expectEmit(true, true, true, true, address(vault));
        emit Withdrawn(owner, 100e6, block.timestamp);
        vm.prank(owner);
        vault.withdraw(100e6, owner);

        (, , , , uint256 totalDeposited, uint256 totalWithdrawn, uint256 vaultBalance, bool isUnlocked) = vault.getSummary();
        assertEq(totalDeposited, 600e6);
        assertEq(totalWithdrawn, 100e6);
        assertEq(vaultBalance, 500e6);
        assertTrue(isUnlocked);
    }

    function testCooldownCancelClearsRequestState() external {
        GoalVault vault = _createCooldownVault(3 days);

        _deposit(vault, 250e6);

        vm.prank(owner);
        vault.requestUnlock();

        vm.expectEmit(true, true, true, true, address(vault));
        emit UnlockCanceled(owner, RULE_COOLDOWN_UNLOCK, block.timestamp);
        vm.prank(owner);
        vault.cancelUnlockRequest();

        (, , , , uint64 unlockRequestedAt, , , uint64 unlockEligibleAt, bool withdrawalEligible) = vault.getRuleState();

        assertEq(unlockRequestedAt, 0);
        assertEq(unlockEligibleAt, 0);
        assertFalse(withdrawalEligible);

        vm.warp(block.timestamp + 3 days + 1);
        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultLocked.selector);
        vault.withdraw(50e6, owner);
    }

    function testGuardianApproveAndRejectFlows() external {
        GoalVault approvingVault = _createGuardianVault();
        _deposit(approvingVault, 400e6);

        vm.expectEmit(true, true, true, true, address(approvingVault));
        emit UnlockRequested(owner, RULE_GUARDIAN_APPROVAL, 0, block.timestamp);
        vm.prank(owner);
        approvingVault.requestUnlock();

        vm.expectEmit(true, true, true, true, address(approvingVault));
        emit GuardianApproved(guardian, block.timestamp);
        vm.prank(guardian);
        approvingVault.approveUnlock();

        (, , , , uint64 unlockRequestedAt, uint8 guardianDecision, uint64 guardianDecisionAt, , bool withdrawalEligible) =
            approvingVault.getRuleState();
        assertEq(unlockRequestedAt, block.timestamp);
        assertEq(guardianDecision, 2);
        assertEq(guardianDecisionAt, block.timestamp);
        assertTrue(withdrawalEligible);

        vm.prank(owner);
        approvingVault.withdraw(100e6, owner);

        GoalVault rejectingVault = _createGuardianVault();
        _deposit(rejectingVault, 200e6);

        vm.prank(owner);
        rejectingVault.requestUnlock();

        vm.expectEmit(true, true, true, true, address(rejectingVault));
        emit GuardianRejected(guardian, block.timestamp);
        vm.prank(guardian);
        rejectingVault.rejectUnlock();

        (, , , , , uint8 rejectedDecision, , , bool rejectedEligible) = rejectingVault.getRuleState();
        assertEq(rejectedDecision, 3);
        assertFalse(rejectedEligible);

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultLocked.selector);
        rejectingVault.withdraw(50e6, owner);
    }

    function testGuardianAuthorizationAndBypassChecks() external {
        GoalVault vault = _createGuardianVault();
        _deposit(vault, 300e6);

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultLocked.selector);
        vault.withdraw(50e6, owner);

        vm.prank(outsider);
        vm.expectRevert(GoalVault.GoalVaultUnauthorized.selector);
        vault.approveUnlock();

        vm.prank(guardian);
        vm.expectRevert(GoalVault.GoalVaultGuardianDecisionUnavailable.selector);
        vault.approveUnlock();

        vm.prank(owner);
        vault.requestUnlock();

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultUnauthorized.selector);
        vault.approveUnlock();
    }

    function testDepositAndWithdrawAccountingForTimeLockVault() external {
        uint64 unlockAt = uint64(block.timestamp + 1 days);
        uint256 targetAmount = 1_000e6;

        vm.prank(owner);
        GoalVault vault = GoalVault(factory.createVault(targetAmount, unlockAt));

        vm.startPrank(owner);
        usdc.approve(address(vault), 700e6);
        vm.expectEmit(true, true, true, true, address(vault));
        emit Deposited(owner, 700e6, block.timestamp);
        vault.deposit(700e6);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days + 1);
        vm.expectEmit(true, true, true, true, address(vault));
        emit Withdrawn(owner, 200e6, block.timestamp);
        vm.prank(owner);
        vault.withdraw(200e6, owner);

        (, , uint256 target, uint64 storedUnlockAt, uint256 totalDeposited, uint256 totalWithdrawn, uint256 vaultBalance, bool isUnlocked) =
            vault.getSummary();
        assertEq(target, targetAmount);
        assertEq(storedUnlockAt, unlockAt);
        assertEq(totalDeposited, 700e6);
        assertEq(totalWithdrawn, 200e6);
        assertEq(vaultBalance, 500e6);
        assertTrue(isUnlocked);
    }

    function testInvalidGuardianAndDuplicateRuleActionsRevert() external {
        vm.prank(owner);
        vm.expectRevert(GoalVaultFactory.GoalVaultFactoryInvalidGuardian.selector);
        factory.createVault(500e6, RULE_GUARDIAN_APPROVAL, 0, 0, address(0));

        vm.prank(owner);
        vm.expectRevert(GoalVaultFactory.GoalVaultFactoryInvalidGuardian.selector);
        factory.createVault(500e6, RULE_GUARDIAN_APPROVAL, 0, 0, owner);

        GoalVault cooldownVault = _createCooldownVault(5 days);
        _deposit(cooldownVault, 100e6);

        vm.prank(owner);
        cooldownVault.requestUnlock();

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultUnlockAlreadyRequested.selector);
        cooldownVault.requestUnlock();

        vm.prank(owner);
        cooldownVault.cancelUnlockRequest();

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultUnlockNotRequested.selector);
        cooldownVault.cancelUnlockRequest();

        uint64 unlockAt = uint64(block.timestamp + 10 days);
        vm.prank(owner);
        GoalVault timeLockVault = GoalVault(factory.createVault(200e6, unlockAt));
        _deposit(timeLockVault, 50e6);

        vm.prank(owner);
        vm.expectRevert(GoalVault.GoalVaultUnsupportedRuleAction.selector);
        timeLockVault.requestUnlock();
    }

    function _createCooldownVault(uint64 cooldownDuration) internal returns (GoalVault vault) {
        uint256 targetAmount = 1_500e6;

        vm.expectEmit(true, false, true, true, address(factory));
        emit VaultCreatedV2(owner, address(0), address(usdc), targetAmount, RULE_COOLDOWN_UNLOCK, 0, cooldownDuration, address(0), block.timestamp);

        vm.prank(owner);
        vault = GoalVault(factory.createVault(targetAmount, RULE_COOLDOWN_UNLOCK, 0, cooldownDuration, address(0)));

        (, , uint64 storedCooldownDuration, address storedGuardian, , , , , bool withdrawalEligible) = vault.getRuleState();
        assertEq(storedCooldownDuration, cooldownDuration);
        assertEq(storedGuardian, address(0));
        assertFalse(withdrawalEligible);
    }

    function _createGuardianVault() internal returns (GoalVault vault) {
        uint256 targetAmount = 900e6;

        vm.expectEmit(true, false, true, true, address(factory));
        emit VaultCreatedV2(owner, address(0), address(usdc), targetAmount, RULE_GUARDIAN_APPROVAL, 0, 0, guardian, block.timestamp);

        vm.prank(owner);
        vault = GoalVault(factory.createVault(targetAmount, RULE_GUARDIAN_APPROVAL, 0, 0, guardian));

        (, , , address storedGuardian, , uint8 guardianDecision, , , bool withdrawalEligible) = vault.getRuleState();
        assertEq(storedGuardian, guardian);
        assertEq(guardianDecision, 0);
        assertFalse(withdrawalEligible);
    }

    function _deposit(GoalVault vault, uint256 amount) internal {
        vm.startPrank(owner);
        usdc.approve(address(vault), amount);
        vault.deposit(amount);
        vm.stopPrank();
    }
}
