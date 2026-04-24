import type { FastifyBaseLogger } from "fastify";

import type { ObservabilitySignal } from "@goal-vault/shared";

type LoggerLike = Pick<FastifyBaseLogger, "info" | "warn" | "error"> | null | undefined;

export const logObservabilitySignal = (logger: LoggerLike, signal: ObservabilitySignal) => {
  if (!logger) {
    return;
  }

  const level = signal.status === "failed" ? "error" : signal.status === "degraded" ? "warn" : "info";
  logger[level](
    {
      observability: signal,
    },
    signal.message,
  );
};
