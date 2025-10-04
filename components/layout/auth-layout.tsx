"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useTranslations } from "@/providers/i18n-provider"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showBackButton?: boolean
}

export function AuthLayout({ children, title, subtitle, showBackButton = true }: AuthLayoutProps) {
  const t = useTranslations("auth.layout")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-end">
          <LanguageSwitcher />
        </div>
        {showBackButton && (
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/login" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Link>
          </Button>
        )}

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <Image
                  src="https://uploadthingy.s3.us-west-1.amazonaws.com/nzVf7cqEycpaU4k9WPUBYZ/LEAD_logo.png"
                  alt="LEAD Hockey"
                  width={120}
                  height={40}
                  className="h-10 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-2">{subtitle}</p>
              </div>

              {children}
            </div>

            {/* Demo Notice */}
            {/* <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Demo Mode:</strong> This is a demonstration page. No actual authentication is performed.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
