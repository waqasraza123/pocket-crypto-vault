import { parseHealthPayload, parseHealthResponse } from "@pocket-vault/api-client";
import type { HealthStatus } from "@pocket-vault/shared";

import { fetchBackendJson } from "./client";

export const fetchApiHealth = async (): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data: HealthStatus | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson({
    path: "/ready",
    fallbackMessage: "Pocket Vault services are not available right now.",
    parse: parseHealthPayload,
  });

  if (response.status !== "success" || !response.data) {
    return {
      status: response.status,
      data: null,
      message: response.message,
    };
  }

  return {
    status: "success",
    data: parseHealthResponse(response.data),
    message: null,
  };
};
