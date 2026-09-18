import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from './postgres'
import * as schema from './schemas/schemas'

export const db = drizzle(postgres(process.env.DATABASE_URL as string), { schema, casing: 'snake_case' })
