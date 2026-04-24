import { clientEnv, getBackendBaseUrl } from "../env/client";

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
  parse,
}: {
  path: string;
  fallbackMessage: string;
  init?: RequestInit;
  parse?: (payload: unknown) => T;
}): Promise<BackendReadResult<T>> => {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return {
      status: "unavailable",
      data: null,
      message: "Some Goal Vault services are still being prepared.",
      responseStatus: null,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), clientEnv.apiTimeoutMs);

  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });

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
      data: parse ? parse(await response.json()) : ((await response.json()) as T),
      message: null,
      responseStatus: response.status,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Goal Vault took too long to reach the latest app data."
          : error instanceof Error && error.message.toLowerCase().includes("network")
            ? "Goal Vault could not reach the latest app data right now."
          : fallbackMessage,
      responseStatus: null,
    };
  } finally {
    clearTimeout(timeout);
  }
};
