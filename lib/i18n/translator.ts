import type { Locale } from "./config"
import type { Messages } from "./dictionary"
import { getDictionary } from "./dictionary"

function resolvePath(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, messages)
}

function formatMessage(message: string, values?: Record<string, string | number>): string {
  if (!values) return message

  return message.replace(/\{(\w+)\}/g, (_, placeholder: string) => {
    const value = values[placeholder]
    return value !== undefined ? String(value) : ""
  })
}

export function createTranslator(messages: Messages, namespace?: string) {
  return (key: string, values?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    const result = resolvePath(messages, fullKey)

    if (typeof result === "string") {
      return formatMessage(result, values)
    }

    return fullKey
  }
}

export async function getTranslator(locale: Locale, namespace?: string) {
  const messages = await getDictionary(locale)
  return createTranslator(messages, namespace)
}
