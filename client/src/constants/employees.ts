export const employeePositionOptions = [
  { value: 'veterinarian', label: 'Veterinario' },
  { value: 'groomer', label: 'Estilista' },
  { value: 'receptionist', label: 'Recepción' },
] as const

export type EmployeePosition = (typeof employeePositionOptions)[number]['value']

export const employeePositionValues = employeePositionOptions.map((option) => option.value) as [EmployeePosition, ...EmployeePosition[]]

export const employeePositionMap = Object.fromEntries(
  employeePositionOptions.map((option) => [option.value, option.label]),
) as Record<EmployeePosition, string>
