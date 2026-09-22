const DEFAULT_LOCALE = 'es-EC'

type DateValue = Date | string | number

export function formatDate(value: DateValue, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value))
}

export function formatDateTime(value: DateValue, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(normalizeDateValue(value))
}

function normalizeDateValue(value: DateValue): Date {
  if (value instanceof Date) {
    return value
  }

  return new Date(value)
}
