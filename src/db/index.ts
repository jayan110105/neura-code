import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as authSchema from './auth-schema'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!, {
  max: 20,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  prepare: false,
  types: {
    bigint: postgres.BigInt,
  },
})

export const db = drizzle(client, { schema: { ...schema, ...authSchema } })
