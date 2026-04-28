FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
ENV API_HOST="0.0.0.0"
ENV API_PORT="3001"

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY patches ./patches
COPY apps/api/package.json ./apps/api/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/contracts-sdk/package.json ./packages/contracts-sdk/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/api-client ./packages/api-client
COPY packages/config ./packages/config
COPY packages/contracts-sdk ./packages/contracts-sdk
COPY packages/shared ./packages/shared

EXPOSE 3001

CMD ["pnpm", "--filter", "@pocket-vault/api", "start"]
