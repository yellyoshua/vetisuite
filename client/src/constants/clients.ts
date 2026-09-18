export const PATIENT_SPECIES_VALUES = ['dog', 'cat', 'bird', 'other'] as const

export const PATIENT_SPECIES_LABELS: Record<(typeof PATIENT_SPECIES_VALUES)[number], string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  other: 'Otro',
}

export const PATIENT_SPECIES = PATIENT_SPECIES_VALUES.map((value) => ({
  value,
  label: PATIENT_SPECIES_LABELS[value],
}))
