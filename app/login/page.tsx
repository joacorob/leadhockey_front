"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthForm } from "@/components/forms/auth-form"
import { SocialAuth } from "@/components/forms/social-auth"
import { useTranslations } from "@/providers/i18n-provider"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations("auth.login")

  const handleLogin = async (formData: any) => {
    setIsLoading(true)

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      rememberMe: String(formData.rememberMe),
      redirect: false
    })

    setIsLoading(false)

    if (result?.error) {
      // TODO: show toast or error message
      console.error(result.error)
      return
    }

    router.push("/dashboard")
  }

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")} showBackButton={false}>
      <div className="space-y-6">
        <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />

        <SocialAuth type="login" />

        <div className="text-center space-y-2">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            {t("forgotPassword")}
          </Link>

          <p className="text-sm text-gray-600">
            {t("noAccount")} {" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              {t("cta")}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
