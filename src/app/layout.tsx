import type { Metadata } from 'next'
import './globals.css'
import { AuthHashHandler } from '@/components/auth/auth-hash-handler'

export const metadata: Metadata = {
  title: 'Practice Porter',
  description: 'Admin Dashboard for Dental Offices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <AuthHashHandler />
        {children}
      </body>
    </html>
  )
}
