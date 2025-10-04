"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/providers/i18n-provider"

interface SocialAuthProps {
  type: "login" | "register"
}

export function SocialAuth({ type }: SocialAuthProps) {
  const tLogin = useTranslations("auth.login")
  const tRegister = useTranslations("auth.register")
  const handleSocialAuth = (provider: string) => {
    alert(`This is a demo - ${provider} authentication would be implemented here`)
  }

  const intro = type === "login" ? tLogin("socialIntro") : tRegister("socialIntro")

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">{intro}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => handleSocialAuth("Google")} className="w-full">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <Button variant="outline" onClick={() => handleSocialAuth("Apple")} className="w-full">
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C8.396 0 8.025.044 6.79.207 5.56.37 4.703.644 3.967 1.007c-.74.364-1.379.85-2.009 1.48C1.329 3.117.843 3.756.48 4.496.116 5.231-.158 6.089-.32 7.318-.484 8.553-.528 8.924-.528 12.545s.044 3.992.207 5.227c.163 1.229.437 2.087.8 2.822.364.74.85 1.379 1.48 2.009.63.63 1.269 1.116 2.009 1.48.735.364 1.593.638 2.822.8 1.235.164 1.606.208 5.227.208s3.992-.044 5.227-.207c1.229-.163 2.087-.437 2.822-.8.74-.365 1.379-.85 2.009-1.48.63-.63 1.116-1.269 1.48-2.009.364-.735.638-1.593.8-2.822.164-1.235.208-1.606.208-5.227s-.044-3.992-.207-5.227c-.163-1.229-.437-2.087-.8-2.822-.365-.74-.85-1.379-1.48-2.009C20.883 1.329 20.244.843 19.504.48 18.769.116 17.911-.158 16.682-.32 15.447-.484 15.076-.528 11.455-.528s-3.992.044-5.227.207c-1.229.163-2.087.437-2.822.8-.74.365-1.379.85-2.009 1.48C.767 3.589.281 4.228-.082 4.968c-.364.735-.638 1.593-.8 2.822C-.646 8.025-.69 8.396-.69 12.017s.044 3.992.207 5.227c.163 1.229.437 2.087.8 2.822.365.74.85 1.379 1.48 2.009.63.63 1.269 1.116 2.009 1.48.735.364 1.593.638 2.822.8 1.235.164 1.606.208 5.227.208s3.992-.044 5.227-.207c1.229-.163 2.087-.437 2.822-.8.74-.365 1.379-.85 2.009-1.48.63-.63 1.116-1.269 1.48-2.009.364-.735.638-1.593.8-2.822.164-1.235.208-1.606.208-5.227s-.044-3.992-.207-5.227c-.163-1.229-.437-2.087-.8-2.822C23.269.843 22.63.357 21.89-.006 21.155-.37 20.297-.644 19.068-.807 17.833-.97 17.462-1.014 13.841-1.014s-3.992.044-5.227.207c-1.229.163-2.087.437-2.822.8-.74.365-1.379.85-2.009 1.48-.63.63-1.116 1.269-1.48 2.009-.364.735-.638 1.593-.8 2.822C-.646 8.025-.69 8.396-.69 12.017z" />
          </svg>
          Apple
        </Button>
      </div>
    </div>
  )
}
