import { NextResponse } from "next/server"
import { headers } from "next/headers"

// POST /api/stripe/create-checkout
// Body: { tier: string }
export async function POST(request: Request) {
  try {
    const { tier } = await request.json()

    // Domain used to build success / cancel URLs
    const domain = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const backendBase = process.env.LEAD_BACKEND ?? "https://tu-dominio.com"

    // Try to forward the Authorization header (JWT) if it exists
    const authHeader = request.headers.get("authorization") ?? headers().get("authorization") ?? ""

    console.log({tier, domain, backendBase})

    const backendResponse = await fetch(
      `${backendBase}/api/v1/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify({
          tier: tier || "premium",
          success_url: `${domain}/dashboard/settings?checkout=success`,
          cancel_url: `${domain}/dashboard/settings?checkout=cancel`,
        }),
      }
    )

    const data = await backendResponse.json()

    if (data?.success && data.data?.url) {
      return NextResponse.json({ url: data.data.url }, { status: 200 })
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  } catch (error) {
    console.error("Stripe checkout creation error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
