import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function GET(request: NextRequest) {
  try {
    // Extract access token from NextAuth token cookie
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken: any = (token as any)?.accessToken

    // Try to fetch from external API first
    try {
      const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/categories`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const externalData = await externalResponse.json()
      // console.log(externalData, 'externalData')
      return NextResponse.json({ success: true, data: externalData })
      
    } catch (externalError: any) {
      console.log("External API failed, falling back to mock data", externalError)
      console.log("External API failed, falling back to mock data")
      // If external API fails, forward the error
      return NextResponse.json({ success: false, error: `${externalError?.message || 'Failed to fetch categories'}` }, { status: 502 })
    }

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    // Forward create request to backend API
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken: string | undefined = (token as any)?.accessToken

    const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ name, description, color, icon }),
    })

    const data = await externalResponse.json()

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data }, { status: 201 })
    }

    return NextResponse.json({ success: false, error: data?.message || "Failed to create category" }, { status: externalResponse.status })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}