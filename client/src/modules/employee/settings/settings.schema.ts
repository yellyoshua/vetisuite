import { z } from 'zod'
import { SETTINGS_SECTION_VALUES } from '@/constants/settings'

type SettingsSectionId = (typeof SETTINGS_SECTION_VALUES)[number]

type SettingsFieldBase = {
  name: string
  label: string
  value: string
  isLocked?: boolean
  note?: string
  isWide?: boolean
}

export type SettingsField =
  | (SettingsFieldBase & { type: 'text' | 'email' | 'tel' })
  | (SettingsFieldBase & { type: 'select'; options: string[] })

type SettingsToggle = {
  name: string
  label: string
  hint: string
  isChecked: boolean
}

export type SettingsSection = {
  id: SettingsSectionId
  title: string
  description: string
  fields: SettingsField[]
  toggles: SettingsToggle[]
}

export type ApiOrganization = {
  id: string
  name: string
  timezone: string
}

export type SettingsValues = {
  fields: Record<string, string>
  toggles: Record<string, boolean>
}

export type SettingsUpdate = {
  section: SettingsSectionId
  values: SettingsValues
}

function fieldSchema(field: SettingsField): z.ZodType<string, string> {
  if (field.type === 'select') {
    return z.enum(field.options, { error: `${field.label}: elige una opción de la lista` })
  }

  if (field.type === 'email') {
    return z.email({ error: `${field.label}: escribe un correo válido` })
  }

  const requiredMessage = `${field.label}: es obligatorio`

  return z.string({ error: requiredMessage }).trim().min(1, requiredMessage)
}

export function settingsValuesSchema(section: SettingsSection) {
  const editableFields = section.fields.filter((field) => !field.isLocked)

  return z.object({
    fields: z.object(Object.fromEntries(editableFields.map((field) => [field.name, fieldSchema(field)] as const))),
    toggles: z.object(
      Object.fromEntries(
        section.toggles.map((toggle) => [toggle.name, z.boolean({ error: `${toggle.label}: valor no válido` })] as const),
      ),
    ),
  })
}
