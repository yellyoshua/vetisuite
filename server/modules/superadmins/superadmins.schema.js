import zod from 'zod';
import {isImageFile} from '@/utils/file-checker.js';
import {nameField} from '@/modules/accounts/accounts.schema.js';

const avatarField = zod.string().refine(isImageFile, 'La foto debe ser una imagen').nullish();

export const createSuperadminSchema = zod.object({
  firstName: nameField('nombre'),
  lastName: nameField('apellido'),
  email: zod.email('Email inválido').transform((email) => email.toLowerCase()),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  avatar: avatarField
});

export const updateSuperadminSchema = zod.object({
  id: zod.uuid(),
  firstName: nameField('nombre').optional(),
  lastName: nameField('apellido').optional(),
  avatar: avatarField
});
