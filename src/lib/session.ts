import { cache } from 'react'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const getCachedSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}) 