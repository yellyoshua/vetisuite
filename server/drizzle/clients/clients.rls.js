/**
 * Políticas RLS de `clients`. Pareja de `clients.table.js`.
 *
 * Vacío a propósito: todavía no hay tenant ni roles en el proyecto.
 *
 * Cada política es un **export con nombre propio**. Un array de políticas
 * (`export const clientsPolicies = [...]`) drizzle-kit lo ignora en silencio:
 * recorre los exports del módulo buscando instancias de `PgPolicy`, no dentro
 * de colecciones. Comprobado — la migración salía vacía.
 *
 * `.link(tabla)` ya emite `ALTER TABLE … ENABLE ROW LEVEL SECURITY`; no hace
 * falta `.enableRLS()` en el `.table.js`.
 *
 * Forma:
 *
 *   import { sql } from "drizzle-orm";
 *   import { pgPolicy } from "drizzle-orm/pg-core";
 *   import { clients } from "./clients.table.js";
 *
 *   export const clientsTenantIsolation = pgPolicy("clients_tenant_isolation", {
 *     for: "all",
 *     to: "authenticated",
 *     using: sql`tenant_id = current_setting('app.tenant_id')::uuid`,
 *   }).link(clients);
 *
 * Ojo al añadir la primera: desde ese momento la tabla queda con RLS activo y
 * todo lo que no cubra una política se deniega.
 */
