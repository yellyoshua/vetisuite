import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "../clients/clients.table.js";

/** Mascotas. Siempre pertenecen a un cliente. */
export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    species: varchar("species", { length: 32 }).notNull(),
    breed: varchar("breed", { length: 80 }),
    ageMonths: integer("age_months"),
    aggressive: boolean("aggressive").notNull().default(false),
    allergies: text("allergies").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("patients_client_id_idx").on(t.clientId)],
);
