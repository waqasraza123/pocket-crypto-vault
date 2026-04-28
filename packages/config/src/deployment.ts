import type { AppEnvironment, DeploymentTarget, ReleaseReadinessCheck, ReleaseReadinessState } from "@pocket-vault/shared";

export const appEnvironmentValues = ["development", "staging", "production"] as const satisfies readonly AppEnvironment[];

export const resolveAppEnvironment = ({
  appEnv,
  publicAppEnv,
  nodeEnv,
}: {
  appEnv?: string | null;
  publicAppEnv?: string | null;
  nodeEnv?: string | null;
}): AppEnvironment => {
  if (publicAppEnv === "development" || publicAppEnv === "staging" || publicAppEnv === "production") {
    return publicAppEnv;
  }

  if (appEnv === "development" || appEnv === "staging" || appEnv === "production") {
    return appEnv;
  }

  if (nodeEnv === "production") {
    return "production";
  }

  return "development";
};

export const resolveDeploymentTarget = (environment: AppEnvironment): DeploymentTarget =>
  environment === "development" ? "local" : environment;

export const getReleaseStatus = (checks: ReleaseReadinessCheck[]): ReleaseReadinessState["status"] => {
  if (checks.some((check) => check.status === "blocked")) {
    return "blocked";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "degraded";
  }

  return "ready";
};
