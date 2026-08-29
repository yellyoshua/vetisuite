import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

// ponytail: una conexión por contenedor Lambda (`max: 1`). Cada invocación es
// secuencial, así que un pool grande solo agota los slots de Postgres.
// Subir a un pooler (RDS Proxy / pgBouncer) cuando haya concurrencia real.
const sql = postgres(process.env.DATABASE_URL ?? "", { max: 1, prepare: false });

/** Único punto de acceso a la base. Nadie más instancia un cliente Postgres. */
export const db = drizzle(sql, { schema, casing: "snake_case" });
