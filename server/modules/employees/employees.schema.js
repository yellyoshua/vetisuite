import zod from 'zod';
import {employeePositionOptions} from '@/constants/employees.js';
import {colorField, nameField} from '@/modules/accounts/accounts.schema.js';

export const createEmployeeSchema = zod.object({
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: zod.email('Email inválido').transform((email) => email.toLowerCase()),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionOptions),
  color: colorField.nullish()
});

export const updateEmployeeSchema = zod.object({
  id: zod.uuid(),
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionOptions).optional(),
  color: colorField.nullish()
});
