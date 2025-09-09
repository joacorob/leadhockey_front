import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function GET(request: NextRequest) {
  try {
    // Retrieve the NextAuth session token (JWT) stored in the cookie
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken: string | undefined = (token as any)?.accessToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Forward the request to the LEAD backend
    const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    })

    const data = await externalResponse.json()

    if (!externalResponse.ok) {
      return NextResponse.json({ success: false, error: data?.message || "Failed to fetch user info" }, { status: externalResponse.status })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
