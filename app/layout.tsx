import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MobileNav } from '@/components/layout/mobile-nav'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className={inter.className}>
        {children}
        <MobileNav />
        <div className="pb-16 md:pb-0" /> {/* Bottom padding for mobile nav */}
      </body>
    </html>
  )
}
