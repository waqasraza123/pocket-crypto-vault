pragma solidity ^0.8.30;

import {GoalVaultFactory} from "../src/GoalVaultFactory.sol";

contract DeployGoalVaultFactoryScript {
    function deploy(address usdc) external returns (GoalVaultFactory) {
        return new GoalVaultFactory(usdc);
    }
}
