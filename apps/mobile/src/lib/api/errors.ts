import type { ApiReadStatus } from "./schemas";

export const isBackendReadFailure = (status: ApiReadStatus) => status === "error" || status === "unavailable" || status === "not_found";
