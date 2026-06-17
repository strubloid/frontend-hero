import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { createApplicationTables } from "@/shared/infrastructure/database/create-tables";

export function createTables(sqlite: Database.Database) {
  createApplicationTables(sqlite);
  return drizzle(sqlite, { schema });
}
