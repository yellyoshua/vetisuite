import {and, count, eq, gte, sql} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappMessagesTable} from '@vetisuite/database/schemas/schemas.js';
import {dateInTimeZone, isSupportedTimeZone} from '@/utils/timezone.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const SENT_STATUSES = ['sent', 'delivered', 'read'];

const DELIVERED_STATUSES = ['delivered', 'read'];

// Las cifras salen de los mensajes que la plataforma registra (envíos de la cola, estados y entrantes
// del webhook): la API de Meta no expone un conteo de recibidos y solo guarda un año de envíos.
export async function getWhatsappAnalytics (organization, {days}, timezone) {
  const dates = lastDays(days, timezone);

  const rows = await groupedMessages(organization, days, timezone);
  const inRange = rows.filter((row) => dates.includes(row.day));

  return {
    days,
    totals: totalsOf(inRange),
    daily: dates.map((date) => ({
      date,
      sent: sumOf(inRange, (row) => row.day === date && isApiSent(row)),
      received: sumOf(inRange, (row) => row.day === date && row.direction === 'inbound')
    }))
  };
}

async function groupedMessages (organization, days, timezone) {
  if (!isSupportedTimeZone(timezone)) {
    throw {error: 'La zona horaria de la organización no es válida', status: 500};
  }

  const messages = whatsappMessagesTable;
  const day = sql`to_char(${messages.createdAt} at time zone '${sql.raw(timezone)}', 'YYYY-MM-DD')`;
  const hasTemplate = sql`${messages.template} is not null`;

  return db.select({day, direction: messages.direction, status: messages.status, hasTemplate, total: count()})
  .from(messages)
  .where(and(eq(messages.organization, organization), gte(messages.createdAt, new Date(Date.now() - (days + 1) * DAY_MS))))
  .groupBy(day, messages.direction, messages.status, hasTemplate);
}

function lastDays (days, timezone) {
  return Array.from({length: days}, (_unused, index) => dateInTimeZone(new Date(Date.now() - (days - 1 - index) * DAY_MS), timezone));
}

function isApiSent (row) {
  return row.direction === 'outbound' && row.hasTemplate && SENT_STATUSES.includes(row.status);
}

function sumOf (rows, predicate) {
  return rows.filter(predicate).reduce((total, row) => total + row.total, 0);
}

function totalsOf (rows) {
  return {
    queued: sumOf(rows, (row) => row.direction === 'outbound' && row.status === 'queued'),
    sent: sumOf(rows, isApiSent),
    delivered: sumOf(rows, (row) => row.direction === 'outbound' && row.hasTemplate && DELIVERED_STATUSES.includes(row.status)),
    read: sumOf(rows, (row) => row.direction === 'outbound' && row.hasTemplate && row.status === 'read'),
    failed: sumOf(rows, (row) => row.direction === 'outbound' && row.status === 'failed'),
    received: sumOf(rows, (row) => row.direction === 'inbound'),
    sentFromApp: sumOf(rows, (row) => row.direction === 'outbound' && !row.hasTemplate && row.status === 'sent')
  };
}
