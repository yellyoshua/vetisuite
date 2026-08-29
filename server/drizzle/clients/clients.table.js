import { index, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/** Dueños de las mascotas. Raíz del expediente: todo cuelga de aquí. */
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 160 }),
    // dinero en numeric, nunca float — redondeo binario en saldos es un bug de facturación
    debt: numeric("debt", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("clients_name_idx").on(t.name)],
);
