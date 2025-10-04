"use client"

import { useTransition, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"

import { setLocale } from "@/actions/set-locale"
import { locales, type Locale } from "@/lib/i18n/config"
import { useLocale, useTranslations } from "@/providers/i18n-provider"

const localeLabels: Record<Locale, string> = {
  en: "languageSwitcher.options.en",
  fr: "languageSwitcher.options.fr",
  nl: "languageSwitcher.options.nl",
}

export function LanguageSwitcher() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale

    startTransition(async () => {
      await setLocale(nextLocale)
      router.refresh()
    })
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <span>{t("languageSwitcher.label")}</span>
      <select
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={locale}
        onChange={handleChange}
        disabled={isPending}
      >
        {locales.map((value) => (
          <option key={value} value={value}>
            {t(localeLabels[value])}
          </option>
        ))}
      </select>
    </label>
  )
}
