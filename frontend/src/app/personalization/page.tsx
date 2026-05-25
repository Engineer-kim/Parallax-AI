import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import PersonalizationClient from '../components/PersonalizationPage'

export default async function PersonalizationPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    redirect('/error')
  }

  let accountId: number | null = null
  try {
    const decoded = jwt.decode(token) as { sub?: string } | null
    if (decoded?.sub) {
      accountId = Number(decoded.sub)
    }
  } catch {
    redirect('/error')
  }

  return <PersonalizationClient accountId={accountId} />
}
