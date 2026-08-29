import { asc, count, eq, ilike } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { clients } from "@/drizzle/clients/clients.table.js";

type NewClient = typeof clients.$inferInsert;
export type Client = typeof clients.$inferSelect;

export async function findMany({ search, limit, offset }: { search?: string; limit: number; offset: number }) {
  const where = search ? ilike(clients.name, `%${search}%`) : undefined;
  const [rows, [total]] = await Promise.all([
    db.select().from(clients).where(where).orderBy(asc(clients.name)).limit(limit).offset(offset),
    db.select({ value: count() }).from(clients).where(where),
  ]);
  return { rows, total: total?.value ?? 0 };
}

export async function findById(id: string) {
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return row ?? null;
}

export async function insert(values: NewClient) {
  const [row] = await db.insert(clients).values(values).returning();
  return row;
}
