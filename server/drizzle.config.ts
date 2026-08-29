import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  // un glob por tipo de archivo: así `migrations/` nunca entra por accidente
  schema: ["./drizzle/*/*.table.js", "./drizzle/*/*.rls.js"],
  out: "./drizzle/migrations",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
