import * as Sentry from '@sentry/nextjs';
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

export function generateMetadata(): Metadata {
  return {
    title: 'LEAD Hockey - Training Platform',
    description: 'Professional hockey training platform with video sessions and drills',
    generator: 'v0.app',
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            data-domain="app.leadfieldhockey.com"
            src="https://plausible.jrcrypto.dev/js/script.js"
          ></script>
        )}
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
