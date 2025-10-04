"use client"

import { createContext, useContext } from "react"

import type { Locale } from "@/lib/i18n/config"
import type { Messages } from "@/lib/i18n/dictionary"
import { createTranslator } from "@/lib/i18n/translator"

interface I18nContextValue {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: Locale
  messages: Messages
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>
}

function useI18nContext() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useTranslations must be used within an I18nProvider")
  }

  return context
}

export function useTranslations(namespace?: string) {
  const { messages } = useI18nContext()
  return createTranslator(messages, namespace)
}

export function useLocale() {
  const { locale } = useI18nContext()
  return locale
}
