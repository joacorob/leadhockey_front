import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "categoryId is required" },
        { status: 400 },
      )
    }

    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const externalUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/watch`)
    searchParams.forEach((value, key) => {
      externalUrl.searchParams.set(key, value)
    })

    const externalResponse = await fetch(externalUrl.toString(), {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    const data = await externalResponse.json()

    if (!externalResponse.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to fetch watch content" },
        { status: externalResponse.status },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

