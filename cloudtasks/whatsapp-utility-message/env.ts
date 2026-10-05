import { existsSync } from 'node:fs'
import { z } from 'zod'

// Se importa antes que @vetisuite/database/db.js, que lee DATABASE_URL al cargarse.
// Orden de carga: lo que ya trae el entorno gana, luego .env y por último .env.local.
const ENV_FILES = ['.env', '.env.local']

ENV_FILES.filter((file) => existsSync(file)).forEach((file) => process.loadEnvFile(file))

export const ENV_SCHEMA = z.object({
  DATABASE_URL: z.url(),
  WHATSAPP_APP_ID: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  WHATSAPP_TOKEN_ENCRYPTION_KEY: z.string().min(1),
})

export type Env = z.infer<typeof ENV_SCHEMA>

function loadEnv(): Env {
  return ENV_SCHEMA.parse(process.env)
}

export default loadEnv
