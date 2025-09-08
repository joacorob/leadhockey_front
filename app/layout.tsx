import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/providers/provider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LEAD Hockey - Training Platform',
  description: 'Professional hockey training platform with video sessions and drills',
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <MobileNav />
        <div className="pb-16 md:pb-0" /> {/* Bottom padding for mobile nav */}
      </body>
    </html>
  )
}
