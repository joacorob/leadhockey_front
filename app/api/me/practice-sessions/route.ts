import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken: string | undefined = (token as any)?.accessToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const externalUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/me/practice-session`)
    
    // Handle status parameter specifically
    const status = searchParams.get('status')
    if (status) {
      externalUrl.searchParams.append('status', status)
    }
    
    // Copy other parameters
    searchParams.forEach((v, k) => {
      if (k !== 'status') {
        externalUrl.searchParams.append(k, v)
      }
    })

    const externalResponse = await fetch(externalUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    })

    const data = await externalResponse.json()

    if (!externalResponse.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || "Failed to fetch practice sessions" },
        { status: externalResponse.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

