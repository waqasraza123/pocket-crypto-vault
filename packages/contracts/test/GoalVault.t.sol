pragma solidity ^0.8.30;

import {GoalVaultFactory} from "../src/GoalVaultFactory.sol";

contract GoalVaultFactorySmokeTest {
    function createFactory(address usdc) external returns (GoalVaultFactory) {
        return new GoalVaultFactory(usdc);
    }
}
