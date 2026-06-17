import { getSqliteConnection } from "../src/shared/infrastructure/database/connection";

const sqlite = getSqliteConnection();
const tables = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all() as { name: string }[];

console.log(`Database ready: ${tables.map((table) => table.name).join(", ")}`);
