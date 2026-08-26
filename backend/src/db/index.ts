import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export { schema };

let _dbInstance: any = null;

type DbRuntimeMode = "worker" | "node";

const DB_TIMEOUTS = {
  worker: {
    connectionTimeoutMs: 1500,
    queryTimeoutMs: 3000,
    statementTimeoutMs: 3000,
    idleTimeoutMs: 5000,
  },
  node: {
    connectionTimeoutMs: 5000,
    queryTimeoutMs: 10000,
    statementTimeoutMs: 10000,
    idleTimeoutMs: 10000,
  },
} as const;

function detectRuntimeMode(): DbRuntimeMode {
  const hasWindow = typeof (globalThis as any).window !== "undefined";
  const hasDocument = typeof (globalThis as any).document !== "undefined";
  if (hasWindow || hasDocument) {
    return "node";
  }

  const hasWebSocketPair =
    typeof (globalThis as any).WebSocketPair !== "undefined";
  return hasWebSocketPair ? "worker" : "node";
}

export const initDb = (
  databaseUrl: string,
  mode: DbRuntimeMode = detectRuntimeMode(),
) => {
  if (!_dbInstance) {
    const timeoutConfig = DB_TIMEOUTS[mode];
    const pool = new Pool({
      connectionString: databaseUrl,
      max: mode === "worker" ? 1 : 5,
      connectionTimeoutMillis: timeoutConfig.connectionTimeoutMs,
      idleTimeoutMillis: timeoutConfig.idleTimeoutMs,
      query_timeout: timeoutConfig.queryTimeoutMs,
      statement_timeout: timeoutConfig.statementTimeoutMs,
      keepAlive: true,
      allowExitOnIdle: true,
    });

    _dbInstance = drizzle(pool, { schema });

    console.log(
      `[DB] Initialized in ${mode} mode (connect=${timeoutConfig.connectionTimeoutMs}ms, query=${timeoutConfig.queryTimeoutMs}ms, statement=${timeoutConfig.statementTimeoutMs}ms).`,
    );
  }
};

export const db = new Proxy({} as any, {
  get: (_, prop) => {
    if (!_dbInstance) {
      throw new Error(
        "Database is not initialized. Please call initDb(databaseUrl) before accessing the db instance.",
      );
    }
    return _dbInstance[prop];
  },
});
