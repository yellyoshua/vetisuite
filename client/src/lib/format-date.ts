const DATE_FORMAT = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })

const SHORT_MONTH_LENGTH = 3

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export function formatDate(isoDate: string): string {
  return DATE_FORMAT.formatToParts(parseLocalDate(isoDate))
    .map((part) => (part.type === 'month' ? part.value.replace('.', '').slice(0, SHORT_MONTH_LENGTH) : part.value))
    .join('')
}
