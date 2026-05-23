import HomeClient from './components/HomePage'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  let accountId: number | null = null

  if (token) {
    try {
      const decoded = jwt.decode(token) as { sub?: string } | null

      if (decoded?.sub) {
        accountId = Number(decoded.sub)
      }
    } catch {
      accountId = null
    }
  }

  return <HomeClient initialAccountId={accountId} />
}