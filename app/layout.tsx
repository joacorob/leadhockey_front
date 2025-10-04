import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/providers/provider'
import { I18nProvider } from '@/providers/i18n-provider'
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { getTranslator } from '@/lib/i18n/translator'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

function resolveLocale(candidate?: string | null): Locale {
  if (candidate && locales.includes(candidate as Locale)) {
    return candidate as Locale
  }

  return defaultLocale
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies()
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)
  const t = await getTranslator(locale, 'metadata')

  return {
    title: t('title'),
    description: t('description'),
    generator: 'v0.app',
    other: {
      ...Sentry.getTraceData()
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)
  const messages = await getDictionary(locale)
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale} className={`scroll-smooth ${inter.variable}`}>
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
          <I18nProvider locale={locale} messages={messages}>
            {children}
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
