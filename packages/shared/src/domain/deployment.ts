import type { SupportedChainId } from "./chain";

export type AppEnvironment = "development" | "staging" | "production";
export type DeploymentTarget = "local" | "staging" | "production";
export type AppConfigStatus = "valid" | "invalid";
export type ApiPersistenceDriver = "sqlite" | "postgresql";
export type ReleaseCheckStatus = "ready" | "warning" | "blocked";
export type ReleaseReadinessStatus = "ready" | "degraded" | "blocked";
export type LaunchChecklistItemStatus = "pending" | "ready" | "optional";
export type SmokeCheckStatus = "pass" | "fail" | "skip";

export interface ChainConfigState {
  chainId: SupportedChainId;
  label: string;
  rpcConfigured: boolean;
  factoryConfigured: boolean;
  readsReady: boolean;
  writesReady: boolean;
  expectedForEnvironment: boolean;
}

export interface AppConfigState {
  environment: AppEnvironment;
  deploymentTarget: DeploymentTarget;
  status: AppConfigStatus;
  issues: string[];
  chainStates: ChainConfigState[];
}

export interface ReleaseReadinessCheck {
  key: string;
  label: string;
  status: ReleaseCheckStatus;
  message: string;
}

export interface ReleaseReadinessState {
  environment: AppEnvironment;
  status: ReleaseReadinessStatus;
  message: string;
  checks: ReleaseReadinessCheck[];
}

export interface BackendReadinessState {
  environment: AppEnvironment;
  deploymentTarget: DeploymentTarget;
  status: "alive" | "ready" | "blocked";
  indexerEnabled: boolean;
  persistenceDriver?: ApiPersistenceDriver;
  publicBaseUrl: string | null;
}

export interface LaunchChecklistItem {
  key: string;
  area: string;
  status: LaunchChecklistItemStatus;
  description: string;
}

export interface SmokeCheckResult {
  key: string;
  status: SmokeCheckStatus;
  notes?: string;
}
