import { z } from 'zod'

export const ENV_SCHEMA = z.object({
  DATABASE_URL: z.url(),
  MAIL_API_KEY: z.string().min(1),
  MAIL_FROM_ADDRESS: z.email(),
})

export type Env = z.infer<typeof ENV_SCHEMA>

function loadEnv(): Env {
  throw new Error('Not implemented: loadEnv')
}

export default loadEnv
