export type StaffUser = {
  name: string
  roleLabel: string
}

type StaffLayoutData = {
  user: StaffUser
  openVisitCountsByPath: Record<string, number>
}

const STAFF_USER: StaffUser = {
  name: 'Dra. María Torres',
  roleLabel: 'Veterinaria · staff',
}

const OPEN_VISIT_COUNTS_BY_PATH: Record<string, number> = {
  '/reception-visits': 7,
  '/visits': 3,
  '/grooming-visits': 2,
  '/lab-visits': 2,
}

export default function resolveStaffLayout(): Promise<StaffLayoutData> {
  return Promise.resolve({
    user: STAFF_USER,
    openVisitCountsByPath: OPEN_VISIT_COUNTS_BY_PATH,
  })
}
