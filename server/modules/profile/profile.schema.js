import zod from 'zod';
import {isImageFile} from '@/utils/file-checker.js';
import validators from '@/utils/validators.js';
import {nameField} from '@/modules/accounts/accounts.schema.js';

const avatarField = (profile) => zod
.string()
.refine(isImageFile, 'La foto debe ser una imagen')
.refine((value) => validators.isOwnFile(value, profile.user.id, profile.avatar), 'La foto no pertenece a esta cuenta')
.nullish();

const emailField = zod.email('Email inválido').transform((email) => email.toLowerCase());

const superadminProfileSchema = (profile) => zod.object({
  avatar: avatarField(profile),
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: emailField
});

const ownerProfileSchema = (profile) => zod.object({
  avatar: avatarField(profile),
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: emailField,
  phone: zod.string().nullish(),
  description: zod.string().max(500, 'La descripción no debe superar los 500 caracteres').nullish(),
  position: zod.string().nullish(),
  occupation: zod.string().nullish()
});

const employeeProfileSchema = (profile) => zod.object({
  avatar: avatarField(profile),
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: emailField,
  phone: zod.string().nullish()
});

const schemasByRole = {
  superadmin: superadminProfileSchema,
  owner: ownerProfileSchema,
  employee: employeeProfileSchema
};

export function profileSchema (profile) {
  return schemasByRole[profile.user.role](profile);
}

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Debes ingresar tu contraseña actual'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Debes confirmar la nueva contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export const emptyBodySchema = zod.object({}).optional();
