"use server"

import { cookies } from "next/headers"

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config"

export async function setLocale(locale: Locale) {
  const targetLocale = locales.includes(locale) ? locale : defaultLocale
  cookies().set("NEXT_LOCALE", targetLocale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}
