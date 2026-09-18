export type ListQuery = {
  search?: string
  limit: number
  offset: number
}

export type ListResult<TRow> = {
  rows: TRow[]
  total: number
}

export function withClinicScope<TFilters extends Record<string, unknown>>(
  _clinicId: string,
  _filters: TFilters,
): TFilters & { clinicId: string } {
  throw new Error('Not implemented: withClinicScope')
}
