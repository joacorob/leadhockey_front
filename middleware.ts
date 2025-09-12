import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Only handle internal API routes.
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  try {
    // Retrieve NextAuth token (stored in cookies) and extract the accessToken we save in callbacks
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken = (token as any)?.accessToken as string | undefined

    // Debug: 
    console.log("[middleware] accessToken", accessToken)

    if (accessToken) {
      // Clone headers so we can append Authorization
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("Authorization", `Bearer ${accessToken}`)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  } catch (error) {
    // In case of errors just continue the chain without modifying the request
    console.error("[middleware] Failed to attach access token", error)
  }

  return NextResponse.next()
}

// Apply this middleware only to /api routes
export const config = {
  matcher: "/api/:path*",
}
