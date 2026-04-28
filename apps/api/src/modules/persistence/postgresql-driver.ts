import { createRequire } from "node:module";

import { PostgresqlPooledQueryExecutor, type PostgresqlPool } from "./postgresql-runtime";
import type { PostgresqlQueryExecutor } from "./postgresql-store";

interface PgPoolConstructor {
  new (options: { connectionString: string }): PostgresqlPool;
}

interface PgModule {
  Pool: PgPoolConstructor;
}

interface NeonModule {
  Pool: PgPoolConstructor;
  neonConfig: {
    webSocketConstructor: unknown;
  };
}

export type PostgresqlDriverName = "pg" | "neon";

export interface PostgresqlDriverOptions {
  connectionString: string;
  driver?: PostgresqlDriverName;
}

export interface PostgresqlSchemaCheckResult {
  ready: boolean;
  missingTables: string[];
}

const require = createRequire(import.meta.url);

const requiredPostgresqlTables = ["vaults", "vault_events", "sync_states", "analytics_events", "support_requests"] as const;

const loadPgModule = (): PgModule => {
  const module = require("pg") as Partial<PgModule>;

  if (typeof module.Pool !== "function") {
    throw new Error("PostgreSQL driver package did not expose a Pool constructor.");
  }

  return { Pool: module.Pool };
};

const loadWsConstructor = () => {
  const module = require("ws") as unknown;
  const webSocketConstructor =
    typeof module === "function" ? module : (module as { default?: unknown } | null)?.default;

  if (typeof webSocketConstructor !== "function") {
    throw new Error("Neon PostgreSQL driver requires the ws WebSocket constructor.");
  }

  return webSocketConstructor;
};

const loadNeonModule = (): PgModule => {
  const module = require("@neondatabase/serverless") as Partial<NeonModule>;

  if (typeof module.Pool !== "function" || !module.neonConfig) {
    throw new Error("Neon PostgreSQL driver package did not expose a Pool constructor.");
  }

  module.neonConfig.webSocketConstructor = loadWsConstructor();

  return { Pool: module.Pool };
};

export const createPostgresqlQueryExecutor = (options: PostgresqlDriverOptions) => {
  const { Pool } = options.driver === "neon" ? loadNeonModule() : loadPgModule();
  const pool = new Pool({ connectionString: options.connectionString });

  return new PostgresqlPooledQueryExecutor({ pool });
};

export const checkPostgresqlConnection = async (executor: PostgresqlQueryExecutor) => {
  await executor.query("SELECT 1");
};

export const checkPostgresqlSchema = async (
  executor: PostgresqlQueryExecutor,
  schemaName: string,
): Promise<PostgresqlSchemaCheckResult> => {
  const result = await executor.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = $1
       AND table_name = ANY($2::text[])`,
    [schemaName, requiredPostgresqlTables],
  );
  const existingTables = new Set(result.rows.map((row) => row.table_name));
  const missingTables = requiredPostgresqlTables.filter((tableName) => !existingTables.has(tableName));

  return {
    ready: missingTables.length === 0,
    missingTables,
  };
};

export const assertPostgresqlRuntimeReady = async (executor: PostgresqlQueryExecutor, schemaName: string) => {
  await checkPostgresqlConnection(executor);

  const schemaCheck = await checkPostgresqlSchema(executor, schemaName);

  if (!schemaCheck.ready) {
    throw new Error(`PostgreSQL persistence schema is missing tables: ${schemaCheck.missingTables.join(", ")}.`);
  }
};
