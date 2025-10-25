import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

const VALID_TYPES = new Set(["VIDEO_SESSION", "DRILL"])

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get("type") ?? "VIDEO_SESSION"

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const backendUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/related-videos/${params.id}`)
    backendUrl.searchParams.set("type", type)

    const externalResponse = await fetch(backendUrl.toString(), {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    })

    const data = await externalResponse.json()

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data: data.data ?? data })
    }

    return NextResponse.json(
      { success: false, error: data?.message || "Failed to fetch related videos" },
      { status: externalResponse.status },
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("related-videos proxy error", error.message)
    } else {
      console.error("related-videos proxy unknown error", error)
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}


