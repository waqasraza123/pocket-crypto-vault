import { parseSupportRequestResponsePayload, type SupportRequestInput, type SupportRequestResponse } from "@pocket-vault/api-client";

import { fetchBackendJson, type BackendReadResult } from "./client";

export const submitSupportRequest = async (
  payload: SupportRequestInput,
): Promise<BackendReadResult<SupportRequestResponse>> =>
  fetchBackendJson({
    path: "/support/requests",
    fallbackMessage: "Support request could not be submitted right now.",
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    parse: parseSupportRequestResponsePayload,
  });
