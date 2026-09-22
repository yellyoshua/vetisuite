import zod from 'zod';
import {canonicalExtension} from '@/utils/file-checker.js';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const uploadsSchema = zod.object({
  name: zod
  .string()
  .min(1, 'El archivo debe tener un nombre')
  .max(255, 'El nombre del archivo es demasiado largo')
  .refine((name) => canonicalExtension(name), 'Tipo de archivo no permitido'),
  size: zod.coerce
  .number('El tamaño del archivo no es válido')
  .int('El tamaño del archivo no es válido')
  .positive('El archivo está vacío')
  .max(MAX_FILE_SIZE, 'El archivo no debe superar los 10 MB'),
  type: zod.string().max(255).optional()
});

export default uploadsSchema;
