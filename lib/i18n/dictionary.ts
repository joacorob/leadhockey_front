import type { Locale } from "./config"

const dictionaries = {
  en: () => import("@/messages/en.json"),
  fr: () => import("@/messages/fr.json"),
  nl: () => import("@/messages/nl.json"),
}

export type Messages = Awaited<ReturnType<(typeof dictionaries)[keyof typeof dictionaries]>> extends {
  default: infer T
}
  ? T
  : never

export async function getDictionary(locale: Locale): Promise<Messages> {
  const loader = dictionaries[locale] ?? dictionaries.en
  const dictionaryModule = await loader()
  return dictionaryModule.default
}
