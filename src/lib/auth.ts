import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import { nextCookies } from 'better-auth/next-js'
import { user } from '@/db/auth-schema'
import { eq } from 'drizzle-orm'

export const auth = betterAuth({
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [nextCookies()],
})

export const getUserByPhoneNumber = async (phoneNumber: string) => {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))

  return existingUser
}
