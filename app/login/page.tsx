"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthForm } from "@/components/forms/auth-form"
import { SocialAuth } from "@/components/forms/social-auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (formData: any) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your LEAD Hockey account">
      <div className="space-y-6">
        <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />

        <SocialAuth type="login" />

        <div className="text-center space-y-2">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>

          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
