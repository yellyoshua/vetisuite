export const OWNERS_DISABLE_MODAL = 'owners-disable'

export const OWNERS_DISABLE_PARAMS = ['owner', 'disabled'] as const

export const SUPERADMINS_DISABLE_MODAL = 'superadmins-disable'

export const SUPERADMINS_DISABLE_PARAMS = ['superadmin', 'disabled'] as const

export const EMPLOYEES_DISABLE_MODAL = 'employees-disable'

export const EMPLOYEES_DISABLE_PARAMS = ['employee', 'disabled'] as const

export const MODAL_PARAM_KEYS: readonly string[] = [
  ...OWNERS_DISABLE_PARAMS,
  ...SUPERADMINS_DISABLE_PARAMS,
  ...EMPLOYEES_DISABLE_PARAMS,
]
