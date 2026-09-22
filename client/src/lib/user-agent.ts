const UNKNOWN = 'Dispositivo no identificado'

const BROWSERS: [string, string][] = [
  ['Edg', 'Edge'],
  ['OPR/', 'Opera'],
  ['Opera', 'Opera'],
  ['SamsungBrowser', 'Samsung Internet'],
  ['FxiOS', 'Firefox'],
  ['Firefox/', 'Firefox'],
  ['CriOS', 'Chrome'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari'],
]

const SYSTEMS: [string, string][] = [
  ['iPhone', 'iPhone'],
  ['iPad', 'iPad'],
  ['Android', 'Android'],
  ['Windows', 'Windows'],
  ['CrOS', 'ChromeOS'],
  ['Mac OS X', 'macOS'],
  ['Macintosh', 'macOS'],
  ['Linux', 'Linux'],
]

export function deviceLabel(userAgent: unknown): string {
  if (typeof userAgent !== 'string') {
    return UNKNOWN
  }

  const parts = [labelFor(BROWSERS, userAgent), labelFor(SYSTEMS, userAgent)].filter(Boolean)

  if (parts.length === 0) {
    return UNKNOWN
  }

  return parts.join(' en ')
}

function labelFor(signatures: [string, string][], userAgent: string): string | undefined {
  return signatures.find(([token]) => userAgent.includes(token))?.[1]
}
