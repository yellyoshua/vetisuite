import zod from 'zod'
import { employeePositionValues } from '@/constants/employees'

const colorField = zod.union([
  zod.string().regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un hexadecimal #RRGGBB'),
  zod.literal(''),
]).nullish()

export const createEmployeeSchema = zod.object({
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('Email inválido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionValues, 'Selecciona un cargo'),
  color: colorField,
})

export const updateEmployeeSchema = zod.object({
  firstName: zod.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionValues, 'Selecciona un cargo'),
  color: colorField,
})

export type CreateEmployeeValues = zod.infer<typeof createEmployeeSchema>

export type UpdateEmployeeValues = zod.infer<typeof updateEmployeeSchema>

export type Employee = {
  id: string
  avatar: string | null
  firstName: string
  lastName: string
  phone: string | null
  position: CreateEmployeeValues['position']
  color: string | null
  createdAt: string
  user: {
    id: string
    email: string
    emailConfirmed: boolean
    lastSignInAt: string | null
    disabled: boolean
  }
}
