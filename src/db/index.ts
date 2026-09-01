import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      global._postgresPool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        max: 15,
        connectionTimeoutMillis: 5000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || process.env.POSTGRES_HOST || process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.SQL_PORT || process.env.POSTGRES_PORT || process.env.DB_PORT || 5432),
        user: process.env.SQL_USER || process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.SQL_DB_NAME || process.env.POSTGRES_DB || process.env.DB_NAME || '2date_db',
        max: 15,
        connectionTimeoutMillis: 5000,
      });
    }

    global._postgresPool.on('error', (_err) => {
      // Gracefully capture idle pool connection attempts
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
