import { timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import type { ApiRuntimeEnv } from "../../env";

const internalAccessHeader = "x-goal-vault-internal-token";

const isLoopbackIp = (value: string | undefined) => {
  if (!value) {
    return false;
  }

  return value === "127.0.0.1" || value === "::1" || value === "::ffff:127.0.0.1";
};

const hasMatchingToken = (expected: string | null, provided: string | undefined) => {
  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};

export const isInternalRequestAuthorized = ({
  env,
  request,
}: {
  env: ApiRuntimeEnv;
  request: FastifyRequest;
}) => {
  const headerValue = request.headers[internalAccessHeader];
  const providedToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (hasMatchingToken(env.internalToken, providedToken)) {
    return true;
  }

  return env.environment === "development" && !env.internalToken && isLoopbackIp(request.ip);
};

export const requireInternalRequestAccess = async ({
  env,
  reply,
  request,
}: {
  env: ApiRuntimeEnv;
  reply: FastifyReply;
  request: FastifyRequest;
}) => {
  if (isInternalRequestAuthorized({ env, request })) {
    return true;
  }

  await reply.status(401).send({
    message: "This Goal Vault route requires internal access.",
  });

  return false;
};

export const internalAccessHeaderName = internalAccessHeader;
