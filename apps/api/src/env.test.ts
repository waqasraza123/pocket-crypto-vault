import assert from "node:assert/strict";
import test from "node:test";

import { readApiRuntimeEnv } from "./env";

test("API runtime defaults to SQLite persistence and pg PostgreSQL driver", () => {
  const env = readApiRuntimeEnv({});

  assert.equal(env.persistence.driver, "sqlite");
  assert.equal(env.persistence.postgresqlDriver, "pg");
  assert.equal(env.persistence.runtimeReady, true);
  assert.equal(env.persistence.postgresUrlConfigured, false);
});

test("API runtime accepts Neon as the PostgreSQL driver", () => {
  const env = readApiRuntimeEnv({
    API_PERSISTENCE_DRIVER: "postgresql",
    API_POSTGRES_DRIVER: "neon",
    API_DATABASE_URL: "postgresql://goal_vault:secret@example.neon.tech/goal_vault?sslmode=require",
    API_PERSISTENCE_SCHEMA_NAME: "goal_vault_api",
  });

  assert.equal(env.persistence.driver, "postgresql");
  assert.equal(env.persistence.postgresqlDriver, "neon");
  assert.equal(env.persistence.postgresUrlConfigured, true);
  assert.equal(env.persistence.runtimeReady, true);
  assert.equal(env.persistence.postgresConnectionString?.includes("secret"), true);
  assert.deepEqual(env.validationErrors, []);
});

test("API runtime rejects ambiguous SQLite and PostgreSQL mixed mode", () => {
  const env = readApiRuntimeEnv({
    API_PERSISTENCE_DRIVER: "sqlite",
    API_POSTGRES_DRIVER: "neon",
    API_DATABASE_URL: "postgresql://goal_vault:secret@example.neon.tech/goal_vault?sslmode=require",
    API_PERSISTENCE_SCHEMA_NAME: "goal_vault_api",
  });

  assert.equal(env.persistence.driver, "sqlite");
  assert.match(env.validationErrors.join(" "), /API_DATABASE_URL must not be configured/);
  assert.match(env.validationErrors.join(" "), /API_POSTGRES_DRIVER must not be configured/);
  assert.match(env.validationErrors.join(" "), /API_PERSISTENCE_SCHEMA_NAME must not be configured/);
});

test("API runtime requires PostgreSQL for production activation", () => {
  const env = readApiRuntimeEnv({
    EXPO_PUBLIC_APP_ENV: "production",
    API_PUBLIC_BASE_URL: "https://api.pocket-vault.example",
    API_INTERNAL_TOKEN: "internal-token",
  });

  assert.equal(env.environment, "production");
  assert.equal(env.persistence.driver, "sqlite");
  assert.match(env.validationErrors.join(" "), /Production activation requires API_PERSISTENCE_DRIVER=postgresql/);
});
