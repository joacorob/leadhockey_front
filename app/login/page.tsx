"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthForm } from "@/components/forms/auth-form"
import { SocialAuth } from "@/components/forms/social-auth"
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (formData: any) => {
    setIsLoading(true)

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      rememberMe: String(formData.rememberMe),
      redirect: false
    })

    setIsLoading(false)

    if (!result || result.ok === false) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      })
      return
    }

    router.push("/dashboard")
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your LEAD Hockey account" showBackButton={false}>
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
