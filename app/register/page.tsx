"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthForm } from "@/components/forms/auth-form"
import { SocialAuth } from "@/components/forms/social-auth"
import { useTranslations } from "@/providers/i18n-provider"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations("auth.register")

  const handleRegister = async (formData: any) => {
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert(t("passwordMismatch"))
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      alert(t("acceptTerms"))
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")} showBackButton={false}>
      <div className="space-y-6">
        <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />

        <SocialAuth type="register" />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("haveAccount")} {" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              {t("cta")}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
