import { HealthResponseSchema, ServiceHealthResponseSchema } from "./schemas";

export const parseHealthPayload = (payload: unknown) => HealthResponseSchema.parse(payload);

export const parseServiceHealthPayload = (payload: unknown) => ServiceHealthResponseSchema.parse(payload);
