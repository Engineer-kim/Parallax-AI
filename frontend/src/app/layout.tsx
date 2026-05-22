import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parallax AI',
  description: 'Multi-model AI comparison',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}