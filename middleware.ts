import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow requests to login page and NextAuth as they don't require auth
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  try {
    // Retrieve NextAuth token (stored in cookies) and extract the accessToken we save in callbacks
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken = (token as any)?.accessToken as string | undefined

    // Debug: 
    console.log("[middleware] accessToken", accessToken)

    if (accessToken) {
      // If the request is for an internal API route, attach the Authorization header
      if (pathname.startsWith("/api")) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("Authorization", `Bearer ${accessToken}`)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }

      // For non-API routes simply continue
      return NextResponse.next()
    }
  } catch (error) {
    // In case of errors just continue the chain without modifying the request
    console.error("[middleware] Failed to attach access token", error)
  }

  // No token found – redirect to login
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  return NextResponse.redirect(loginUrl, 301)
}

// Apply this middleware only to /api routes
export const config = {
  // Protect everything except static files, the login page, and NextAuth routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)",
    "/api/:path*",
  ],
}
