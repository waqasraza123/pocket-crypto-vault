import { clientEnv } from "../env/client";

export interface BackendReadResult<T> {
  status: "success" | "unavailable" | "error" | "not_found";
  data: T | null;
  message: string | null;
  responseStatus: number | null;
}

const readErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const fetchBackendJson = async <T>({
  path,
  fallbackMessage,
  init,
}: {
  path: string;
  fallbackMessage: string;
  init?: RequestInit;
}): Promise<BackendReadResult<T>> => {
  if (!clientEnv.apiBaseUrl) {
    return {
      status: "unavailable",
      data: null,
      message: "Goal Vault backend is not configured.",
      responseStatus: null,
    };
  }

  try {
    const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, init);

    if (response.status === 404) {
      return {
        status: "not_found",
        data: null,
        message: await readErrorMessage(response, fallbackMessage),
        responseStatus: response.status,
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        data: null,
        message: await readErrorMessage(response, fallbackMessage),
        responseStatus: response.status,
      };
    }

    return {
      status: "success",
      data: (await response.json()) as T,
      message: null,
      responseStatus: response.status,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      message: error instanceof Error ? error.message : fallbackMessage,
      responseStatus: null,
    };
  }
};
