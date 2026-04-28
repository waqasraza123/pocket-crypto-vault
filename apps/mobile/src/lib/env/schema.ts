import type { AppConfigState, AppEnvironment, DeploymentTarget, ReleaseReadinessState } from "@pocket-vault/shared";

export interface AppEnvDiagnostics {
  environment: AppEnvironment;
  deploymentTarget: DeploymentTarget;
  validationErrors: string[];
  configState: AppConfigState;
  releaseReadiness: ReleaseReadinessState;
}
