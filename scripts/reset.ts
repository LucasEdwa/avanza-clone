import "dotenv/config";
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL ?? "postgres://localhost:5432/spira");
sql
  .unsafe("drop schema if exists public cascade; create schema public; drop schema if exists drizzle cascade;")
  .then(() => sql.end())
  .then(() => console.log("Database reset."));
