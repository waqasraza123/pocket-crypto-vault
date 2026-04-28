import type { AppReadinessState } from "@pocket-vault/shared";

import { StateBanner } from "../feedback";

export const AppStatusBanner = ({
  readiness,
}: {
  readiness: AppReadinessState;
}) => {
  const issue = readiness.issues[0];

  if (!issue) {
    return null;
  }

  return (
    <StateBanner
      icon={issue.severity === "blocking" ? "alert-circle-outline" : "information-outline"}
      label={issue.description}
      tone={issue.severity === "blocking" ? "warning" : "neutral"}
    />
  );
};
