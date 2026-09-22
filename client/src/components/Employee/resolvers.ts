type EmployeeLayoutData = {
  openVisitCountsByPath: Record<string, number>
}

const OPEN_VISIT_COUNTS_BY_PATH: Record<string, number> = {
  '/reception-visits': 7,
  '/visits': 3,
  '/grooming-visits': 2,
  '/lab-visits': 2,
}

export default function resolveEmployeeLayout(): Promise<EmployeeLayoutData> {
  return Promise.resolve({
    openVisitCountsByPath: OPEN_VISIT_COUNTS_BY_PATH,
  })
}
