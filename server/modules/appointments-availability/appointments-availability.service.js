import {and, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {appointmentsAvailabilityTable} from '@vetisuite/database/schemas/schemas.js';

export async function updateAppointmentsAvailability (organization, data) {
  const {id: _id, ...values} = data;

  const [existing] = await db.select({id: appointmentsAvailabilityTable.id})
  .from(appointmentsAvailabilityTable)
  .where(and(eq(appointmentsAvailabilityTable.organization, organization), isNull(appointmentsAvailabilityTable.archivedAt)))
  .limit(1);

  if (existing) {
    const [availability] = await db.update(appointmentsAvailabilityTable)
    .set({...values, updatedAt: new Date()})
    .where(and(eq(appointmentsAvailabilityTable.id, existing.id), isNull(appointmentsAvailabilityTable.archivedAt)))
    .returning();

    return {availability};
  }

  const [availability] = await db.insert(appointmentsAvailabilityTable)
  .values({organization, ...values})
  .returning();

  return {availability};
}
