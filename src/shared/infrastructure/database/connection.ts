import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { createApplicationTables } from "@/shared/infrastructure/database/create-tables";

const DB_PATH = process.env.DB_PATH || "./data/frontend-realms.db";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqliteConnection: Database.Database | null = null;

function openSqliteDatabase(path: string): Database.Database {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  createApplicationTables(sqlite);
  return sqlite;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    sqliteConnection = openSqliteDatabase(DB_PATH);
    db = drizzle(sqliteConnection, { schema });
  }
  return db;
}

function getSqliteConnection(): Database.Database {
  if (!sqliteConnection) {
    getDb();
  }

  if (!sqliteConnection) {
    throw new Error("SQLite connection could not be opened");
  }

  return sqliteConnection;
}

// Export for use in repositories, scripts, and server actions
export { getDb, getSqliteConnection, openSqliteDatabase, schema };

// Export a function to create a fresh in-memory DB for testing
export function createTestDb() {
  const sqlite = openSqliteDatabase(":memory:");
  return drizzle(sqlite, { schema });
}
