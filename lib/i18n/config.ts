export const locales = ["en", "fr", "nl"] as const

export type Locale = typeof locales[number]

export const defaultLocale: Locale = "en"
