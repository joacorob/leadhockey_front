"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useTranslations } from "@/providers/i18n-provider"

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AuthForm({ type, onSubmit, isLoading = false }: AuthFormProps) {
  const tCommon = useTranslations("auth.common")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    agreeToTerms: false,
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {type === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{tCommon("firstNameLabel")}</Label>
            <Input
              id="firstName"
              type="text"
              placeholder={tCommon("firstNamePlaceholder")}
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{tCommon("lastNameLabel")}</Label>
            <Input
              id="lastName"
              type="text"
              placeholder={tCommon("lastNamePlaceholder")}
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{tCommon("emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={tCommon("emailPlaceholder")}
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{tCommon("passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={tCommon("passwordPlaceholder")}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {type === "register" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{tCommon("confirmPasswordLabel")}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={tCommon("confirmPasswordPlaceholder")}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {type === "login" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm font-normal">
            {tCommon("rememberMe")}
          </Label>
        </div>
      )}

      {type === "register" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
            required
          />
          <Label htmlFor="agreeToTerms" className="text-sm font-normal">
            {tCommon("termsAgreementPrefix")} {" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              {tCommon("terms")}
            </a>{" "}
            {tCommon("termsAgreementAnd")}{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              {tCommon("privacy")}
            </a>
          </Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {type === "login" ? tCommon("submitLogin") : tCommon("submitRegister")}
      </Button>
    </form>
  )
}
