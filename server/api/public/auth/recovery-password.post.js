import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import {resetPassword} from '@/modules/profile/profile.service.js';

const recoveryPasswordSchema = zod.object({
  token: zod.string().min(1, 'Token requerido'),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export default baseRoute(async (data) => {
  return resetPassword({token: data.token, password: data.password});
}, recoveryPasswordSchema);
