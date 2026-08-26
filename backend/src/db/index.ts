import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export { schema };

let _dbInstance: any = null;

export const initDb = (databaseUrl: string) => {
  if (!_dbInstance) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
    });

    _dbInstance = drizzle(pool, { schema });
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
