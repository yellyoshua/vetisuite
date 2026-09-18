function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function matchesSearch(search: string, values: string[]): boolean {
  const normalizedSearch = normalizeText(search.trim())
  if (!normalizedSearch) {
    return true
  }

  return values.some((value) => normalizeText(value).includes(normalizedSearch))
}
