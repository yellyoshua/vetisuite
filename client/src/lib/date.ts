const DEFAULT_LOCALE = 'es-EC'

const WALL_CLOCK_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

export const UTC_TIME_ZONE = 'UTC'

export const TIME_ZONE_VALUES: string[] = [
  UTC_TIME_ZONE,
  ...Intl.supportedValuesOf('timeZone').filter((timeZone) => timeZone !== UTC_TIME_ZONE),
]

type DateValue = Date | string | number

export function formatDate(value: DateValue, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value))
}

export function formatDateTime(value: DateValue, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value))
}

export function formatWallClock(value: string, timezone: string, options: Intl.DateTimeFormatOptions = {}): string {
  const formatted = new Intl.DateTimeFormat(DEFAULT_LOCALE, { ...options, timeZone: UTC_TIME_ZONE }).format(parseWallClock(value))
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return timezone === browserTimeZone ? formatted : `${formatted} (${timezone})`
}

function parseWallClock(value: string): Date {
  const match = WALL_CLOCK_PATTERN.exec(value)
  if (!match) {
    throw new Error(`La fecha "${value}" no tiene el formato YYYY-MM-DDTHH:mm:ss.`)
  }
  const [year, month, day, hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0))

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
}

function normalizeDateValue(value: DateValue): Date {
  if (value instanceof Date) {
    return value
  }

  return new Date(value)
}
