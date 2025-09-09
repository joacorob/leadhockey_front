import { NextResponse } from "next/server"
import { headers } from "next/headers"

// POST /api/stripe/create-portal
export async function POST() {
  try {
    const domain = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const backendBase = process.env.LEAD_BACKEND ?? "https://tu-dominio.com"

    const authHeader = headers().get("authorization") ?? ""

    const backendResponse = await fetch(
      `${backendBase}/api/v1/stripe/create-billing-portal-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify({
          return_url: `${domain}/billing`,
        }),
      }
    )

    const data = await backendResponse.json()

    if (data?.success && data.data?.url) {
      return NextResponse.json({ url: data.data.url }, { status: 200 })
    }

    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    )
  } catch (error) {
    console.error("Stripe billing portal creation error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
