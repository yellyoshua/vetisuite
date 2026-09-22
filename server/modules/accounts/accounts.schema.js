import zod from 'zod';
import {employeePositionOptions} from '@/constants/employees.js';
import permissionsRegistry from '@/permissions/permissions.js';

const PERMISSION_REGEX = /^(superadmin|owner|employee)::[a-z0-9-]+::general$/;

export const nameField = (label) => zod.string().trim().min(2, `El ${label} debe tener al menos 2 caracteres`);

export const colorField = zod.string().regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un hexadecimal #RRGGBB');

const userCreateSchema = zod.object({
  email: zod.email('Email inválido').transform((email) => email.toLowerCase()),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const userUpdateSchema = zod.object({
  id: zod.uuid('El userId debe ser un UUID válido').optional(),
  email: zod.email('Email inválido').transform((email) => email.toLowerCase()).optional(),
  disabled: zod.boolean().optional()
});

const profileId = zod.uuid('El id del perfil debe ser un UUID válido');

const organization = zod.uuid('La organización debe ser un UUID válido');

export const createSuperadminAccountSchema = zod.object({
  organization,
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  avatar: zod.string().nullish(),
  user: userCreateSchema
});

export const updateSuperadminAccountSchema = zod.object({
  id: profileId,
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  avatar: zod.string().nullish(),
  user: userUpdateSchema
});

export const createOwnerAccountSchema = zod.object({
  organization,
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  phone: zod.string().nullish(),
  description: zod.string().nullish(),
  position: zod.string().nullish(),
  occupation: zod.string().nullish(),
  avatar: zod.string().nullish(),
  user: userCreateSchema
});

export const updateOwnerAccountSchema = zod.object({
  id: profileId,
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  phone: zod.string().nullish(),
  description: zod.string().nullish(),
  position: zod.string().nullish(),
  occupation: zod.string().nullish(),
  avatar: zod.string().nullish(),
  user: userUpdateSchema
});

export const createEmployeeAccountSchema = zod.object({
  organization,
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionOptions),
  color: colorField.nullish(),
  avatar: zod.string().nullish(),
  user: userCreateSchema
});

export const updateEmployeeAccountSchema = zod.object({
  id: profileId,
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  phone: zod.string().nullish(),
  position: zod.enum(employeePositionOptions).optional(),
  color: colorField.nullish(),
  avatar: zod.string().nullish(),
  user: userUpdateSchema
});

function validatePermissionsArray (permissions, context) {
  const seen = new Set();

  permissions.forEach((permission) => {
    if (!PERMISSION_REGEX.test(permission)) {
      context.addIssue({code: 'custom', message: `Formato de permiso inválido: ${permission}`});

      return;
    }

    if (!(permission in permissionsRegistry.permissions.named)) {
      context.addIssue({code: 'custom', message: `Permiso inexistente: ${permission}`});

      return;
    }

    if (seen.has(permission)) {
      context.addIssue({code: 'custom', message: `Permiso duplicado: ${permission}`});

      return;
    }

    seen.add(permission);
  });
}

export const findAccountPermissionsSchema = zod.object({id: zod.uuid()});

export const updateAccountPermissionsSchema = zod.object({
  id: zod.uuid(),
  permissions: zod.array(zod.string()).superRefine(validatePermissionsArray)
});

export const disableAccountSchema = zod.object({
  id: zod.uuid(),
  disabled: zod.boolean()
});
