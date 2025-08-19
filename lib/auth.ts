import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

interface BackendLoginResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar?: string
      subscription?: string
    }
    token: string
    expiresAt: string
  }
  message?: string
}

export const authOptions: NextAuthOptions = {
  // Use the same secret across sign-in and API routes so that getToken() can properly decode the JWT
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const res = await fetch(`${process.env.LEAD_BACKEND}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe === "true"
            })
          })

          const json: BackendLoginResponse = await res.json()

          if (!json.success || !json.data) {
            return null
          }

          const { user, token } = json.data

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
          } as any
        } catch (error) {
          console.error("NextAuth authorize error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist the bearer token to the next token
        token.accessToken = (user as any).token
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      // Expose the bearer token and role inside the session
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken
      }
      if (token?.role) {
        (session.user as any).role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
}
