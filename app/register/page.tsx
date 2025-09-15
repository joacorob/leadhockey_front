"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthForm } from "@/components/forms/auth-form"
import { SocialAuth } from "@/components/forms/social-auth"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (formData: any) => {
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy")
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
    <AuthLayout title="Create Account" subtitle="Join LEAD Hockey and start your training journey" showBackButton={false}>
      <div className="space-y-6">
        <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />

        <SocialAuth type="register" />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
